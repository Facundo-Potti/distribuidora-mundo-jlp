import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener TODOS los productos directamente de la BD sin caché
    const allProducts = await prisma.product.findMany({
      orderBy: {
        nombre: 'asc',
      },
    })
    
    console.log(`📦 API /products: Total productos en BD: ${allProducts.length}`)
    
    // Log específico para productos que contengan "Aceite", "Girasol" o "Aceituna"
    const productosAceite = allProducts.filter(p => 
      p.nombre.toLowerCase().includes('aceite') || 
      p.nombre.toLowerCase().includes('girasol') ||
      p.nombre.toLowerCase().includes('aceituna')
    )
    if (productosAceite.length > 0) {
      console.log(`🔍 Productos relacionados con "Aceite", "Girasol" o "Aceituna": ${productosAceite.length}`, 
        productosAceite.map(p => ({
          id: p.id,
          nombre: p.nombre,
          imagen: p.imagen || 'null',
          activo: p.activo,
          updatedAt: p.updatedAt
        }))
      )
    }
    
    // Filtrar productos: incluir todos donde activo no sea explícitamente false
    // Esto incluye productos donde activo es true, null, o undefined
    const products = allProducts.filter(p => p.activo !== false)
    
    console.log(`📦 API /products: Productos activos (activo !== false): ${products.length}`)
    
    // Si no hay productos activos pero sí hay productos en total, mostrar info
    if (products.length === 0 && allProducts.length > 0) {
      console.warn('⚠️ Hay productos en BD pero todos están marcados como inactivos (activo: false)')
      const productosInactivos = allProducts.filter(p => p.activo === false)
      const productosNull = allProducts.filter(p => p.activo === null)
      console.log(`📦 Productos inactivos (activo: false): ${productosInactivos.length}`)
      console.log(`📦 Productos con activo null: ${productosNull.length}`)
      
      // En modo desarrollo, devolver todos los productos para debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Modo desarrollo: Devolviendo todos los productos para debugging')
        return NextResponse.json(allProducts, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
      }
    }
    
    // Si no hay productos en absoluto
    if (allProducts.length === 0) {
      console.warn('⚠️ No hay productos en la base de datos')
    }

    // Determinar qué productos devolver (en desarrollo, si no hay activos, devolver todos)
    let productosADevolver = products.length > 0 ? products : (process.env.NODE_ENV === 'development' ? allProducts : [])
    
    // Ordenar por updatedAt descendente para que los más recientes estén primero
    productosADevolver.sort((a, b) => {
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      if (a.updatedAt && !b.updatedAt) return -1
      if (!a.updatedAt && b.updatedAt) return 1
      return 0
    })
    
    // Si hay productos con el mismo nombre normalizado, tomar solo el primero (más reciente por updatedAt)
    const productosUnicos = new Map<string, typeof productosADevolver[0]>()
    productosADevolver.forEach(p => {
      const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!productosUnicos.has(nombreNormalizado)) {
        productosUnicos.set(nombreNormalizado, p)
      }
    })
    
    productosADevolver = Array.from(productosUnicos.values())
    
    console.log(`✅ Devolviendo ${productosADevolver.length} productos únicos (más reciente por nombre normalizado)`)
    
    // Agregar headers para evitar cache
    return NextResponse.json(productosADevolver, {
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

