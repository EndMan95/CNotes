import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    // Try a simple query
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true
      }
    });
    console.log(`Found ${tenants.length} tenants in the database.`);
    
    for (const tenant of tenants) {
      console.log(`\nTenant: ${tenant.name} (${tenant.slug}) - Plan: ${tenant.plan}`);
      console.log(`Users (${tenant.users.length}):`);
      for (const user of tenant.users) {
        console.log(`  - ${user.email} (${user.role})`);
      }
    }
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();