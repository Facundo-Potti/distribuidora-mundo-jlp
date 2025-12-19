/**
 * Script para verificar si la imagen de un producto está guardada en la BD
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error'],
})

async function verificarImagen() {
  try {
    console.log('\n🔍 Verificando imágenes de productos en la BD...\n')

    await prisma.$connect()
    console.log('✅ Conectado a la base de datos\n')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Buscar productos con imágenes
    const productosConImagen = await prisma.product.findMany({
      where: {
        imagen: {
          not: null,
        },
      },
      select: {
        nombre: true,
        imagen: true,
      },
      take: 10,
    })

    console.log(`📊 Productos con imagen (primeros 10): ${productosConImagen.length}\n`)
    
    productosConImagen.forEach((p, index) => {
      console.log(`${index + 1}. ${p.nombre}`)
      console.log(`   Imagen: ${p.imagen}`)
      console.log(`   Es Supabase: ${p.imagen?.includes('supabase.co') ? '✅' : '❌'}\n`)
    })

    // Buscar productos sin imagen
    const productosSinImagen = await prisma.product.findMany({
      where: {
        OR: [
          { imagen: null },
          { imagen: '' },
        ],
      },
      select: {
        nombre: true,
        imagen: true,
      },
      take: 10,
    })

    console.log(`\n📊 Productos sin imagen (primeros 10): ${productosSinImagen.length}\n`)
    
    if (productosSinImagen.length > 0) {
      productosSinImagen.slice(0, 5).forEach((p, index) => {
        console.log(`${index + 1}. ${p.nombre}`)
        console.log(`   Imagen: ${p.imagen === null ? 'null' : `"${p.imagen}"`}\n`)
      })
    }

    // Buscar un producto específico si se pasa como argumento
    const productoNombre = process.argv[2]
    if (productoNombre) {
      console.log(`\n🔍 Buscando producto: "${productoNombre}"\n`)
      const producto = await prisma.product.findUnique({
        where: { nombre: productoNombre },
        select: {
          id: true,
          nombre: true,
          imagen: true,
          categoria: true,
          precio: true,
        },
      })

      if (producto) {
        console.log('✅ Producto encontrado:')
        console.log(`   ID: ${producto.id}`)
        console.log(`   Nombre: ${producto.nombre}`)
        console.log(`   Categoría: ${producto.categoria}`)
        console.log(`   Precio: ${producto.precio}`)
        console.log(`   Imagen: ${producto.imagen === null ? 'null' : producto.imagen}`)
        console.log(`   Tipo imagen: ${typeof producto.imagen}`)
        console.log(`   Es Supabase: ${producto.imagen?.includes('supabase.co') ? '✅' : '❌'}\n`)
      } else {
        console.log('❌ Producto no encontrado\n')
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verificarImagen()





