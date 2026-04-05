import { PrismaClient } from '@prisma/client'

interface CustomNodeJSGlobal {
  prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as CustomNodeJSGlobal

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma