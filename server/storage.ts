import {
  users,
  treatments,
  medicines,
  intakeLogs,
  notifications,
  type User,
  type InsertUser,
  type Treatment,
  type InsertTreatment,
  type Medicine,
  type InsertMedicine,
  type IntakeLog,
  type InsertIntakeLog,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lt, count, getTableColumns } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  getAllPatients(): Promise<User[]>;

  // Treatments
  getTreatment(id: string): Promise<Treatment | undefined>;
  getTreatmentsByPatient(patientId: string): Promise<Treatment[]>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: string, treatment: Partial<InsertTreatment>): Promise<Treatment>;
  deleteTreatment(id: string): Promise<void>;

  // Medicines
  getMedicine(id: string): Promise<Medicine | undefined>;
  getMedicinesByTreatment(treatmentId: string): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine>;
  deleteMedicine(id: string): Promise<void>;

  // Intake Logs
  getIntakeLog(id: string): Promise<IntakeLog | undefined>;
  getIntakeLogsByMedicine(medicineId: string): Promise<IntakeLog[]>;
  getRecentIntakeLog(medicineId: string): Promise<IntakeLog | undefined>;
  getTodayIntakeLog(medicineId: string): Promise<IntakeLog | undefined>;
  getTodayIntakeLogs(userId: string): Promise<IntakeLog[]>;
  createIntakeLog(log: InsertIntakeLog, patientId: string): Promise<IntakeLog>;

  // Adherence
  getTreatmentAdherence(treatmentId: string): Promise<{ percentage: number; taken: number; total: number }>;

  // Medicine History
  getMedicineIntakeHistory(medicineId: string): Promise<IntakeLog[]>;
  getTreatmentHistory(treatmentId: string): Promise<any>;
  getDailyAdherence(userId: string, days: number): Promise<any[]>;
  getMonthlyAdherence(userId: string, months: number): Promise<any[]>;

  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;

  // Admin
  getPatientStats(): Promise<any[]>;
  getAdminDashboardStats(): Promise<any>;
  deletePatient(patientId: string): Promise<void>;
  getDetailedPatientInfo(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllPatients(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "patient"));
  }

  // Treatments
  async getTreatment(id: string): Promise<Treatment | undefined> {
    const [treatment] = await db.select().from(treatments).where(eq(treatments.id, id));
    return treatment || undefined;
  }

  async getTreatmentsByPatient(patientId: string): Promise<Treatment[]> {
    return await db
      .select()
      .from(treatments)
      .where(eq(treatments.patientId, patientId))
      .orderBy(desc(treatments.createdAt));
  }

  async createTreatment(treatment: InsertTreatment): Promise<Treatment> {
    const [newTreatment] = await db.insert(treatments).values(treatment).returning();
    return newTreatment;
  }

  async updateTreatment(id: string, treatment: Partial<InsertTreatment>): Promise<Treatment> {
    const [updated] = await db
      .update(treatments)
      .set(treatment)
      .where(eq(treatments.id, id))
      .returning();
    return updated;
  }

  async deleteTreatment(id: string): Promise<void> {
    await db.delete(treatments).where(eq(treatments.id, id));
  }

  // Medicines
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const [medicine] = await db.select().from(medicines).where(eq(medicines.id, id));
    return medicine || undefined;
  }

  async getMedicinesByTreatment(treatmentId: string): Promise<Medicine[]> {
    return await db
      .select()
      .from(medicines)
      .where(eq(medicines.treatmentId, treatmentId))
      .orderBy(medicines.name);
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const [newMedicine] = await db.insert(medicines).values(medicine).returning();
    return newMedicine;
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine> {
    const [updated] = await db
      .update(medicines)
      .set(medicine)
      .where(eq(medicines.id, id))
      .returning();
    return updated;
  }

  async deleteMedicine(id: string): Promise<void> {
    await db.delete(medicines).where(eq(medicines.id, id));
  }

  // Intake Logs
  async getIntakeLog(id: string): Promise<IntakeLog | undefined> {
    const [log] = await db.select().from(intakeLogs).where(eq(intakeLogs.id, id));
    return log || undefined;
  }

  async getIntakeLogsByMedicine(medicineId: string): Promise<IntakeLog[]> {
    return await db
      .select()
      .from(intakeLogs)
      .where(eq(intakeLogs.medicineId, medicineId))
      .orderBy(desc(intakeLogs.scheduledTime));
  }

  async getRecentIntakeLog(medicineId: string): Promise<IntakeLog | undefined> {
    const [log] = await db
      .select()
      .from(intakeLogs)
      .where(eq(intakeLogs.medicineId, medicineId))
      .orderBy(desc(intakeLogs.createdAt))
      .limit(1);
    return log || undefined;
  }

  async getTodayIntakeLog(medicineId: string): Promise<IntakeLog | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [log] = await db
      .select()
      .from(intakeLogs)
      .where(
        and(
          eq(intakeLogs.medicineId, medicineId),
          gte(intakeLogs.scheduledTime, today),
          lt(intakeLogs.scheduledTime, tomorrow)
        )
      );
    return log || undefined;
  }

  async getTodayIntakeLogs(userId: string): Promise<IntakeLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select({ ...getTableColumns(intakeLogs) })
      .from(intakeLogs)
      .innerJoin(medicines, eq(intakeLogs.medicineId, medicines.id))
      .innerJoin(treatments, eq(medicines.treatmentId, treatments.id))
      .where(
        and(
          eq(treatments.patientId, userId),
          gte(intakeLogs.scheduledTime, today),
          lt(intakeLogs.scheduledTime, tomorrow)
        )
      );
  }

  async createIntakeLog(log: InsertIntakeLog, patientId: string): Promise<IntakeLog> {
    // Check if medicine already taken today
    const todayLogs = await this.getTodayIntakeLogs(patientId);
    if (todayLogs.some(l => l.medicineId === log.medicineId)) {
      throw new Error("This medicine has already been taken today");
    }

    // Convert string dates to Date objects if needed
    const processedLog = {
      ...log,
      scheduledTime: typeof log.scheduledTime === 'string' ? new Date(log.scheduledTime) : log.scheduledTime,
      takenTime: log.takenTime ? (typeof log.takenTime === 'string' ? new Date(log.takenTime) : log.takenTime) : null,
    };
    const [newLog] = await db.insert(intakeLogs).values(processedLog).returning();
    return newLog;
  }

  // Adherence
  async getTreatmentAdherence(treatmentId: string): Promise<{ percentage: number; taken: number; total: number; }> {
    const takenCount = sql<number>`count(case when ${intakeLogs.status} = 'taken' then 1 end)`.mapWith(Number);
    const totalCount = count(intakeLogs.id);

    const result = await db
        .select({
            taken: takenCount,
            total: totalCount
        })
        .from(intakeLogs)
        .innerJoin(medicines, eq(intakeLogs.medicineId, medicines.id))
        .where(eq(medicines.treatmentId, treatmentId));

    const { taken, total } = result[0] || { taken: 0, total: 0 };
    const percentage = total > 0 ? (taken / total) * 100 : 0;

    return { percentage, taken, total };
  }

  // Notifications
  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  // Medicine History - get all intake logs for a specific medicine
  async getMedicineIntakeHistory(medicineId: string): Promise<any[]> {
    return await db
      .select()
      .from(intakeLogs)
      .where(eq(intakeLogs.medicineId, medicineId))
      .orderBy(desc(intakeLogs.scheduledTime));
  }

  // Treatment History - get all medicines and their intake logs for a treatment
  async getTreatmentHistory(treatmentId: string): Promise<any> {
    const treatmentMedicines = await db
      .select()
      .from(medicines)
      .where(eq(medicines.treatmentId, treatmentId));

    const medicinesWithHistory = await Promise.all(
      treatmentMedicines.map(async (medicine) => {
        const history = await this.getMedicineIntakeHistory(medicine.id);
        return {
          ...medicine,
          intakeLogs: history,
        };
      })
    );

    return medicinesWithHistory;
  }

  // Health Summary - get daily adherence stats
  async getDailyAdherence(userId: string, days: number = 30): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select({
        date: sql<string>`DATE(${intakeLogs.scheduledTime})`.as('date'),
        totalScheduled: count(intakeLogs.id),
        totalTaken: sql<number>`count(case when ${intakeLogs.status} = 'taken' then 1 end)`.mapWith(Number),
      })
      .from(intakeLogs)
      .innerJoin(medicines, eq(intakeLogs.medicineId, medicines.id))
      .innerJoin(treatments, eq(medicines.treatmentId, treatments.id))
      .where(
        and(
          eq(treatments.patientId, userId),
          gte(intakeLogs.scheduledTime, startDate),
          lt(intakeLogs.scheduledTime, endDate)
        )
      )
      .groupBy(sql<string>`DATE(${intakeLogs.scheduledTime})`)
      .orderBy(sql<string>`DATE(${intakeLogs.scheduledTime})`);

    return results.map(r => ({
      date: r.date,
      totalScheduled: r.totalScheduled,
      totalTaken: r.totalTaken,
      percentage: r.totalScheduled > 0 ? (r.totalTaken / r.totalScheduled) * 100 : 0,
    }));
  }

  // Health Summary - get monthly adherence stats
  async getMonthlyAdherence(userId: string, months: number = 12): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const results = await db
      .select({
        yearMonth: sql<string>`TO_CHAR(${intakeLogs.scheduledTime}, 'YYYY-MM')`.as('year_month'),
        totalScheduled: count(intakeLogs.id),
        totalTaken: sql<number>`count(case when ${intakeLogs.status} = 'taken' then 1 end)`.mapWith(Number),
      })
      .from(intakeLogs)
      .innerJoin(medicines, eq(intakeLogs.medicineId, medicines.id))
      .innerJoin(treatments, eq(medicines.treatmentId, treatments.id))
      .where(
        and(
          eq(treatments.patientId, userId),
          gte(intakeLogs.scheduledTime, startDate),
          lt(intakeLogs.scheduledTime, endDate)
        )
      )
      .groupBy(sql<string>`TO_CHAR(${intakeLogs.scheduledTime}, 'YYYY-MM')`)
      .orderBy(sql<string>`TO_CHAR(${intakeLogs.scheduledTime}, 'YYYY-MM')`);

    return results.map(r => ({
      month: r.yearMonth,
      totalScheduled: r.totalScheduled,
      totalTaken: r.totalTaken,
      percentage: r.totalScheduled > 0 ? (r.totalTaken / r.totalScheduled) * 100 : 0,
    }));
  }

  // Admin
  async getPatientStats(): Promise<any[]> {
    const { password, ...userCols } = getTableColumns(users);
    
    const patientStats = await db
      .select({
        ...userCols,
        treatmentCount: count(treatments.id),
        adherenceRate: sql<number>`COALESCE(SUM(CASE WHEN ${intakeLogs.status} = 'taken' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(${intakeLogs.id}), 0), 0)`.mapWith(Number),
      })
      .from(users)
      .leftJoin(treatments, eq(users.id, treatments.patientId))
      .leftJoin(medicines, eq(treatments.id, medicines.treatmentId))
      .leftJoin(intakeLogs, eq(medicines.id, intakeLogs.medicineId))
      .where(eq(users.role, "patient"))
      .groupBy(users.id);

    return patientStats;
  }

  async getAdminDashboardStats(): Promise<any> {
    const patientStats = await this.getPatientStats();
    const totalPatients = patientStats.length;
    
    const activeTreatmentsResult = await db
      .select({ value: count() })
      .from(treatments)
      .where(eq(treatments.status, "active"));

    const activeTreatments = activeTreatmentsResult[0]?.value || 0;

    const totalAdherence = patientStats.reduce((acc, p) => acc + (p.adherenceRate || 0), 0);
    const averageAdherence = totalPatients > 0 ? totalAdherence / totalPatients : 0;
    const lowAdherenceCount = patientStats.filter(p => (p.adherenceRate || 0) < 70).length;

    return {
      totalPatients,
      activeTreatments,
      averageAdherence,
      lowAdherenceCount,
    };
  }

  async deletePatient(patientId: string): Promise<void> {
    // Delete patient (cascading delete will handle related records due to foreign keys)
    await db.delete(users).where(eq(users.id, patientId));
  }

  async getDetailedPatientInfo(): Promise<any[]> {
    // Get all patients
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "patient"));

    // For each patient, get their treatments and medicines
    const detailedPatients = await Promise.all(
      allUsers.map(async (user) => {
        const patientTreatments = await db
          .select()
          .from(treatments)
          .where(eq(treatments.patientId, user.id));

        // Get medicines for each treatment
        const treatmentsWithMedicines = await Promise.all(
          patientTreatments.map(async (treatment) => {
            const treatmentMedicines = await db
              .select()
              .from(medicines)
              .where(eq(medicines.treatmentId, treatment.id));

            // Get intake logs for each medicine
            const medicinesWithLogs = await Promise.all(
              treatmentMedicines.map(async (medicine) => {
                const logs = await db
                  .select()
                  .from(intakeLogs)
                  .where(eq(intakeLogs.medicineId, medicine.id))
                  .orderBy(desc(intakeLogs.scheduledTime))
                  .limit(10);

                return {
                  ...medicine,
                  intakeLogs: logs,
                };
              })
            );

            return {
              ...treatment,
              medicines: medicinesWithLogs,
            };
          })
        );

        return {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
          },
          treatments: treatmentsWithMedicines,
          treatmentCount: patientTreatments.length,
          totalMedicines: patientTreatments.reduce(
            (sum, t) => sum + (t.id ? 1 : 0),
            0
          ),
        };
      })
    );

    return detailedPatients;
  }
}

export const storage = new DatabaseStorage();
