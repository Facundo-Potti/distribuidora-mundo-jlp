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
    // IMPORTANTE: Si imagen viene explícitamente como null o string vacío, se guardará como null
    // Si imagen viene con una URL válida (no de Unsplash), se guardará esa URL
    let imagenParaGuardar: string | null = null
    if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && !imagen.includes('unsplash.com')) {
      imagenParaGuardar = imagen.trim()
    }
    
    // Log de la imagen que se va a guardar
    console.log(`💾 Actualizando producto "${nombre}" (ID: ${producto.id})`)
    console.log(`🖼️ Imagen actual en BD: ${producto.imagen || 'null'}`)
    console.log(`🖼️ Imagen recibida del request: ${imagen || 'null'}`)
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

    // #region agent log
    console.log('[DEBUG] Producto actualizado en BD:', {id: productoActualizado.id, nombre: productoActualizado.nombre, imagen: productoActualizado.imagen, imagenEsNull: productoActualizado.imagen===null, updatedAt: productoActualizado.updatedAt?.toISOString()});
    // #endregion
    console.log(`✅ Producto actualizado en BD:`, {
      id: productoActualizado.id,
      nombre: productoActualizado.nombre,
      imagen: productoActualizado.imagen || 'null',
      updatedAt: productoActualizado.updatedAt?.toISOString() || 'null'
    })

    // Devolver el producto actualizado inmediatamente con headers sin caché
    return NextResponse.json(productoActualizado, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
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
  { params }: { params: Promise<{ id: string }> }
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

    // En Next.js 14+, params es una Promise que necesita ser awaited
    const { id: idFromParams } = await params

    // Intentar buscar por ID primero (desde params)
    let producto = null
    try {
      producto = await prisma.product.findUnique({
        where: { id: idFromParams },
      })
    } catch (error) {
      // Si falla buscar por ID, producto seguirá siendo null
    }

    // Si no se encontró por ID, leer el body y buscar por nombre (compatibilidad con código antiguo)
    if (!producto) {
      try {
        const body = await request.json()
        const { nombre } = body
        if (nombre) {
          producto = await prisma.product.findUnique({
            where: { nombre: nombre },
          })
        }
      } catch (error) {
        // Si falla al leer el body o buscar, producto seguirá siendo null
      }
    }

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

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto: ' + error.message },
      { status: 500 }
    )
  }
}

