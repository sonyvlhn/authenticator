import { PrismaClient } from '../app/generated/prisma/client';
import { obterVariavel } from './env';

// Em produção a conexão com o banco deve ser criptografada (SSL), para que senha e dados não trafeguem em texto puro
if (process.env.NODE_ENV === 'production' && !/[?&]sslmode=(require|verify-ca|verify-full)\b/.test(obterVariavel('DATABASE_URL'))) {
    console.warn('[prisma] DATABASE_URL sem SSL em produção. Adicione "?sslmode=require" ao final da URL.');
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
