import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("patient"),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const treatments = pgTable("treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  treatmentId: varchar("treatment_id").notNull().references(() => treatments.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  scheduleTime: text("schedule_time").notNull(),
  instructions: text("instructions"),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const intakeLogs = pgTable("intake_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id, { onDelete: 'cascade' }),
  scheduledTime: timestamp("scheduled_time").notNull(),
  takenTime: timestamp("taken_time"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  medicineId: varchar("medicine_id").references(() => medicines.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("reminder"),
  read: boolean("read").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
  createdAt: true,
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
  createdAt: true,
});

export const insertIntakeLogSchema = createInsertSchema(intakeLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Treatment = typeof treatments.$inferSelect;

export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicines.$inferSelect;

export type InsertIntakeLog = z.infer<typeof insertIntakeLogSchema>;
export type IntakeLog = typeof intakeLogs.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  treatments: many(treatments),
  notifications: many(notifications),
}));

export const treatmentsRelations = relations(treatments, ({ one, many }) => ({
  patient: one(users, {
    fields: [treatments.patientId],
    references: [users.id],
  }),
  medicines: many(medicines),
}));

export const medicinesRelations = relations(medicines, ({ one, many }) => ({
  treatment: one(treatments, {
    fields: [medicines.treatmentId],
    references: [treatments.id],
  }),
  intakeLogs: many(intakeLogs),
  notifications: many(notifications),
}));

export const intakeLogsRelations = relations(intakeLogs, ({ one }) => ({
  medicine: one(medicines, {
    fields: [intakeLogs.medicineId],
    references: [medicines.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  medicine: one(medicines, {
    fields: [notifications.medicineId],
    references: [medicines.id],
  }),
}));
