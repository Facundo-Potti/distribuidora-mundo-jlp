import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ProductoCSV {
  nombre: string
  categoria: string
  precio: string | number
  unidad: string
  stock?: string | number
  descripcion?: string
  imagen?: string
}

function parseCSV(filePath: string): ProductoCSV[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length === 0) {
    throw new Error('El archivo CSV está vacío')
  }

  // Función para parsear CSV con comillas correctamente
  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const productos: ProductoCSV[] = []
  let categoriaActual = 'General'
  
  // Saltar la primera línea si es encabezado
  const startIndex = lines[0].toLowerCase().includes('código') || lines[0].toLowerCase().includes('codigo') ? 1 : 0
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    const columns = parseCSVLine(line)
    
    // Si la línea tiene menos de 11 columnas, probablemente no es un producto válido
    if (columns.length < 11) continue
    
    // Estructura del CSV:
    // Columna 0-4: información de encabezado/fecha
    // Columna 5: CÓDIGO o categoría
    // Columna 6: DESCRIPCIÓN (nombre del producto)
    // Columna 7: U.V (unidad de venta)
    // Columna 8: LISTA (precio de lista)
    // Columna 9: % DESC (descuento)
    // Columna 10: PRECIO FINAL
    // Columna 11+: información adicional
    
    const col5 = columns[5]?.trim() || ''
    const descripcion = columns[6]?.trim() || ''
    const unidad = columns[7]?.trim() || 'UNI'
    const precioLista = columns[8]?.trim() || ''
    const precioFinal = columns[10]?.trim() || precioLista
    
    // Si la descripción está vacía o es muy corta, saltar
    if (!descripcion || descripcion.length < 3) continue
    
    // Detectar si es una línea de categoría
    // Las categorías aparecen cuando:
    // - col5 es una palabra en mayúsculas sin código numérico
    // - descripcion está vacía o es igual a col5
    // - no hay precio
    if (col5 && !descripcion && !precioFinal) {
      // Es una categoría
      if (col5.length > 2 && col5.length < 50) {
        categoriaActual = col5
        continue
      }
    }
    
    // Si descripcion es "U.V" o similar, es un encabezado, saltar
    if (descripcion === 'U.V' || descripcion === 'DESCRIPCIÓN' || descripcion === 'DESCRIPCION') {
      continue
    }
    
    // Si no hay código pero hay descripción y precio, es un producto
    // Si hay código numérico, es definitivamente un producto
    const tieneCodigo = col5 && /^\d+$/.test(col5.replace(/\s/g, ''))
    
    if (!tieneCodigo && !precioFinal && !precioLista) {
      // Podría ser una categoría si col5 es texto
      if (col5 && col5.length > 2 && col5.length < 50) {
        categoriaActual = col5
        continue
      }
      continue
    }
    
    // Usar precio final si está disponible, sino precio de lista
    const precio = precioFinal || precioLista || '0'
    
    // Limpiar precio (remover comas de miles y espacios)
    const precioLimpio = precio.replace(/\./g, '').replace(',', '.').replace(/\s/g, '')
    
    const producto: ProductoCSV = {
      nombre: descripcion,
      categoria: categoriaActual,
      precio: precioLimpio,
      unidad: unidad,
      stock: '0',
      descripcion: col5 && tieneCodigo ? `Código: ${col5}` : undefined,
      imagen: undefined,
    }

    // Validar que tenga nombre y precio válido
    if (producto.nombre && producto.nombre.length > 2 && precioLimpio !== '0' && !isNaN(parseFloat(precioLimpio))) {
      productos.push(producto)
    }
  }
  
  return productos
}

async function importProducts(csvPath: string) {
  try {
    console.log('📦 Iniciando importación de productos desde CSV...')
    console.log(`📄 Archivo: ${csvPath}`)

    if (!fs.existsSync(csvPath)) {
      throw new Error(`El archivo ${csvPath} no existe`)
    }

    const productos = parseCSV(csvPath)
    console.log(`✅ ${productos.length} productos encontrados en el CSV`)

    let creados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productos) {
      try {
        const precio = parseFloat(String(producto.precio).replace(',', '.'))
        const stock = producto.stock ? parseInt(String(producto.stock)) : 0

        if (isNaN(precio)) {
          console.warn(`⚠️  Producto "${producto.nombre}": precio inválido, usando 0`)
        }

        const data = {
          nombre: producto.nombre.trim(),
          categoria: producto.categoria.trim() || 'General',
          precio: isNaN(precio) ? 0 : precio,
          unidad: producto.unidad.trim() || 'unidad',
          stock: isNaN(stock) ? 0 : stock,
          descripcion: producto.descripcion?.trim() || undefined,
          imagen: producto.imagen?.trim() || undefined,
          activo: true,
        }

        const resultado = await prisma.product.upsert({
          where: { nombre: data.nombre },
          update: {
            categoria: data.categoria,
            precio: data.precio,
            unidad: data.unidad,
            stock: data.stock,
            descripcion: data.descripcion,
            imagen: data.imagen,
          },
          create: data,
        })

        if (resultado) {
          // Verificar si fue creado o actualizado
          const existe = await prisma.product.findUnique({
            where: { nombre: data.nombre },
          })
          
          if (existe && existe.createdAt.getTime() === existe.updatedAt.getTime()) {
            creados++
            console.log(`✅ Creado: ${data.nombre}`)
          } else {
            actualizados++
            console.log(`🔄 Actualizado: ${data.nombre}`)
          }
        }
      } catch (error: any) {
        errores++
        console.error(`❌ Error con "${producto.nombre}":`, error.message)
      }
    }

    console.log('\n📊 Resumen de importación:')
    console.log(`   ✅ Creados: ${creados}`)
    console.log(`   🔄 Actualizados: ${actualizados}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`   📦 Total procesados: ${productos.length}`)
    console.log('\n🎉 Importación completada!')

  } catch (error: any) {
    console.error('❌ Error durante la importación:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
const csvPath = process.argv[2] || path.join(process.cwd(), 'productos.csv')

if (require.main === module) {
  importProducts(csvPath)
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { importProducts }

