import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTreatmentSchema, insertMedicineSchema, insertIntakeLogSchema } from "@shared/schema";
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
      secret: process.env.SESSION_SECRET!,
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
      const user = await storage.getUserByUsername(username);
      
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
    req.session.destroy(() => {
      res.json({ success: true });
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

  app.post("/api/intake-logs", requireAuth, async (req: any, res) => {
    try {
      const data = insertIntakeLogSchema.parse(req.body);
      const log = await storage.createIntakeLog(data);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Adherence calculation
  app.get("/api/adherence/:treatmentId", requireAuth, async (req: any, res) => {
    try {
      const medicines = await storage.getMedicinesByTreatment(req.params.treatmentId);
      
      let totalDoses = 0;
      let takenDoses = 0;

      for (const medicine of medicines) {
        const logs = await storage.getIntakeLogsByMedicine(medicine.id);
        const taken = logs.filter(log => log.status === "taken").length;
        const total = logs.length;
        
        totalDoses += total;
        takenDoses += taken;
      }

      const percentage = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

      res.json({
        percentage,
        taken: takenDoses,
        total: totalDoses,
      });
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
      const patients = await storage.getAllPatients();
      const totalPatients = patients.length;

      let activeTreatments = 0;
      let totalAdherence = 0;
      let lowAdherenceCount = 0;

      for (const patient of patients) {
        const treatments = await storage.getTreatmentsByPatient(patient.id);
        activeTreatments += treatments.filter(t => t.status === "active").length;

        for (const treatment of treatments) {
          const medicines = await storage.getMedicinesByTreatment(treatment.id);
          let treatmentTaken = 0;
          let treatmentTotal = 0;

          for (const medicine of medicines) {
            const logs = await storage.getIntakeLogsByMedicine(medicine.id);
            treatmentTotal += logs.length;
            treatmentTaken += logs.filter(log => log.status === "taken").length;
          }

          const adherence = treatmentTotal > 0 ? (treatmentTaken / treatmentTotal) * 100 : 0;
          totalAdherence += adherence;
          if (adherence < 70) lowAdherenceCount++;
        }
      }

      const averageAdherence = activeTreatments > 0 ? totalAdherence / activeTreatments : 0;

      res.json({
        totalPatients,
        activeTreatments,
        averageAdherence,
        lowAdherenceCount,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/patients", requireAuth, requireRole("admin"), async (req: any, res) => {
    try {
      const patients = await storage.getAllPatients();
      
      const patientStats = await Promise.all(
        patients.map(async (patient) => {
          const treatments = await storage.getTreatmentsByPatient(patient.id);
          let totalTaken = 0;
          let totalDoses = 0;

          for (const treatment of treatments) {
            const medicines = await storage.getMedicinesByTreatment(treatment.id);
            for (const medicine of medicines) {
              const logs = await storage.getIntakeLogsByMedicine(medicine.id);
              totalDoses += logs.length;
              totalTaken += logs.filter(log => log.status === "taken").length;
            }
          }

          const adherenceRate = totalDoses > 0 ? (totalTaken / totalDoses) * 100 : 0;

          return {
            userId: patient.id,
            fullName: patient.fullName,
            email: patient.email,
            treatmentCount: treatments.length,
            adherenceRate,
            lastActivity: patient.createdAt,
          };
        })
      );

      res.json(patientStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
