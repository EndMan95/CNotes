import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

console.log("--- Seed script starting ---");

const prisma = new PrismaClient();

async function main() {
  console.log("--- Inside main function ---");

  // Create tenants
  console.log("Creating tenants...");
  const acme = await prisma.tenant.create({
    data: { name: "Acme", slug: "acme", plan: "FREE" },
  });
  const globex = await prisma.tenant.create({
    data: { name: "Globex", slug: "globex", plan: "FREE" },
  });
  console.log("Tenants created successfully.");

  // Hash password
  console.log("Hashing password...");
  const hashedPassword = await bcrypt.hash("password", 10);
  console.log("Password hashed successfully.");

  // Create users
  console.log("Creating users...");
  await prisma.user.create({
    data: {
      email: "admin@acme.test",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: acme.id,
    },
  });
  await prisma.user.create({
    data: {
      email: "user@acme.test",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: acme.id,
    },
  });
  await prisma.user.create({
    data: {
      email: "admin@globex.test",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: globex.id,
    },
  });
  await prisma.user.create({
    data: {
      email: "user@globex.test",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: globex.id,
    },
  });
  console.log("Users created successfully.");

  console.log("--- Seed data created successfully! ---");
}

console.log("--- Calling main function ---");
main()
  .catch((e) => {
    console.error("--- SCRIPT FAILED ---");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("--- Disconnecting Prisma Client ---");
    await prisma.$disconnect();
    console.log("--- Seed script finished ---");
  });
