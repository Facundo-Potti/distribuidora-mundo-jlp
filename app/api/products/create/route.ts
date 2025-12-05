import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Crear un nuevo producto
export async function POST(request: NextRequest) {
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

    console.log('Creando producto. Imagen recibida:', imagen)

    if (!nombre || !categoria || !precio || !stock) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Preparar datos del producto
    const productData: any = {
      nombre,
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      activo: true,
    }

    // Manejar imagen: si viene una URL válida, guardarla; si viene null o vacío, mantener null
    if (imagen && imagen.trim() !== '') {
      productData.imagen = imagen.trim()
    } else {
      productData.imagen = null
    }

    // Manejar otros campos opcionales
    productData.descripcion = descripcion && descripcion.trim() !== '' ? descripcion.trim() : null
    productData.unidad = unidad && unidad.trim() !== '' ? unidad.trim() : null

    // Verificar si el producto ya existe
    const productoExistente = await prisma.product.findUnique({
      where: { nombre: nombre },
    })

    if (productoExistente) {
      // Si existe, actualizarlo
      console.log('Producto existe, actualizando:', productData)
      const productoActualizado = await prisma.product.update({
        where: { id: productoExistente.id },
        data: productData,
      })

      return NextResponse.json(productoActualizado)
    }

    // Crear nuevo producto
    console.log('Creando nuevo producto:', productData)
    const nuevoProducto = await prisma.product.create({
      data: productData,
    })

    console.log('Producto creado:', nuevoProducto)

    return NextResponse.json(nuevoProducto)
  } catch (error: any) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto: ' + error.message },
      { status: 500 }
    )
  }
}

