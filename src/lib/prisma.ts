import { PrismaClient } from '../generated/prisma';

// Declare global type for prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or reuse prisma client instance
const client = globalThis.prisma || new PrismaClient();

// In development, store the prisma client globally to prevent connection exhaustion
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = client;
}

export default client;