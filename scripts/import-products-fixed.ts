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
  
  // Función mejorada para parsear CSV con comillas y saltos de línea
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

  // Dividir por líneas, pero manejar saltos de línea dentro de comillas
  const lines: string[] = []
  let currentLine = ''
  let inQuotes = false
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const prevChar = i > 0 ? content[i - 1] : ''
    
    if (char === '"') {
      inQuotes = !inQuotes
      currentLine += char
    } else if (char === '\r') {
      // Ignorar \r
      continue
    } else if (char === '\n') {
      if (inQuotes) {
        // Si estamos dentro de comillas, mantener el salto de línea como parte del contenido
        currentLine += ' '
      } else {
        // Si no estamos en comillas, es un verdadero salto de línea
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
        }
        currentLine = ''
      }
    } else {
      currentLine += char
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim())
  }

  const productos: ProductoCSV[] = []
  let categoriaActual = 'General'
  
  // Procesar cada línea
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const columns = parseCSVLine(line)
    
    // Debug: mostrar primeras líneas (comentado para producción)
    // if (i < 5) {
    //   console.log(`Línea ${i}: ${columns.length} columnas`)
    //   console.log(`  Col 10: "${columns[10]}"`)
    //   console.log(`  Col 11: "${columns[11]}"`)
    //   console.log(`  Col 12: "${columns[12]}"`)
    //   console.log(`  Col 15: "${columns[15]}"`)
    // }
    
    // Saltar líneas con muy pocas columnas o que sean encabezados
    if (columns.length < 10) continue
    
    // Estructura real del CSV:
    // Columnas 0-4: información de encabezado/fecha
    // Columna 5: "CÓDIGO" (encabezado)
    // Columna 6: "DESCRIPCIÓN" (encabezado)
    // Columna 7: "U.V" (encabezado)
    // Columna 8: "LISTA" (encabezado)
    // Columna 9: "% DESC" (encabezado)
    // Columna 10: "PRECIO FINAL" (encabezado) o código/categoría
    // Columna 11: Código del producto o descripción
    // Columna 12: Descripción del producto o unidad
    // Columna 13: Unidad o precio lista
    // Columna 14: Precio lista o descuento
    // Columna 15: Descuento o precio final
    // Columna 16: Precio final o información adicional
    
    const col5 = columns[5]?.trim() || ''
    const col10 = columns[10]?.trim() || ''
    const col11 = columns[11]?.trim() || ''
    const col12 = columns[12]?.trim() || ''
    const col13 = columns[13]?.trim() || ''
    const col14 = columns[14]?.trim() || ''
    const col15 = columns[15]?.trim() || ''
    
    // Si col5 es "CÓDIGO" o "DESCRIPCIÓN", son encabezados, los datos están en columnas 10+
    let codigo = ''
    let descripcion = ''
    let unidad = 'UNI'
    let precioLista = ''
    let precioFinal = ''
    
    // Verificar si col5 es un encabezado (puede tener caracteres especiales)
    const esEncabezado = col5 && (
      col5.includes('CÓDIGO') || col5.includes('CODIGO') || 
      col5.includes('DESCRIPCI') || col5.includes('DESCRIPCION') ||
      col5 === 'U.V' || columns[6]?.trim() === 'U.V'
    )
    
    if (esEncabezado) {
      // Es una línea con encabezados, los datos están en columnas 10+
      // Según el debug anterior:
      // - Columna 10: categoría (ej: "ACEITE") o código (ej: "63")
      // - Columna 11: código (ej: "317") o descripción (ej: "DELICROK ACEITE...")
      // - Columna 12: descripción (ej: "ACEITE GIRASOL...") o unidad (ej: "UNI")
      // - Columna 13: unidad (ej: "UNI") o precio (ej: "95,599.98")
      // - Columna 14: precio lista (ej: "10,700.00") o descuento (ej: "0.00")
      // - Columna 15: descuento (ej: "0.00") o precio final (ej: "95,599.98")
      
      // Detectar si col10 es categoría (texto sin números) o código (número)
      const col10EsCategoria = col10 && !/^\d+$/.test(col10.replace(/\s/g, '')) && 
                               col10.length > 2 && col10.length < 50 &&
                               !col10.match(/^\d+[.,]\d+/) // No es un número decimal
      
      if (col10EsCategoria) {
        // col10 es categoría (ej: "ACEITE")
        categoriaActual = col10
        codigo = col11
        descripcion = col12
        unidad = col13 || 'UNI'
        precioLista = col14 || ''
        // Para categorías, el precio final puede estar en col15 o col14
        precioFinal = (col15 && col15 !== '0.00' && col15 !== 'Page -1 of 1') ? col15 : 
                     (col14 && col14 !== '0.00') ? col14 : ''
      } else {
        // col10 es código (ej: "63")
        codigo = col10
        descripcion = col11
        unidad = col12 || 'UNI'
        precioLista = col13 || ''
        // El precio final está en col15, si es 0.00 o texto, usar col14
        precioFinal = (col15 && col15 !== '0.00' && col15 !== 'Page -1 of 1' && col15 !== 'LISTA 1') ? col15 : 
                     (col14 && col14 !== '0.00') ? col14 : 
                     precioLista
      }
    } else {
      // Formato alternativo (si no tiene encabezados repetidos)
      codigo = col5
      descripcion = columns[6]?.trim() || ''
      unidad = columns[7]?.trim() || 'UNI'
      precioLista = columns[8]?.trim() || ''
      precioFinal = col10 || precioLista
    }
    
    // Detectar categorías (aparecen cuando col10 es texto sin números y no hay descripción válida)
    if (col10 && !descripcion && !precioFinal) {
      // Es probablemente una categoría
      if (col10.length > 2 && col10.length < 50 && !/^\d+$/.test(col10.replace(/\s/g, ''))) {
        categoriaActual = col10
        continue
      }
    }
    
    // Saltar encabezados
    if (descripcion === 'U.V' || descripcion === 'DESCRIPCIÓN' || descripcion === 'DESCRIPCION' || 
        descripcion === 'CÓDIGO' || descripcion === 'CODIGO') {
      continue
    }
    
    // Si no hay descripción válida, saltar
    if (!descripcion || descripcion.length < 3) {
      continue
    }
    
    // Si precioFinal es "0.00" pero hay precioLista, usar precioLista
    if (precioFinal === '0.00' && precioLista && precioLista !== '0.00') {
      precioFinal = precioLista
    }
    
    // Si no hay precio, probablemente no es un producto
    if (!precioFinal && !precioLista) {
      continue
    }
    
    // Limpiar precio (remover comas de miles, puntos de miles, espacios)
    const precio = precioFinal || precioLista || '0'
    const precioLimpio = precio
      .replace(/\./g, '') // Remover puntos de miles
      .replace(',', '.')  // Convertir coma decimal a punto
      .replace(/\s/g, '') // Remover espacios
      .trim()
    
    // Validar que el precio sea un número válido
    const precioNum = parseFloat(precioLimpio)
    if (isNaN(precioNum) || precioNum <= 0) {
      continue
    }
    
    // Determinar si col5 es un código o categoría
    const tieneCodigo = col5 && /^\d+/.test(col5.replace(/\s/g, ''))
    
    const producto: ProductoCSV = {
      nombre: descripcion,
      categoria: categoriaActual,
      precio: precioLimpio,
      unidad: unidad || 'UNI',
      stock: '0',
      descripcion: tieneCodigo ? `Código: ${col5}` : null,
      imagen: null,
    }

    productos.push(producto)
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

        const data = {
          nombre: producto.nombre.trim(),
          categoria: producto.categoria.trim() || 'General',
          precio: precio,
          unidad: producto.unidad.trim() || 'unidad',
          stock: isNaN(stock) ? 0 : stock,
          descripcion: producto.descripcion?.trim() || null,
          imagen: producto.imagen?.trim() || null,
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

        // Verificar si fue creado o actualizado
        const existe = await prisma.product.findUnique({
          where: { nombre: data.nombre },
        })
        
        if (existe) {
          const fueCreado = existe.createdAt.getTime() === existe.updatedAt.getTime()
          if (fueCreado && resultado.createdAt.getTime() === resultado.updatedAt.getTime()) {
            creados++
            if (creados % 50 === 0) {
              console.log(`✅ Procesados ${creados} productos...`)
            }
          } else {
            actualizados++
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

