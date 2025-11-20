import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    const email = "gsnandish@gmail.com";
    const username = "Nandish G S";
    const password = "Gsnandish";
    const fullName = "Nandish G S";

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("✅ Admin user already exists:", email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        role: "admin",
        fullName,
      })
      .returning();

    console.log("✅ Admin user created successfully:");
    console.log("   Email:", email);
    console.log("   Username:", username);
    console.log("   Role: admin");
    console.log("   ID:", result[0].id);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin().then(() => {
  console.log("✅ Seed completed");
  process.exit(0);
});
