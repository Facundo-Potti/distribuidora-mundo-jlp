import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Primero obtener todos los productos para debugging
    // Usar findMany sin caché para asegurar datos frescos
    const allProducts = await prisma.product.findMany({
      orderBy: {
        nombre: 'asc',
      },
      // No usar caché - siempre obtener datos frescos de la BD
    })
    
    console.log(`📦 API /products: Total productos en BD: ${allProducts.length}`)
    
    // Log específico para productos que contengan "Aceite" o "Girasol"
    const productosAceite = allProducts.filter(p => 
      p.nombre.toLowerCase().includes('aceite') || 
      p.nombre.toLowerCase().includes('girasol')
    )
    if (productosAceite.length > 0) {
      console.log(`🔍 Productos relacionados con "Aceite" o "Girasol": ${productosAceite.length}`, 
        productosAceite.map(p => ({
          id: p.id,
          nombre: p.nombre,
          imagen: p.imagen ? p.imagen.substring(0, 100) + '...' : null,
          activo: p.activo
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
    const productosADevolver = products.length > 0 ? products : (process.env.NODE_ENV === 'development' ? allProducts : [])
    
    // SIEMPRE agrupar productos por nombre normalizado para evitar duplicados
    // Esto asegura que si hay productos con el mismo nombre (exacto o similar), solo se devuelva uno
    const productosPorNombre = new Map<string, typeof productosADevolver>()
    
    productosADevolver.forEach(p => {
      const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!productosPorNombre.has(nombreNormalizado)) {
        productosPorNombre.set(nombreNormalizado, [])
      }
      productosPorNombre.get(nombreNormalizado)!.push(p)
    })
    
    // Función para extraer timestamp del nombre del archivo
    const extractTimestamp = (url: string | null): number => {
      if (!url || !url.includes('supabase.co')) return 0
      const match = url.match(/producto-[^-]+-(\d+)\./i)
      return match ? parseInt(match[1]) : 0
    }
    
    const productosSinDuplicados: typeof productosADevolver = []
    let duplicadosEncontrados = 0
    
    productosPorNombre.forEach((productos, nombreNormalizado) => {
      if (productos.length === 1) {
        // Solo hay uno, agregarlo directamente
        productosSinDuplicados.push(productos[0])
      } else {
        // Hay duplicados, tomar el que tenga la imagen más reciente
        duplicadosEncontrados += productos.length - 1
        
        // Ordenar por timestamp de imagen (más reciente primero), luego por ID
        productos.sort((a, b) => {
          const timestampA = extractTimestamp(a.imagen)
          const timestampB = extractTimestamp(b.imagen)
          
          // Si ambos tienen timestamps, usar esos
          if (timestampA > 0 && timestampB > 0) {
            return timestampB - timestampA // Más reciente primero
          }
          
          // Si solo uno tiene timestamp, ese es más reciente
          if (timestampA > 0) return -1
          if (timestampB > 0) return 1
          
          // Si ninguno tiene timestamp, usar ID como fallback
          const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id))
          const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id))
          return idB - idA
        })
        
        productosSinDuplicados.push(productos[0])
      }
    })
    
    // SIEMPRE devolver productos sin duplicados (aunque no haya duplicados, el proceso de agrupación asegura consistencia)
    productosADevolver = productosSinDuplicados

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

