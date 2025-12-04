import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Verificar conexión al inicializar
if (!globalForPrisma.prisma) {
  prisma.$connect()
    .then(() => {
      console.log('✅ Conectado a la base de datos')
    })
    .catch((error) => {
      console.error('❌ Error conectando a la base de datos:', error)
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


