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
    
    // Log para verificar imágenes de productos específicos
    const productosConImagen = productosADevolver.filter(p => p.imagen && p.imagen.includes('supabase.co'))
    console.log(`📦 API /products: Productos con imagen Supabase: ${productosConImagen.length}`)
    
    // Log de los primeros productos para debugging
    if (productosADevolver.length > 0) {
      console.log('📦 Primeros productos a devolver:', productosADevolver.slice(0, 3).map(p => ({
        nombre: p.nombre,
        categoria: p.categoria,
        activo: p.activo,
        tieneImagen: !!p.imagen,
        imagen: p.imagen ? p.imagen.substring(0, 100) + '...' : null
      })))
    }
    
    // Log específico para "Aceite de Girasol" para debugging
    const aceiteGirasol = productosADevolver.filter(p => p.nombre === 'Aceite de Girasol')
    if (aceiteGirasol.length > 0) {
      console.log(`🔍 DEBUG: Producto "Aceite de Girasol" encontrado ${aceiteGirasol.length} vez(ces):`, aceiteGirasol.map(p => ({
        id: p.id,
        nombre: p.nombre,
        imagen: p.imagen ? p.imagen.substring(0, 120) + '...' : null,
        activo: p.activo
      })))
    }
    
    // Verificar si hay productos duplicados por nombre (esto podría causar problemas)
    const nombres = productosADevolver.map(p => p.nombre)
    const nombresDuplicados = nombres.filter((nombre, index) => nombres.indexOf(nombre) !== index)
    if (nombresDuplicados.length > 0) {
      console.warn('⚠️ ADVERTENCIA: Hay productos con nombres duplicados:', nombresDuplicados)
      nombresDuplicados.forEach(nombre => {
        const productosDuplicados = productosADevolver.filter(p => p.nombre === nombre)
        console.warn(`⚠️ Producto "${nombre}" aparece ${productosDuplicados.length} veces:`, productosDuplicados.map(p => ({
          id: p.id,
          imagen: p.imagen ? p.imagen.substring(0, 100) + '...' : null,
          activo: p.activo,
          imagenCompleta: p.imagen
        })))
      })
      
      // Si hay duplicados, tomar solo el más reciente basándose en la imagen más reciente
      // Agrupar productos por nombre y tomar el que tenga la imagen más reciente
      const productosPorNombre = new Map<string, typeof productosADevolver>()
      
      productosADevolver.forEach(p => {
        const nombreNormalizado = p.nombre.toLowerCase().trim()
        if (!productosPorNombre.has(nombreNormalizado)) {
          productosPorNombre.set(nombreNormalizado, [])
        }
        productosPorNombre.get(nombreNormalizado)!.push(p)
      })
      
      const productosSinDuplicados: typeof productosADevolver = []
      
      productosPorNombre.forEach((productos, nombreNormalizado) => {
        if (productos.length === 1) {
          // Solo hay uno, agregarlo directamente
          productosSinDuplicados.push(productos[0])
        } else {
          // Hay duplicados, tomar el que tenga la imagen más reciente
          console.warn(`⚠️ Filtrando ${productos.length} productos duplicados con nombre "${productos[0].nombre}"`)
          
          // Función para extraer timestamp del nombre del archivo
          const extractTimestamp = (url: string | null): number => {
            if (!url || !url.includes('supabase.co')) return 0
            const match = url.match(/producto-[^-]+-(\d+)\./i)
            return match ? parseInt(match[1]) : 0
          }
          
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
          
          const productoSeleccionado = productos[0]
          console.log(`✅ Seleccionado producto con imagen más reciente:`, {
            id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            imagen: productoSeleccionado.imagen ? productoSeleccionado.imagen.substring(0, 100) + '...' : null,
            timestamp: extractTimestamp(productoSeleccionado.imagen)
          })
          
          productosSinDuplicados.push(productoSeleccionado)
        }
      })
      
      if (productosSinDuplicados.length < productosADevolver.length) {
        console.log(`🔧 Filtrando duplicados: ${productosADevolver.length} -> ${productosSinDuplicados.length}`)
        return NextResponse.json(productosSinDuplicados, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
      }
    }

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

