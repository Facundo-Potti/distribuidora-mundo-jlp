import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener TODOS los productos directamente de la BD sin caché
    // Ordenar por updatedAt DESCENDENTE primero para asegurar que los más recientes estén primero
    const allProducts = await prisma.product.findMany({
      orderBy: {
        updatedAt: 'desc', // CRÍTICO: Ordenar por updatedAt descendente desde la BD
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
      console.log(`🔍 DEBUG GET: TODOS los productos con "Aceite", "Girasol" o "Aceituna" en la BD:`, 
        productosAceite.map(p => ({
          id: p.id,
          nombre: p.nombre,
          imagen: p.imagen || 'null',
          imagenCompleta: p.imagen,
          activo: p.activo,
          updatedAt: p.updatedAt?.toISOString() || 'null',
          updatedAtTime: p.updatedAt ? new Date(p.updatedAt).getTime() : 0
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
    
    // Ya están ordenados por updatedAt descendente desde la BD, pero reordenar por si acaso
    productosADevolver.sort((a, b) => {
      if (a.updatedAt && b.updatedAt) {
        const timeA = new Date(a.updatedAt).getTime()
        const timeB = new Date(b.updatedAt).getTime()
        return timeB - timeA // Más reciente primero
      }
      if (a.updatedAt && !b.updatedAt) return -1
      if (!a.updatedAt && b.updatedAt) return 1
      // Si no tienen updatedAt, usar ID como fallback (mayor = más reciente)
      const idA = typeof a.id === 'number' ? a.id : String(a.id)
      const idB = typeof b.id === 'number' ? b.id : String(b.id)
      return idA > idB ? -1 : 1
    })
    
    // Log de productos con "aceite", "girasol" o "aceituna" después de ordenar
    const productosAceiteOrdenados = productosADevolver.filter(p => 
      p.nombre.toLowerCase().includes('aceite') || 
      p.nombre.toLowerCase().includes('girasol') ||
      p.nombre.toLowerCase().includes('aceituna')
    )
    if (productosAceiteOrdenados.length > 0) {
      console.log(`🔍 DEBUG GET: Productos ordenados por updatedAt (más reciente primero):`, 
        productosAceiteOrdenados.map(p => ({
          id: p.id,
          nombre: p.nombre,
          imagen: p.imagen || 'null',
          updatedAt: p.updatedAt?.toISOString() || 'null',
          updatedAtTime: p.updatedAt ? new Date(p.updatedAt).getTime() : 0
        }))
      )
    }
    
    // Si hay productos con el mismo nombre normalizado, tomar solo el más reciente por updatedAt
    // Agrupar primero por nombre normalizado
    const productosPorNombre = new Map<string, typeof productosADevolver>()
    productosADevolver.forEach(p => {
      const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!productosPorNombre.has(nombreNormalizado)) {
        productosPorNombre.set(nombreNormalizado, [])
      }
      productosPorNombre.get(nombreNormalizado)!.push(p)
    })
    
    // Para cada grupo, seleccionar el más reciente por updatedAt
    const productosUnicos: typeof productosADevolver = []
    productosPorNombre.forEach((productos, nombreNormalizado) => {
      if (productos.length === 1) {
        productosUnicos.push(productos[0])
      } else {
        // Hay duplicados - ordenar por updatedAt y tomar el más reciente
        productos.sort((a, b) => {
          if (a.updatedAt && b.updatedAt) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          }
          if (a.updatedAt && !b.updatedAt) return -1
          if (!a.updatedAt && b.updatedAt) return 1
          return 0
        })
        
        const productoSeleccionado = productos[0]
        productosUnicos.push(productoSeleccionado)
        
        // Log para productos con "aceituna"
        if (nombreNormalizado.includes('aceituna')) {
          console.log(`🔄 DEBUG GET: Productos duplicados para "${nombreNormalizado}" (${productos.length} productos):`)
          productos.forEach((p, idx) => {
            console.log(`  [${idx}] ID: ${p.id}, updatedAt: ${p.updatedAt?.toISOString() || 'null'}, imagen: ${p.imagen || 'null'}`)
          })
          console.log(`✅ Producto SELECCIONADO: ID=${productoSeleccionado.id}, updatedAt=${productoSeleccionado.updatedAt?.toISOString() || 'null'}, imagen=${productoSeleccionado.imagen || 'null'}`)
        }
      }
    })
    
    productosADevolver = productosUnicos
    
    // Log para productos con "aceite", "girasol" o "aceituna" que se devuelven
    const productosDebug = productosADevolver.filter(p => 
      p.nombre.toLowerCase().includes('aceite') || 
      p.nombre.toLowerCase().includes('girasol') ||
      p.nombre.toLowerCase().includes('aceituna')
    )
    if (productosDebug.length > 0) {
      console.log(`🔍 DEBUG GET: Productos FINALES que se devuelven (después de agrupar por nombre):`, 
        productosDebug.map(p => ({
          id: p.id,
          nombre: p.nombre,
          imagen: p.imagen || 'null',
          imagenCompleta: p.imagen,
          updatedAt: p.updatedAt?.toISOString() || 'null',
          updatedAtTime: p.updatedAt ? new Date(p.updatedAt).getTime() : 0
        }))
      )
    }
    
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

