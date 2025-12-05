/**
 * Script para verificar y corregir usuarios en la base de datos
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

async function fixUsers() {
  const prisma = new PrismaClient({
    log: ['error'],
  })

  try {
    console.log('🔧 Verificando y corrigiendo usuarios...\n')

    await prisma.$connect()
    console.log('✅ Conectado a la base de datos\n')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Listar usuarios existentes
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    console.log(`📊 Usuarios encontrados: ${existingUsers.length}`)
    existingUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })
    console.log('')

    // Crear/actualizar usuarios con contraseñas correctas
    console.log('👤 Creando/actualizando usuarios...\n')

    const adminPassword = await bcrypt.hash('admin123', 10)
    const demoPassword = await bcrypt.hash('demo123', 10)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@mundojlp.com' },
      update: {
        password: adminPassword,
        role: 'admin',
        name: 'Administrador',
      },
      create: {
        email: 'admin@mundojlp.com',
        name: 'Administrador',
        password: adminPassword,
        role: 'admin',
      },
    })

    console.log('✅ Admin creado/actualizado:', admin.email)

    const demo = await prisma.user.upsert({
      where: { email: 'demo@mundojlp.com' },
      update: {
        password: demoPassword,
        role: 'user',
        name: 'Usuario Demo',
      },
      create: {
        email: 'demo@mundojlp.com',
        name: 'Usuario Demo',
        password: demoPassword,
        role: 'user',
      },
    })

    console.log('✅ Demo creado/actualizado:', demo.email)

    // Verificar que las contraseñas funcionan
    console.log('\n🔐 Verificando contraseñas...\n')

    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@mundojlp.com' },
    })

    if (adminUser) {
      const adminValid = await bcrypt.compare('admin123', adminUser.password)
      console.log(`   Admin (admin123): ${adminValid ? '✅ Válida' : '❌ Inválida'}`)
    }

    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@mundojlp.com' },
    })

    if (demoUser) {
      const demoValid = await bcrypt.compare('demo123', demoUser.password)
      console.log(`   Demo (demo123): ${demoValid ? '✅ Válida' : '❌ Inválida'}`)
    }

    console.log('\n🎉 Usuarios corregidos!\n')
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

fixUsers()


