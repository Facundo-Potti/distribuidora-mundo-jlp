import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando imágenes en la base de datos...\n')
    
    // Buscar productos con imágenes de Supabase
    const productos = await prisma.product.findMany({
      where: {
        activo: true,
      },
      select: {
        nombre: true,
        imagen: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    })
    
    console.log(`📦 Total productos: ${productos.length}\n`)
    
    // Productos con imagen de Supabase
    const conSupabase = productos.filter(p => 
      p.imagen && 
      typeof p.imagen === 'string' && 
      p.imagen.includes('supabase.co')
    )
    
    console.log(`✅ Productos con imagen Supabase: ${conSupabase.length}`)
    console.log(`❌ Productos sin imagen o con Unsplash: ${productos.length - conSupabase.length}\n`)
    
    // Mostrar primeros 10 productos con Supabase
    if (conSupabase.length > 0) {
      console.log('📸 Primeros productos con imagen Supabase:')
      conSupabase.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.nombre}`)
        console.log(`   Imagen: ${p.imagen}\n`)
      })
    }
    
    // Buscar producto específico
    const productoEspecifico = productos.find(p => 
      p.nombre && p.nombre.includes('ACEITUNA NEGRA N 00 BALDE')
    )
    
    if (productoEspecifico) {
      console.log('\n🔍 Producto específico encontrado:')
      console.log(`   Nombre: ${productoEspecifico.nombre}`)
      console.log(`   Imagen: ${productoEspecifico.imagen}`)
      console.log(`   Tipo: ${typeof productoEspecifico.imagen}`)
      console.log(`   Es null: ${productoEspecifico.imagen === null}`)
      console.log(`   Es Supabase: ${productoEspecifico.imagen && typeof productoEspecifico.imagen === 'string' && productoEspecifico.imagen.includes('supabase.co')}`)
    } else {
      console.log('\n❌ Producto específico no encontrado')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

