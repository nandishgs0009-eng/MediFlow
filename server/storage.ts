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
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
  createIntakeLog(log: InsertIntakeLog): Promise<IntakeLog>;

  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
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

  async createIntakeLog(log: InsertIntakeLog): Promise<IntakeLog> {
    const [newLog] = await db.insert(intakeLogs).values(log).returning();
    return newLog;
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
}

export const storage = new DatabaseStorage();
