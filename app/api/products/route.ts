import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Obtener productos activos directamente de la BD
    const allProducts = await prisma.product.findMany({
      where: {
        activo: { not: false } // activo !== false (incluye true y null)
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    
    console.log(`📦 Productos obtenidos: ${allProducts.length}`)
    
    // Agregar headers para evitar caché
    return NextResponse.json(allProducts, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('❌ Error fetching products:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Error al obtener productos: ' + (error.message || 'Error desconocido') },
      { status: 500 }
    )
  }
}

