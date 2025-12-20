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
    
    // #region agent log
    console.log('[DEBUG] Productos obtenidos de BD:', {total: allProducts.length, primeros3: allProducts.slice(0,3).map(p=>({id:p.id,nombre:p.nombre,imagen:p.imagen}))});
    // #endregion
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
    // IMPORTANTE: Ya están ordenados por updatedAt DESC, así que el primer producto con cada nombre será el más reciente
    // Agrupar por nombre normalizado - SOLO mantener el primero que encontremos (que será el más reciente debido al orden)
    const productosPorNombre = new Map<string, typeof productosADevolver[0]>()
    productosADevolver.forEach(p => {
      const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
      // Si no existe, agregarlo. Si ya existe, ignorarlo porque ya tenemos el más reciente (debido al ordenamiento)
      if (!productosPorNombre.has(nombreNormalizado)) {
        productosPorNombre.set(nombreNormalizado, p)
      }
      // Si ya existe, lo ignoramos porque el que ya está en el mapa es más reciente (viene antes en el array ordenado)
    })
    
    // #region agent log
    // Contar cuántos productos se están ignorando (duplicados)
    const productosIgnorados: Array<{nombre: string, producto: any}> = []
    productosADevolver.forEach(p => {
      const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
      if (productosPorNombre.has(nombreNormalizado) && productosPorNombre.get(nombreNormalizado)!.id !== p.id) {
        productosIgnorados.push({nombre: nombreNormalizado, producto: {id: p.id, nombre: p.nombre, imagen: p.imagen, updatedAt: p.updatedAt?.toISOString()}})
      }
    })
    if (productosIgnorados.length > 0 && productosIgnorados.some(({nombre}) => nombre.includes('aceituna'))) {
      console.log('[DEBUG] Productos duplicados ignorados:', {totalIgnorados: productosIgnorados.length, aceitunas: productosIgnorados.filter(({nombre})=>nombre.includes('aceituna'))});
    }
    // #endregion
    
    // Convertir el Map a array
    const productosUnicos: typeof productosADevolver = Array.from(productosPorNombre.values())
    
    // Log específico para "aceituna negra n 0 x 5 kg"
    const aceitunaNegraFinal = productosUnicos.find(p => 
      p.nombre.toLowerCase().includes('aceituna') && 
      p.nombre.toLowerCase().includes('negra') &&
      p.nombre.toLowerCase().includes('n 0') &&
      p.nombre.toLowerCase().includes('5 kg')
    )
    if (aceitunaNegraFinal) {
      // #region agent log
      console.log('[DEBUG] Aceituna negra seleccionada final:', {id: aceitunaNegraFinal.id, nombre: aceitunaNegraFinal.nombre, imagen: aceitunaNegraFinal.imagen, updatedAt: aceitunaNegraFinal.updatedAt?.toISOString()});
      // #endregion
      console.log(`🎯 Producto ACEITUNA NEGRA N 0 X 5 KG seleccionado:`, {
        id: aceitunaNegraFinal.id,
        nombre: aceitunaNegraFinal.nombre,
        imagen: aceitunaNegraFinal.imagen,
        updatedAt: aceitunaNegraFinal.updatedAt?.toISOString()
      })
    }
    
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
          nombreNormalizado: p.nombre.toLowerCase().trim().replace(/\s+/g, ' '),
          imagen: p.imagen || 'null',
          imagenCompleta: p.imagen,
          updatedAt: p.updatedAt?.toISOString() || 'null',
          updatedAtTime: p.updatedAt ? new Date(p.updatedAt).getTime() : 0
        }))
      )
    }
    
    // Log ESPECÍFICO para "ACEITUNA NEGRA N 0 X 5 KG"
    const aceitunaNegra = productosADevolver.find(p => 
      p.nombre.toLowerCase().includes('aceituna') && 
      p.nombre.toLowerCase().includes('negra') &&
      p.nombre.toLowerCase().includes('5 kg')
    )
    if (aceitunaNegra) {
      console.log(`🎯 DEBUG GET ESPECÍFICO: ACEITUNA NEGRA N 0 X 5 KG encontrado:`, {
        id: aceitunaNegra.id,
        nombre: aceitunaNegra.nombre,
        imagen: aceitunaNegra.imagen || 'null',
        imagenCompleta: aceitunaNegra.imagen,
        updatedAt: aceitunaNegra.updatedAt?.toISOString() || 'null',
        updatedAtTime: aceitunaNegra.updatedAt ? new Date(aceitunaNegra.updatedAt).getTime() : 0
      })
    } else {
      console.log(`⚠️ DEBUG GET ESPECÍFICO: ACEITUNA NEGRA N 0 X 5 KG NO ENCONTRADO en productos finales`)
    }
    
    console.log(`✅ Devolviendo ${productosADevolver.length} productos únicos (más reciente por nombre normalizado)`)
    
    // #region agent log
    console.log('[DEBUG] Productos finales devueltos:', {total: productosADevolver.length, productosConImagen: productosADevolver.filter(p=>p.imagen).length, aceitunaNegra: productosADevolver.find(p=>p.nombre.toLowerCase().includes('aceituna')&&p.nombre.toLowerCase().includes('negra'))?.imagen});
    // #endregion
    
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

