import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios de ejemplo
  const hashedPasswordDemo = await bcrypt.hash('demo123', 10)
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10)

  const userDemo = await prisma.user.upsert({
    where: { email: 'demo@mundojlp.com' },
    update: {},
    create: {
      email: 'demo@mundojlp.com',
      name: 'Usuario Demo',
      password: hashedPasswordDemo,
      role: 'user',
    },
  })

  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@mundojlp.com' },
    update: {},
    create: {
      email: 'admin@mundojlp.com',
      name: 'Administrador',
      password: hashedPasswordAdmin,
      role: 'admin',
    },
  })

  console.log('✅ Usuarios creados:', { userDemo, userAdmin })

  // Crear productos de ejemplo
  const productos = [
    {
      nombre: 'Harina 0000',
      categoria: 'Harinas',
      precio: 850.0,
      unidad: 'kg',
      stock: 500,
      descripcion: 'Harina de trigo 0000 para panadería',
    },
    {
      nombre: 'Harina 000',
      categoria: 'Harinas',
      precio: 820.0,
      unidad: 'kg',
      stock: 450,
      descripcion: 'Harina de trigo 000 para panadería',
    },
    {
      nombre: 'Azúcar Blanca',
      categoria: 'Endulzantes',
      precio: 650.0,
      unidad: 'kg',
      stock: 300,
      descripcion: 'Azúcar refinada blanca',
    },
    {
      nombre: 'Aceite de Girasol',
      categoria: 'Aceites',
      precio: 1200.0,
      unidad: 'litro',
      stock: 200,
      descripcion: 'Aceite de girasol refinado',
    },
    {
      nombre: 'Levadura Seca',
      categoria: 'Levaduras',
      precio: 2500.0,
      unidad: 'kg',
      stock: 100,
      descripcion: 'Levadura seca instantánea',
    },
    {
      nombre: 'Sal Fina',
      categoria: 'Condimentos',
      precio: 350.0,
      unidad: 'kg',
      stock: 400,
      descripcion: 'Sal fina de mesa',
    },
    {
      nombre: 'Manteca',
      categoria: 'Grasas',
      precio: 1800.0,
      unidad: 'kg',
      stock: 150,
      descripcion: 'Manteca para repostería',
    },
    {
      nombre: 'Huevos',
      categoria: 'Huevos',
      precio: 3200.0,
      unidad: 'docena',
      stock: 80,
      descripcion: 'Huevos frescos categoría A',
    },
  ]

  for (const producto of productos) {
    await prisma.product.upsert({
      where: { nombre: producto.nombre },
      update: {},
      create: producto,
    })
  }

  console.log('✅ Productos creados')

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


