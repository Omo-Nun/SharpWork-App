import prisma from '../prisma';

export async function setRlsContext(userId: string, role: string): Promise<void> {
  await prisma.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`;
  await prisma.$executeRaw`SELECT set_config('app.user_role', ${role}, true)`;
}

export async function setPublicRlsContext(): Promise<void> {
  await prisma.$executeRaw`SELECT set_config('app.user_id', '', true)`;
  await prisma.$executeRaw`SELECT set_config('app.user_role', 'PUBLIC', true)`;
}

export async function clearRlsContext(): Promise<void> {
  await setPublicRlsContext();
}
