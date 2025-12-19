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

    // Buscar el producto por nombre (usar nombreOriginal si existe, sino el nombre actual)
    const nombreBusqueda = nombreOriginal || nombre
    
    // Buscar el producto por nombre exacto primero
    let producto = await prisma.product.findFirst({
      where: { nombre: nombreBusqueda },
    })
    
    // Si no lo encuentra, buscar con nombre normalizado
    if (!producto) {
      const todosLosProductos = await prisma.product.findMany()
      const nombreBusquedaNormalizado = nombreBusqueda.toLowerCase().trim().replace(/\s+/g, ' ')
      producto = todosLosProductos.find(p => {
        const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
        return nombreNormalizado === nombreBusquedaNormalizado
      })
    }
    
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

    // ACTUALIZAR EL PRODUCTO DIRECTAMENTE POR ID
    const productoActualizado = await prisma.product.update({
      where: { id: producto.id },
      data: updateData,
    })

    // Esperar un momento para que la BD procese la transacción
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que realmente se guardó correctamente
    const productoVerificado = await prisma.product.findUnique({
      where: { id: producto.id },
    })

    return NextResponse.json(productoVerificado || productoActualizado)
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

