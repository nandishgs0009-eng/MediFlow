import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTreatmentSchema, insertMedicineSchema, insertIntakeLogSchema, medicines } from "@shared/schema";
import { db } from "./db";
import { count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const SALT_ROUNDS = 10;

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // PostgreSQL session store
  const PgSession = connectPgSimple(session);

  // Session middleware with PostgreSQL backing
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Auth middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();
  };

  const requireRole = (role: string) => {
    return (req: any, res: any, next: any) => {
      if (req.user.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    };
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        role: data.role || "patient",
      });
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      // Allow login with either username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
    // Destroy session in the background (fire and forget)
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
    });
  });

  // Treatment routes
  app.get("/api/treatments", requireAuth, async (req: any, res) => {
    try {
      const treatments = await storage.getTreatmentsByPatient(req.user.id);
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treatments", requireAuth, async (req: any, res) => {
    try {
      const data = insertTreatmentSchema.parse({
        ...req.body,
        patientId: req.user.id,
      });
      const treatment = await storage.createTreatment(data);
      res.json(treatment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Medicine routes
  app.get("/api/medicines/:treatmentId", requireAuth, async (req: any, res) => {
    try {
      const medicines = await storage.getMedicinesByTreatment(req.params.treatmentId);
      res.json(medicines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/medicines/detail/:medicineId", requireAuth, async (req: any, res) => {
    try {
      const medicine = await storage.getMedicine(req.params.medicineId);
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/medicines", requireAuth, async (req: any, res) => {
    try {
      const data = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(data);
      res.json(medicine);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Intake log routes
  app.get("/api/intake-logs/recent/:medicineId", requireAuth, async (req: any, res) => {
    try {
      const log = await storage.getRecentIntakeLog(req.params.medicineId);
      res.json(log || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intake-logs/today/:medicineId", requireAuth, async (req: any, res) => {
    try {
      const log = await storage.getTodayIntakeLog(req.params.medicineId);
      res.json(log || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intake-logs/today-all", requireAuth, async (req: any, res) => {
    try {
      const logs = await storage.getTodayIntakeLogs(req.user.id);
      res.json(logs || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // History routes
  app.get("/api/history/treatment/:treatmentId", requireAuth, async (req: any, res) => {
    try {
      const history = await storage.getTreatmentHistory(req.params.treatmentId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/history/medicine/:medicineId", requireAuth, async (req: any, res) => {
    try {
      const history = await storage.getMedicineIntakeHistory(req.params.medicineId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health Summary routes
  app.get("/api/health/daily-adherence", requireAuth, async (req: any, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const adherence = await storage.getDailyAdherence(req.user.id, days);
      res.json(adherence);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health/monthly-adherence", requireAuth, async (req: any, res) => {
    try {
      const months = req.query.months ? parseInt(req.query.months) : 12;
      const adherence = await storage.getMonthlyAdherence(req.user.id, months);
      res.json(adherence);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Patient profile route
  app.get("/api/patient/profile", requireAuth, async (req: any, res) => {
    try {
      // Fetch the latest user data from the database instead of using the stale req.user from the session
      const freshUser = await storage.getUser(req.user.id);
      if (!freshUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = freshUser;
      const treatments = await storage.getTreatmentsByPatient(req.user.id);
      res.json({
        user: userWithoutPassword,
        treatmentCount: treatments.length,
        activeTreatments: treatments.filter(t => t.status === 'active').length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update patient profile
  app.patch("/api/patient/profile", requireAuth, async (req: any, res) => {
    try {
      const { fullName, email } = req.body;
      
      // Validate email uniqueness if changed
      if (email && email !== req.user.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      const updated = await storage.updateUser(req.user.id, { fullName, email });
      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });



  app.post("/api/intake-logs", requireAuth, async (req: any, res) => {
    try {
      const data = insertIntakeLogSchema.parse(req.body);
      const log = await storage.createIntakeLog(data, req.user.id);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Adherence calculation
  app.get("/api/adherence/:treatmentId", requireAuth, async (req: any, res) => {
    try {
      const adherence = await storage.getTreatmentAdherence(req.params.treatmentId);
      res.json(adherence);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, requireRole("admin"), async (req: any, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      
      // Get total medicines count
      const medicinesResult = await db
        .select({ value: sql`count(*)` })
        .from(medicines);
      
      const totalMedicines = parseInt(String(medicinesResult[0]?.value || "0"));
      
      res.json({
        totalPatients: stats.totalPatients,
        activeTreatments: stats.activeTreatments,
        totalMedicines: totalMedicines,
        adherenceRate: Math.round(stats.averageAdherence),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/patients", requireAuth, requireRole("admin"), async (req: any, res) => {
    try {
      const users = await storage.getAllPatients();
      const patientStats = await storage.getPatientStats();
      
      // Combine user data with stats
      const patientsWithStats = users.map(user => {
        const stats = patientStats.find(p => p.id === user.id);
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt,
          treatmentCount: stats?.treatmentCount || 0,
          activeTreatments: stats?.activeTreatments || 0,
        };
      });
      
      res.json(patientsWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/patients/:patientId", requireAuth, requireRole("admin"), async (req: any, res) => {
    try {
      const { patientId } = req.params;
      
      // Delete patient and all related data (cascading delete)
      await storage.deletePatient(patientId);
      
      res.json({ success: true, message: "Patient deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all patients with detailed information (treatments and medicines)
  app.get("/api/admin/patients/detailed/all", requireAuth, requireRole("admin"), async (req: any, res) => {
    try {
      const detailedPatients = await storage.getDetailedPatientInfo();
      res.json(detailedPatients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
