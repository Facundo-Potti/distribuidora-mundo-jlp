import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Verificar que Supabase esté configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase no configurado:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
      return NextResponse.json(
        { 
          error: 'Supabase Storage no está configurado. Por favor, configura las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY. Consulta CONFIGURAR_SUPABASE_STORAGE.md para más información.' 
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WEBP' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = productId 
      ? `producto-${productId}-${timestamp}.${extension}`
      : `producto-${timestamp}.${extension}`
    
    // Convertir File a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Supabase Storage
    console.log('Intentando subir a Supabase Storage:', {
      bucket: 'productos',
      fileName,
      fileSize: buffer.length,
      contentType: file.type,
    })

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('productos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Permitir sobrescribir si existe (para cambiar imagen)
      })

    if (uploadError) {
      console.error('❌ Error al subir a Supabase:', uploadError)
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al subir la imagen: ' + uploadError.message
      if (uploadError.message.includes('Bucket not found')) {
        errorMessage = 'El bucket "productos" no existe en Supabase Storage. Por favor, créalo siguiendo las instrucciones en CONFIGURAR_SUPABASE_STORAGE.md'
      } else if (uploadError.message.includes('new row violates row-level security')) {
        errorMessage = 'Error de permisos en Supabase Storage. Verifica las políticas RLS del bucket "productos".'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    console.log('✅ Imagen subida exitosamente:', data)

    // Obtener URL pública de la imagen
    const { data: urlData } = supabaseAdmin.storage
      .from('productos')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: fileName,
    })
  } catch (error: any) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen: ' + error.message },
      { status: 500 }
    )
  }
}


