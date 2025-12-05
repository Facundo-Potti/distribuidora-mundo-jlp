import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a la base de datos...\n')
    
    // Intentar conectar
    await prisma.$connect()
    console.log('✅ Conexión exitosa!\n')
    
    // Contar usuarios
    const userCount = await prisma.user.count()
    console.log(`📊 Usuarios en la base de datos: ${userCount}`)
    
    // Contar productos
    const productCount = await prisma.product.count()
    console.log(`📦 Productos en la base de datos: ${productCount}\n`)
    
    if (userCount === 0) {
      console.log('⚠️  No hay usuarios. Necesitas ejecutar el seed o /api/admin/init-db')
    } else {
      console.log('✅ La base de datos tiene usuarios')
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    console.error('\n💡 Verifica:')
    console.error('   1. Que DATABASE_URL esté configurada correctamente')
    console.error('   2. Que la base de datos esté accesible')
    console.error('   3. Que las credenciales sean correctas')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

