import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...')
    
    const users = await prisma.user.findMany()
    
    console.log(`\n✅ Total de usuarios: ${users.length}\n`)
    
    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`)
      console.log(`   Nombre: ${user.name}`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Contraseña hash: ${user.password.substring(0, 20)}...`)
      console.log('')
    })
    
    // Verificar específicamente el admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@mundojlp.com' }
    })
    
    if (admin) {
      console.log('✅ Usuario admin encontrado!')
    } else {
      console.log('❌ Usuario admin NO encontrado!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()






