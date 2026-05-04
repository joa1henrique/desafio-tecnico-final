import path from 'path';
import dotenv from 'dotenv';

export default async function globalTeardown() {
  const envPath = path.resolve(__dirname, '../.env');
  dotenv.config({ path: envPath });

  const { disconnectPrisma } = await import('../src/lib/prisma');
  await disconnectPrisma();
}
