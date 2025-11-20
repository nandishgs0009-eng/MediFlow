import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function testFullLogin() {
  try {
    console.log("🔐 Simulating full login process...\n");
    
    const email = "gsnandish@gmail.com";
    const password = "Gsnandish";
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);
    
    // Step 1: Find user
    console.log("Step 1: Looking up user...");
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (user.length === 0) {
      console.log("❌ User not found!");
      process.exit(1);
    }
    
    console.log("✅ User found");
    const foundUser = user[0];
    
    // Step 2: Verify password
    console.log("\nStep 2: Verifying password...");
    const validPassword = await bcrypt.compare(password, foundUser.password);
    console.log(`✅ Password valid: ${validPassword}`);
    
    if (!validPassword) {
      console.log("❌ Password mismatch!");
      process.exit(1);
    }
    
    // Step 3: Create response (removing password)
    console.log("\nStep 3: Creating login response...");
    const { password: _, ...userResponse } = foundUser;
    
    console.log("\n📤 Response that would be sent to client:");
    console.log(JSON.stringify(userResponse, null, 2));
    
    console.log("\n✅ Login simulation complete!");
    console.log(`   Role field exists: ${"role" in userResponse}`);
    console.log(`   Role value: "${userResponse.role}"`);
    console.log(`   Role type: ${typeof userResponse.role}`);
    console.log(`   Role === "admin": ${userResponse.role === "admin"}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testFullLogin();
