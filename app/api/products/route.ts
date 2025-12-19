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
      // SIEMPRE ordenar productos por updatedAt (más reciente primero), incluso si solo hay uno
      // Esto asegura que si hay múltiples productos con el mismo nombre normalizado,
      // se seleccione siempre el más recientemente actualizado
      productos.sort((a, b) => {
        // PRIORIDAD 1: updatedAt - El producto más recientemente actualizado es el correcto
        if (a.updatedAt && b.updatedAt) {
          const fechaA = new Date(a.updatedAt).getTime()
          const fechaB = new Date(b.updatedAt).getTime()
          if (fechaA !== fechaB) {
            return fechaB - fechaA // Más reciente primero
          }
        }
        // Si solo uno tiene updatedAt, ese es más reciente
        if (a.updatedAt && !b.updatedAt) return -1
        if (!a.updatedAt && b.updatedAt) return 1
        
        // PRIORIDAD 2: Timestamp de imagen (solo si updatedAt es igual o no disponible)
        const timestampA = extractTimestamp(a.imagen)
        const timestampB = extractTimestamp(b.imagen)
        if (timestampA > 0 && timestampB > 0) {
          return timestampB - timestampA // Más reciente primero
        }
        if (timestampA > 0) return -1
        if (timestampB > 0) return 1
        
        // PRIORIDAD 3: ID (último recurso) - usar el ID más grande (más reciente)
        const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id))
        const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id))
        return idB - idA
      })
      
      if (productos.length === 1) {
        // Solo hay uno, agregarlo directamente (ya está ordenado)
        productosSinDuplicados.push(productos[0])
      } else {
        // Hay duplicados, tomar el que tenga la imagen más reciente (ya está ordenado)
        duplicadosEncontrados += productos.length - 1
        
        // Log para productos con duplicados (especialmente si contienen "Aceite" o "Girasol")
        if (nombreNormalizado.includes('aceite') || nombreNormalizado.includes('girasol')) {
          console.log(`🔄 Productos duplicados encontrados para "${nombreNormalizado}": ${productos.length}`, 
            productos.map(p => ({
              id: p.id,
              nombre: p.nombre,
              imagen: p.imagen || 'null',
              activo: p.activo,
              timestamp: extractTimestamp(p.imagen)
            }))
          )
        }
        
        // Log del producto seleccionado
        if (nombreNormalizado.includes('aceite') || nombreNormalizado.includes('girasol') || nombreNormalizado.includes('aceituna')) {
          console.log(`✅ Producto seleccionado para "${nombreNormalizado}":`, {
            id: productos[0].id,
            nombre: productos[0].nombre,
            imagen: productos[0].imagen || 'null',
            timestamp: extractTimestamp(productos[0].imagen),
            updatedAt: productos[0].updatedAt
          })
          console.log(`📊 Comparación de todos los productos duplicados:`, productos.map((p, idx) => ({
            index: idx,
            id: p.id,
            nombre: p.nombre,
            imagen: p.imagen || 'null',
            timestamp: extractTimestamp(p.imagen),
            updatedAt: p.updatedAt,
            activo: p.activo
          })))
        }
        
        productosSinDuplicados.push(productos[0])
      }
    })
    
    if (duplicadosEncontrados > 0) {
      console.log(`⚠️ Total de productos duplicados encontrados: ${duplicadosEncontrados}`)
    }
    
    // Agregar headers para evitar cache
    return NextResponse.json(productosSinDuplicados, {
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

