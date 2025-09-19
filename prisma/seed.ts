import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create tenants
  const acme = await prisma.tenant.create({
    data: {
      name: 'Acme',
      slug: 'acme',
      plan: 'FREE',
    },
  });

  const globex = await prisma.tenant.create({
    data: {
      name: 'Globex',
      slug: 'globex',
      plan: 'FREE',
    },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create users
  await prisma.user.create({
    data: {
      email: 'admin@acme.test',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: acme.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@acme.test',
      password: hashedPassword,
      role: 'MEMBER',
      tenantId: acme.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@globex.test',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: globex.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@globex.test',
      password: hashedPassword,
      role: 'MEMBER',
      tenantId: globex.id,
    },
  });

  console.log('Seed data created successfully!');
  console.log('- Tenants: Acme, Globex');
  console.log('- Users: admin@acme.test, user@acme.test, admin@globex.test, user@globex.test');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });