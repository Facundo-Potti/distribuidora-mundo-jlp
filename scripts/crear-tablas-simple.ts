/**
 * Script simple para crear tablas usando SQL directo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function crearTablas() {
  try {
    console.log('🔧 Creando tablas en la base de datos...\n')

    // Ejecutar cada comando SQL por separado
    const comandos = [
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "image" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
      `CREATE TABLE IF NOT EXISTS "profiles" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "phone" TEXT,
        "address" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id"),
        CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "profiles_userId_key" ON "profiles"("userId")`,
      `CREATE TABLE IF NOT EXISTS "products" (
        "id" TEXT NOT NULL,
        "nombre" TEXT NOT NULL,
        "categoria" TEXT NOT NULL,
        "precio" DOUBLE PRECISION NOT NULL,
        "unidad" TEXT NOT NULL,
        "imagen" TEXT,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "descripcion" TEXT,
        "activo" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "products_nombre_key" ON "products"("nombre")`,
      `CREATE TABLE IF NOT EXISTS "orders" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "cliente" TEXT NOT NULL,
        "clienteEmail" TEXT NOT NULL,
        "total" DOUBLE PRECISION NOT NULL,
        "estado" TEXT NOT NULL DEFAULT 'pendiente',
        "direccionEnvio" TEXT,
        "telefono" TEXT,
        "notas" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id"),
        CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "order_items" (
        "id" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "cantidad" INTEGER NOT NULL,
        "precio" DOUBLE PRECISION NOT NULL,
        "subtotal" DOUBLE PRECISION NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON UPDATE CASCADE
      )`
    ]

    for (const comando of comandos) {
      try {
        await prisma.$executeRawUnsafe(comando)
      } catch (error: any) {
        // Ignorar errores de "already exists"
        if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
          throw error
        }
      }
    }

    console.log('✅ Tablas creadas exitosamente!\n')

  } catch (error: any) {
    // Si las tablas ya existen, está bien
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('✅ Las tablas ya existen\n')
    } else {
      console.error('❌ Error:', error.message)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

crearTablas()

