import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Primero obtener todos los productos para debugging
    const allProducts = await prisma.product.findMany({
      orderBy: {
        nombre: 'asc',
      },
    })
    
    console.log(`📦 API /products: Total productos en BD: ${allProducts.length}`)
    
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
    
    // Verificar si hay productos duplicados por nombre (esto podría causar problemas)
    const nombres = productosADevolver.map(p => p.nombre)
    const nombresDuplicados = nombres.filter((nombre, index) => nombres.indexOf(nombre) !== index)
    if (nombresDuplicados.length > 0) {
      console.warn('⚠️ ADVERTENCIA: Hay productos con nombres duplicados:', nombresDuplicados)
      nombresDuplicados.forEach(nombre => {
        const productosDuplicados = productosADevolver.filter(p => p.nombre === nombre)
        console.warn(`⚠️ Producto "${nombre}" aparece ${productosDuplicados.length} veces:`, productosDuplicados.map(p => ({
          id: p.id,
          imagen: p.imagen ? p.imagen.substring(0, 80) + '...' : null
        })))
      })
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

