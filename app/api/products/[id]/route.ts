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
    const { nombre, categoria, precio, stock, imagen, descripcion, unidad } = body

    // params.id puede ser un ID real o un nombre (para compatibilidad)
    // Intentar buscar por ID primero
    let producto = null
    
    // Intentar convertir params.id a número/string ID
    const idFromParams = params.id
    
    // Buscar por ID directamente (puede ser string o number)
    try {
      producto = await prisma.product.findUnique({
        where: { id: idFromParams },
      })
    } catch (error) {
      // Si falla, intentar buscar por nombre (compatibilidad con código antiguo)
      producto = await prisma.product.findFirst({
        where: { nombre: decodeURIComponent(idFromParams) },
      })
    }

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Si el nombre cambió, verificar que el nuevo nombre no exista
    if (nombre !== producto.nombre) {
      const productoConNuevoNombre = await prisma.product.findFirst({
        where: { 
          nombre: nombre,
          id: { not: producto.id } // Excluir el producto actual
        },
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

    // Actualizar el producto por su ID (único)
    console.log(`💾 Guardando producto completo en BD:`, {
      productoId: producto.id,
      nombre: producto.nombre,
      datosActualizacion: {
        nombre: updateData.nombre,
        categoria: updateData.categoria,
        precio: updateData.precio,
        stock: updateData.stock,
        imagen: updateData.imagen || 'null',
      }
    })
    
    // Actualizar el producto específico por su ID
    const productoActualizado = await prisma.product.update({
      where: { id: producto.id },
      data: updateData,
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

