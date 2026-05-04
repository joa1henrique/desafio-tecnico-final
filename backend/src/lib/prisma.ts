import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

let disconnected = false;

export async function disconnectPrisma() {
	if (disconnected) return;
	disconnected = true;
	await prisma.$disconnect();
	await pool.end();
}
