import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔐 Probando login...\n')
    
    const email = 'admin@mundojlp.com'
    const password = 'admin123'
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log(`✅ Usuario encontrado: ${user.email}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Hash almacenado: ${user.password.substring(0, 30)}...`)
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password)
    
    if (isValid) {
      console.log('\n✅ Contraseña válida! El login debería funcionar.')
    } else {
      console.log('\n❌ Contraseña inválida!')
      console.log('   Probando recrear el hash...')
      
      const newHash = await bcrypt.hash(password, 10)
      console.log(`   Nuevo hash: ${newHash.substring(0, 30)}...`)
      
      // Actualizar contraseña
      await prisma.user.update({
        where: { email },
        data: { password: newHash }
      })
      
      console.log('✅ Contraseña actualizada. Intenta loguearte nuevamente.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()


