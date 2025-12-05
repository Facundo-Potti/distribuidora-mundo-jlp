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

    if (!nombre || !categoria || !precio || !stock) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el producto ya existe
    const productoExistente = await prisma.product.findUnique({
      where: { nombre: nombre },
    })

    if (productoExistente) {
      // Si existe, actualizarlo
      const productoActualizado = await prisma.product.update({
        where: { id: productoExistente.id },
        data: {
          categoria,
          precio: parseFloat(precio),
          stock: parseInt(stock),
          imagen: imagen || null,
          descripcion: descripcion || null,
          unidad: unidad || null,
          activo: true,
        },
      })

      return NextResponse.json(productoActualizado)
    }

    // Crear nuevo producto
    const nuevoProducto = await prisma.product.create({
      data: {
        nombre,
        categoria,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagen || null,
        descripcion: descripcion || null,
        unidad: unidad || null,
        activo: true,
      },
    })

    return NextResponse.json(nuevoProducto)
  } catch (error: any) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto: ' + error.message },
      { status: 500 }
    )
  }
}

