import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import { prisma } from '../../src/lib/prisma';

const execAsync = util.promisify(exec);

export async function resetDatabase() {
  // Prefer to delete all rows via Prisma to keep connection in-process
  try {
    await prisma.historicoSolicitacao.deleteMany();
  } catch (e) {
    // ignore
  }

  try {
    await prisma.anexo.deleteMany();
  } catch (e) {
    // ignore
  }

  try {
    await prisma.solicitacao.deleteMany();
  } catch (e) {
    // ignore
  }

  try {
    await prisma.categoria.deleteMany();
  } catch (e) {
    // ignore
  }

  try {
    await prisma.usuario.deleteMany();
  } catch (e) {
    // ignore
  }
}

export async function seedDatabase() {
  // Run the seed script using node
  const seedPath = path.resolve(__dirname, '../../prisma/seed.js');
  await execAsync(`node "${seedPath}"`, { cwd: path.resolve(__dirname, '../..') });
}

export async function resetAndSeed() {
  await resetDatabase();
  await seedDatabase();
}
