import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seedAdmin() {
  try {
    console.log("🌱 Seeding admin user...");
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "gsnandish@gmail.com"));
    
    if (existingAdmin.length > 0) {
      console.log("✅ Admin user already exists");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("Gsnandish", SALT_ROUNDS);

    // Create admin user
    const adminUser = await db
      .insert(users)
      .values({
        username: "Nandish G S",
        email: "gsnandish@gmail.com",
        password: hashedPassword,
        fullName: "Nandish G S",
        role: "admin",
      })
      .returning();

    console.log("✅ Admin user created successfully");
    console.log("📋 Admin Credentials:");
    console.log(`   Username: Nandish G S`);
    console.log(`   Email: gsnandish@gmail.com`);
    console.log(`   Password: Gsnandish`);
    console.log(`   Role: admin`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
