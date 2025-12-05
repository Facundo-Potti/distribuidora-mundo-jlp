import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    // Log para verificar imágenes de productos específicos
    const productosConImagen = products.filter(p => p.imagen && p.imagen.includes('supabase.co'))
    console.log(`📦 API /products: Total productos: ${products.length}, Con imagen Supabase: ${productosConImagen.length}`)
    
    // Log detallado para un producto específico
    const productoEspecifico = products.find(p => p.nombre && p.nombre.includes('ACEITUNA NEGRA N 00 BALDE'))
    if (productoEspecifico) {
      console.log('🔍 API /products - Producto específico:', {
        nombre: productoEspecifico.nombre,
        imagen: productoEspecifico.imagen,
        tipoImagen: typeof productoEspecifico.imagen,
        esNull: productoEspecifico.imagen === null
      })
    }

    // Agregar headers para evitar cache
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

