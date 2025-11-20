import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkAdmin() {
  try {
    console.log("🔍 Checking admin users...");
    
    // Check by email
    const adminByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, "gsnandish@gmail.com"));
    
    if (adminByEmail.length > 0) {
      const admin = adminByEmail[0];
      console.log("\n✅ Admin found by email (gsnandish@gmail.com):");
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Full Name: ${admin.fullName}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);
    } else {
      console.log("❌ No admin found by email");
    }
    
    // Check all admin users
    const allAdmins = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));
    
    console.log(`\n📋 Total admin users in database: ${allAdmins.length}`);
    allAdmins.forEach((admin, i) => {
      console.log(`\n   Admin ${i + 1}:`);
      console.log(`   - Username: ${admin.username}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Role: ${admin.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking admin:", error);
    process.exit(1);
  }
}

checkAdmin();
