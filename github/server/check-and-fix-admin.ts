import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
  try {
    console.log("🔍 Checking user with email gsnandish@gmail.com...\n");
    
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, "gsnandish@gmail.com"));
    
    if (userList.length === 0) {
      console.log("❌ No user found with that email!");
      process.exit(1);
    }

    const user = userList[0];
    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Full Name: ${user.fullName}`);
    console.log(`   Role: "${user.role}" (length: ${user.role.length})`);
    console.log(`   Created: ${user.createdAt}`);
    
    if (user.role !== "admin") {
      console.log(`\n⚠️  Role is NOT "admin"! It's "${user.role}"`);
      console.log(`\n🔧 Fixing this user to have admin role...`);
      
      const updated = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, user.id))
        .returning();
      
      console.log(`\n✅ Updated successfully!`);
      console.log(`   New Role: "${updated[0].role}"`);
    } else {
      console.log(`\n✅ Role is correctly set to "admin"`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUser();
