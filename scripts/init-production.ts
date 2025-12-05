/**
 * Script para inicializar la base de datos de producción
 * 
 * Uso:
 * 1. Configura DATABASE_URL en .env.local con la URL de Supabase
 * 2. Ejecuta: npx tsx scripts/init-production.ts
 */

// Cargar variables de entorno desde .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

async function initProduction() {
  // Crear nueva instancia del cliente para evitar conflictos con prepared statements
  const prisma = new PrismaClient({
    log: ['error'],
  })

  try {
    console.log('🔧 Inicializando base de datos de producción...\n')

    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos\n')

    // Pequeña pausa para evitar conflictos con prepared statements
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verificar si ya hay usuarios usando findMany para evitar prepared statements
    const users = await prisma.user.findMany({ select: { id: true }, take: 1 })
    const existingUsers = users.length
    
    if (existingUsers > 0) {
      console.log('⚠️  Ya existen usuarios en la base de datos.')
      console.log(`   Total de usuarios: ${existingUsers}\n`)
      
      const response = await new Promise<string>((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        readline.question('¿Deseas continuar y crear/actualizar usuarios? (s/n): ', (answer: string) => {
          readline.close()
          resolve(answer.toLowerCase())
        })
      })

      if (response !== 's' && response !== 'y' && response !== 'sí') {
        console.log('❌ Operación cancelada')
        return
      }
    }

    // Crear usuarios
    console.log('👤 Creando usuarios...')
    
    const adminPassword = await bcrypt.hash('admin123', 10)
    const demoPassword = await bcrypt.hash('demo123', 10)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@mundojlp.com' },
      update: {
        password: adminPassword,
        role: 'admin',
      },
      create: {
        email: 'admin@mundojlp.com',
        name: 'Administrador',
        password: adminPassword,
        role: 'admin',
      },
    })

    const demo = await prisma.user.upsert({
      where: { email: 'demo@mundojlp.com' },
      update: {
        password: demoPassword,
        role: 'user',
      },
      create: {
        email: 'demo@mundojlp.com',
        name: 'Usuario Demo',
        password: demoPassword,
        role: 'user',
      },
    })

    console.log('✅ Usuarios creados/actualizados\n')

    // Crear productos de ejemplo
    console.log('📦 Creando productos de ejemplo...')
    
    const productos = [
      {
        nombre: 'Harina 000',
        categoria: 'Harinas',
        precio: 1500.0,
        unidad: 'kg',
        stock: 100,
        activo: true,
      },
      {
        nombre: 'Azúcar Refinada',
        categoria: 'Endulzantes',
        precio: 800.0,
        unidad: 'kg',
        stock: 50,
        activo: true,
      },
      {
        nombre: 'Aceite de Girasol',
        categoria: 'Aceites',
        precio: 1200.0,
        unidad: 'litro',
        stock: 30,
        activo: true,
      },
    ]

    for (const producto of productos) {
      await prisma.product.upsert({
        where: { nombre: producto.nombre },
        update: {},
        create: producto,
      })
    }

    console.log('✅ Productos creados\n')

    console.log('🎉 Base de datos inicializada correctamente!\n')
    console.log('📋 Credenciales:')
    console.log('   Admin: admin@mundojlp.com / admin123')
    console.log('   Usuario: demo@mundojlp.com / demo123\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initProduction()

