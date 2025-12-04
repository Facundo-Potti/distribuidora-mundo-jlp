import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

/**
 * API Route para inicializar la base de datos en producción
 * Solo se puede ejecutar si no hay usuarios en la base de datos
 * 
 * Uso: POST /api/admin/init-db
 * 
 * IMPORTANTE: Después de usar esta ruta, elimínala o protégela con autenticación
 */
export async function POST(request: Request) {
  try {
    // Verificar si ya hay usuarios
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { 
          error: "La base de datos ya está inicializada",
          message: "Ya existen usuarios en la base de datos. Si necesitas recrear, elimina todos los usuarios primero."
        },
        { status: 400 }
      )
    }

    // Crear usuarios iniciales
    const adminPassword = await bcrypt.hash("admin123", 10)
    const demoPassword = await bcrypt.hash("demo123", 10)

    const admin = await prisma.user.upsert({
      where: { email: "admin@mundojlp.com" },
      update: {},
      create: {
        email: "admin@mundojlp.com",
        name: "Administrador",
        password: adminPassword,
        role: "admin",
      },
    })

    const demo = await prisma.user.upsert({
      where: { email: "demo@mundojlp.com" },
      update: {},
      create: {
        email: "demo@mundojlp.com",
        name: "Usuario Demo",
        password: demoPassword,
        role: "user",
      },
    })

    // Crear algunos productos de ejemplo
    const productos = [
      {
        nombre: "Harina 000",
        categoria: "Harinas",
        precio: 1500.0,
        unidad: "kg",
        stock: 100,
        activo: true,
      },
      {
        nombre: "Azúcar Refinada",
        categoria: "Endulzantes",
        precio: 800.0,
        unidad: "kg",
        stock: 50,
        activo: true,
      },
      {
        nombre: "Aceite de Girasol",
        categoria: "Aceites",
        precio: 1200.0,
        unidad: "litro",
        stock: 30,
        activo: true,
      },
    ]

    for (const producto of productos) {
      await prisma.product.upsert({
        where: { nombre: producto.nombre },
        update: {},
        create: producto,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada correctamente",
      users: {
        admin: {
          email: admin.email,
          role: admin.role,
        },
        demo: {
          email: demo.email,
          role: demo.role,
        },
      },
      credentials: {
        admin: {
          email: "admin@mundojlp.com",
          password: "admin123",
        },
        demo: {
          email: "demo@mundojlp.com",
          password: "demo123",
        },
      },
    })
  } catch (error) {
    console.error("Error inicializando base de datos:", error)
    return NextResponse.json(
      { 
        error: "Error al inicializar la base de datos",
        message: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}

