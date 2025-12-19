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
      const productoEncontrado = todosLosProductos.find(p => {
        const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
        return nombreNormalizado === nombreBusquedaNormalizado
      })
      if (productoEncontrado) {
        producto = productoEncontrado
      }
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

    // Manejar imagen: si viene una URL válida, guardarla; si viene null o vacío, mantener null
    const imagenParaGuardar = imagen && imagen.trim() !== '' ? imagen.trim() : null
    
    // Log de la imagen que se va a guardar
    console.log(`💾 Actualizando producto "${nombre}" (ID: ${producto.id})`)
    console.log(`🖼️ Imagen actual en BD: ${producto.imagen || 'null'}`)
    console.log(`🖼️ Imagen nueva a guardar: ${imagenParaGuardar || 'null'}`)

    // Preparar datos de actualización
    const updateData: any = {
      nombre,
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      imagen: imagenParaGuardar,
    }

    // Manejar otros campos opcionales
    updateData.descripcion = descripcion && descripcion.trim() !== '' ? descripcion.trim() : null
    updateData.unidad = unidad && unidad.trim() !== '' ? unidad.trim() : null

    // ACTUALIZAR EL PRODUCTO DIRECTAMENTE POR ID
    // NO forzar updatedAt - Prisma lo maneja automáticamente con @updatedAt
    // Si intentamos forzarlo manualmente, podría causar conflictos
    const updateDataConTimestamp = updateData
    
    console.log(`💾 Guardando producto completo en BD:`, {
      id: producto.id,
      nombre: updateData.nombre,
      categoria: updateData.categoria,
      precio: updateData.precio,
      stock: updateData.stock,
      imagen: updateData.imagen || 'null',
      descripcion: updateData.descripcion || 'null',
      unidad: updateData.unidad || 'null'
    })
    
    const productoActualizado = await prisma.product.update({
      where: { id: producto.id },
      data: updateDataConTimestamp,
    })

    console.log(`✅ Producto actualizado en BD:`, {
      id: productoActualizado.id,
      nombre: productoActualizado.nombre,
      categoria: productoActualizado.categoria,
      precio: productoActualizado.precio,
      stock: productoActualizado.stock,
      imagen: productoActualizado.imagen || 'null',
      imagenCompleta: productoActualizado.imagen,
      updatedAt: productoActualizado.updatedAt,
      updatedAtISO: productoActualizado.updatedAt?.toISOString() || 'null',
      updatedAtTime: productoActualizado.updatedAt ? new Date(productoActualizado.updatedAt).getTime() : 0
    })

    // Esperar un momento para asegurar que la transacción se complete
    await new Promise(resolve => setTimeout(resolve, 300))

    // Verificar que realmente se guardó correctamente usando findFirst para evitar caché
    const productoVerificado = await prisma.product.findFirst({
      where: { 
        id: producto.id,
      },
    })

    if (productoVerificado) {
      console.log(`🔍 Verificación completa del producto guardado:`, {
        id: productoVerificado.id,
        nombre: productoVerificado.nombre,
        categoria: productoVerificado.categoria,
        precio: productoVerificado.precio,
        stock: productoVerificado.stock,
        imagen: productoVerificado.imagen || 'null',
        updatedAt: productoVerificado.updatedAt
      })
      console.log(`🔍 Comparación de imagen: Esperada: ${imagenParaGuardar || 'null'}, Verificada: ${productoVerificado.imagen || 'null'}, Coinciden: ${imagenParaGuardar === productoVerificado.imagen}`)
      
      // Si la imagen no coincide, forzar una actualización directa
      if (imagenParaGuardar !== null && productoVerificado.imagen !== imagenParaGuardar) {
        console.log(`⚠️ Imagen no coincide, forzando actualización directa...`)
        
        // Forzar actualización directa de la imagen
        await prisma.product.update({
          where: { id: producto.id },
          data: { imagen: imagenParaGuardar },
        })
        
        // Esperar nuevamente
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Obtener el producto actualizado nuevamente
        const productoFinal = await prisma.product.findFirst({
          where: { id: producto.id },
        })
        
        console.log(`✅ Imagen forzada. Imagen final: ${productoFinal?.imagen || 'null'}`)
        
        if (productoFinal) {
          return NextResponse.json(productoFinal)
        }
      } else if (imagenParaGuardar === null && productoVerificado.imagen !== null) {
        // Si se envió null pero hay una imagen, también forzar la actualización
        console.log(`⚠️ Imagen debería ser null pero hay imagen en BD, forzando actualización...`)
        await prisma.product.update({
          where: { id: producto.id },
          data: { imagen: null },
        })
        await new Promise(resolve => setTimeout(resolve, 300))
        const productoFinal = await prisma.product.findFirst({
          where: { id: producto.id },
        })
        if (productoFinal) {
          return NextResponse.json(productoFinal)
        }
      } else {
        console.log(`✅ Imagen coincide correctamente`)
      }
    }

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

