/**
 * Script completo para configurar la base de datos de producción
 * 1. Crea las tablas
 * 2. Inicializa con usuarios y productos
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function setupProduction() {
  try {
    console.log('🚀 Configurando base de datos de producción...\n')

    // Paso 1: Crear tablas usando script simple
    console.log('📋 Paso 1: Creando tablas en la base de datos...')
    try {
      // Importar y ejecutar el script de crear tablas
      const { execSync } = require('child_process')
      execSync('npx tsx scripts/crear-tablas-simple.ts', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
      console.log('✅ Tablas creadas exitosamente\n')
    } catch (error) {
      console.error('❌ Error al crear tablas:', error)
      throw error
    }

    // Paso 2: Verificar conexión
    console.log('🔌 Paso 2: Verificando conexión...')
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos\n')

    // Paso 3: Verificar si ya hay usuarios
    console.log('👤 Paso 3: Verificando usuarios existentes...')
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      console.log(`⚠️  Ya existen ${existingUsers} usuarios en la base de datos.`)
      console.log('   Continuando para actualizar/crear usuarios...\n')
    } else {
      console.log('✅ No hay usuarios, creando nuevos...\n')
    }

    // Paso 4: Crear usuarios
    console.log('👤 Paso 4: Creando/actualizando usuarios...')
    
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

    // Paso 5: Crear productos
    console.log('📦 Paso 5: Creando productos de ejemplo...')
    
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

    console.log('🎉 Base de datos configurada correctamente!\n')
    console.log('📋 Credenciales:')
    console.log('   Admin: admin@mundojlp.com / admin123')
    console.log('   Usuario: demo@mundojlp.com / demo123\n')
    console.log('🌐 Prueba el login en: https://distribuidora-mundo-jlp.vercel.app/auth/login\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupProduction()

