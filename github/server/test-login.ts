import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function testLogin() {
  try {
    console.log("🔐 Testing admin login credentials...");
    
    const email = "gsnandish@gmail.com";
    const password = "Gsnandish";
    
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    // Get user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      console.log("\n❌ User not found!");
      process.exit(1);
    }
    
    console.log(`\n✅ User found: ${user.username}`);
    console.log(`   Hash: ${user.password.substring(0, 30)}...`);
    
    // Test password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (validPassword) {
      console.log("\n✅ Password is VALID!");
      console.log("\n🎉 Login should work! Try logging in with:");
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log("\n❌ Password is INVALID!");
      console.log("\n🔍 Debugging:");
      console.log(`   Entered password: "${password}"`);
      console.log(`   Stored hash: ${user.password}`);
      
      // Try common variations
      console.log("\n   Trying variations...");
      const variations = [
        "gsnandish",
        "Gsnandish",
        "GSNANDISH",
        "Gsnandish.",
        "password",
        "admin",
      ];
      
      for (const pwd of variations) {
        const isValid = await bcrypt.compare(pwd, user.password);
        if (isValid) {
          console.log(`   ✅ Match found: "${pwd}"`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error testing login:", error);
    process.exit(1);
  }
}

testLogin();
