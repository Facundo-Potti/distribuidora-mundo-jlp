import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Actualizar un producto existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nombre, categoria, precio, stock, imagen, descripcion, unidad, nombreOriginal } = body

    console.log('📝 Actualizando producto. Imagen recibida:', imagen)
    console.log('📝 Datos recibidos:', { nombre, nombreOriginal, imagen })

    // Si hay nombreOriginal, significa que se está renombrando el producto
    // Buscar el producto original por nombre
    const nombreBusqueda = nombreOriginal || nombre
    
    // CRÍTICO: Buscar TODOS los productos con ese nombre para detectar duplicados
    const productosConMismoNombre = await prisma.product.findMany({
      where: { nombre: nombreBusqueda },
    })
    
    console.log(`🔍 Productos encontrados con nombre "${nombreBusqueda}":`, productosConMismoNombre.length)
    
    if (productosConMismoNombre.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    // Si hay múltiples productos con el mismo nombre, tomar el más reciente (mayor ID)
    let producto = productosConMismoNombre[0]
    if (productosConMismoNombre.length > 1) {
      console.warn(`⚠️ ADVERTENCIA: Hay ${productosConMismoNombre.length} productos con el nombre "${nombreBusqueda}"`)
      console.warn('⚠️ IDs de productos duplicados:', productosConMismoNombre.map(p => ({ id: p.id, imagen: p.imagen ? p.imagen.substring(0, 80) + '...' : null })))
      
      // Ordenar por ID descendente y tomar el más reciente
      productosConMismoNombre.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id))
        const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id))
        return idB - idA
      })
      producto = productosConMismoNombre[0]
      console.log(`✅ Usando producto más reciente con ID: ${producto.id}`)
    }

    // Si el nombre cambió, verificar que el nuevo nombre no exista
    if (nombre !== nombreBusqueda) {
      const productoConNuevoNombre = await prisma.product.findUnique({
        where: { nombre: nombre },
      })
      if (productoConNuevoNombre) {
        return NextResponse.json(
          { error: 'Ya existe un producto con ese nombre' },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      nombre,
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock),
    }

    // Manejar imagen: si viene una URL válida, guardarla; si viene null o vacío, mantener null
    if (imagen && imagen.trim() !== '') {
      updateData.imagen = imagen.trim()
    } else {
      updateData.imagen = null
    }

    // Manejar otros campos opcionales
    updateData.descripcion = descripcion && descripcion.trim() !== '' ? descripcion.trim() : null
    updateData.unidad = unidad && unidad.trim() !== '' ? unidad.trim() : null

    console.log('📝 Datos a actualizar:', updateData)
    console.log('🔍 Producto encontrado:', { 
      id: producto.id, 
      nombre: producto.nombre, 
      imagenActual: producto.imagen,
      imagenNueva: updateData.imagen
    })

    // CRÍTICO: Si hay productos duplicados, actualizar TODOS para evitar inconsistencias
    let productoActualizado
    if (productosConMismoNombre.length > 1) {
      console.warn(`⚠️ Actualizando ${productosConMismoNombre.length} productos duplicados con el nombre "${nombreBusqueda}"`)
      
      // Actualizar TODOS los productos con el mismo nombre
      const productosActualizados = await Promise.all(
        productosConMismoNombre.map(p => 
          prisma.product.update({
            where: { id: p.id },
            data: updateData,
          })
        )
      )
      
      console.log(`✅ ${productosActualizados.length} productos actualizados`)
      
      // Usar el más reciente como respuesta
      productosActualizados.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id))
        const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id))
        return idB - idA
      })
      
      productoActualizado = productosActualizados[0]
      console.log('✅ Producto principal actualizado:', {
        id: productoActualizado.id,
        nombre: productoActualizado.nombre,
        imagen: productoActualizado.imagen
      })
    } else {
      // Actualizar el producto único
      productoActualizado = await prisma.product.update({
        where: { id: producto.id },
        data: updateData,
      })
    }

    console.log('✅ Producto actualizado en BD:', {
      id: productoActualizado.id,
      nombre: productoActualizado.nombre,
      imagen: productoActualizado.imagen,
      imagenEsNull: productoActualizado.imagen === null,
      imagenEsVacio: productoActualizado.imagen === '',
      imagenCompleta: productoActualizado.imagen
    })

    // FORZAR un refresh de Prisma para asegurar que los cambios se persisten
    // Esperar un momento para que la BD procese la transacción
    await new Promise(resolve => setTimeout(resolve, 100))

    // VERIFICAR que realmente se guardó correctamente haciendo una consulta fresca
    // Usar findFirst con el nombre para evitar problemas de caché
    const productoVerificado = await prisma.product.findFirst({
      where: { 
        nombre: productoActualizado.nombre,
        id: producto.id
      },
    })

    console.log('🔍 Verificación post-actualización:', {
      id: productoVerificado?.id,
      nombre: productoVerificado?.nombre,
      imagenVerificada: productoVerificado?.imagen,
      imagenEsperada: updateData.imagen,
      coincide: productoVerificado?.imagen === updateData.imagen,
      imagenCompletaVerificada: productoVerificado?.imagen
    })

    // Si la verificación no coincide, intentar una segunda verificación después de más tiempo
    if (productoVerificado && productoVerificado.imagen !== updateData.imagen && updateData.imagen !== null) {
      console.warn('⚠️ Primera verificación falló, esperando más tiempo...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const productoVerificado2 = await prisma.product.findFirst({
        where: { 
          nombre: productoActualizado.nombre,
          id: producto.id
        },
      })
      
      console.log('🔍 Segunda verificación:', {
        id: productoVerificado2?.id,
        nombre: productoVerificado2?.nombre,
        imagenVerificada: productoVerificado2?.imagen,
        coincide: productoVerificado2?.imagen === updateData.imagen
      })
      
      if (productoVerificado2 && productoVerificado2.imagen !== updateData.imagen && updateData.imagen !== null) {
        console.error('❌ ERROR: La imagen NO se guardó correctamente en la BD después de múltiples intentos!', {
          esperada: updateData.imagen,
          obtenidaPrimera: productoVerificado?.imagen,
          obtenidaSegunda: productoVerificado2.imagen
        })
        // Devolver el producto actualizado de todos modos, pero con advertencia
      } else {
        console.log('✅ Segunda verificación exitosa, la imagen se guardó correctamente')
        // Usar el producto verificado en lugar del actualizado
        return NextResponse.json(productoVerificado2 || productoActualizado)
      }
    }

    // Devolver el producto verificado si está disponible y coincide, sino el actualizado
    return NextResponse.json(productoVerificado && productoVerificado.imagen === updateData.imagen ? productoVerificado : productoActualizado)
  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto: ' + error.message },
      { status: 500 }
    )
  }
}

// Eliminar un producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nombre } = body

    // Buscar el producto por nombre
    const producto = await prisma.product.findUnique({
      where: { nombre: nombre },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el producto (o marcarlo como inactivo)
    await prisma.product.update({
      where: { id: producto.id },
      data: { activo: false },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto: ' + error.message },
      { status: 500 }
    )
  }
}

