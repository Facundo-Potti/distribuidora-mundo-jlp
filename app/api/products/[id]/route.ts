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


    // Si hay nombreOriginal, significa que se está renombrando el producto
    // Buscar el producto original por nombre
    const nombreBusqueda = nombreOriginal || nombre
    
    // CRÍTICO: Buscar TODOS los productos con ese nombre para detectar duplicados
    let productosConMismoNombre = await prisma.product.findMany({
      where: { nombre: nombreBusqueda },
    })
    
    // Si no encuentra con búsqueda exacta, intentar búsqueda normalizada
    if (productosConMismoNombre.length === 0) {
      const todosLosProductos = await prisma.product.findMany()
      const nombreBusquedaNormalizado = nombreBusqueda.toLowerCase().trim().replace(/\s+/g, ' ')
      productosConMismoNombre = todosLosProductos.filter(p => {
        const nombreNormalizado = p.nombre.toLowerCase().trim().replace(/\s+/g, ' ')
        return nombreNormalizado === nombreBusquedaNormalizado
      })
    }
    
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


    // CRÍTICO: Si hay productos duplicados, actualizar TODOS y marcar los antiguos como inactivos
    let productoActualizado
    if (productosConMismoNombre.length > 1) {
      // Ordenar por ID descendente para identificar el más reciente
      productosConMismoNombre.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id))
        const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id))
        return idB - idA
      })
      
      const productoMasReciente = productosConMismoNombre[0]
      const productosAntiguos = productosConMismoNombre.slice(1)
      
      // Actualizar TODOS los productos con el mismo nombre
      await Promise.all(
        productosConMismoNombre.map(p => 
          prisma.product.update({
            where: { id: p.id },
            data: updateData,
          })
        )
      )
      
      // Marcar los productos antiguos como inactivos para que no aparezcan en las consultas
      if (productosAntiguos.length > 0) {
        await Promise.all(
          productosAntiguos.map(p => 
            prisma.product.update({
              where: { id: p.id },
              data: { activo: false },
            })
          )
        )
      }
      
      productoActualizado = await prisma.product.findUnique({
        where: { id: productoMasReciente.id },
      })
    } else {
      // Actualizar el producto único
      productoActualizado = await prisma.product.update({
        where: { id: producto.id },
        data: updateData,
      })
    }

    // Esperar un momento para que la BD procese la transacción
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verificar que realmente se guardó correctamente
    const productoVerificado = await prisma.product.findFirst({
      where: { 
        nombre: productoActualizado.nombre,
        id: productoActualizado.id,
        activo: { not: false }
      },
    })

    // Si la verificación no coincide, intentar una segunda verificación
    if (!productoVerificado || (productoVerificado.imagen !== updateData.imagen && updateData.imagen !== null)) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const productoVerificado2 = await prisma.product.findFirst({
        where: { 
          nombre: productoActualizado.nombre,
          id: productoActualizado.id,
          activo: { not: false }
        },
      })
      
      return NextResponse.json(productoVerificado2 || productoActualizado)
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

