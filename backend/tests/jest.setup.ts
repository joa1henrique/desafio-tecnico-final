import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Ensure required env variables are present early
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error('Missing required env variables for tests (DATABASE_URL or JWT_SECRET)');
}
