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

    console.log('Actualizando producto. Imagen recibida:', imagen)

    // Si hay nombreOriginal, significa que se está renombrando el producto
    // Buscar el producto original por nombre
    const nombreBusqueda = nombreOriginal || nombre
    const producto = await prisma.product.findUnique({
      where: { nombre: nombreBusqueda },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
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

    // Actualizar el producto
    const productoActualizado = await prisma.product.update({
      where: { id: producto.id },
      data: updateData,
    })

    console.log('✅ Producto actualizado en BD:', {
      id: productoActualizado.id,
      nombre: productoActualizado.nombre,
      imagen: productoActualizado.imagen,
      imagenEsNull: productoActualizado.imagen === null,
      imagenEsVacio: productoActualizado.imagen === '',
      imagenCompleta: productoActualizado.imagen
    })

    // VERIFICAR que realmente se guardó correctamente haciendo una consulta fresca
    const productoVerificado = await prisma.product.findUnique({
      where: { id: producto.id },
    })

    console.log('🔍 Verificación post-actualización:', {
      id: productoVerificado?.id,
      nombre: productoVerificado?.nombre,
      imagenVerificada: productoVerificado?.imagen,
      coincide: productoVerificado?.imagen === updateData.imagen
    })

    // Si la verificación no coincide, hay un problema
    if (productoVerificado && productoVerificado.imagen !== updateData.imagen && updateData.imagen !== null) {
      console.error('❌ ERROR: La imagen no se guardó correctamente en la BD!', {
        esperada: updateData.imagen,
        obtenida: productoVerificado.imagen
      })
    }

    return NextResponse.json(productoActualizado)
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

