"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  currentImage?: string | null
  onImageUploaded: (imageUrl: string) => void
  productId?: string
  productName?: string
}

export function ImageUpload({ 
  currentImage, 
  onImageUploaded, 
  productId,
  productName = 'producto'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Actualizar preview cuando currentImage cambie
  // Solo usar imágenes de Supabase, ignorar imágenes por defecto de Unsplash
  useEffect(() => {
    console.log('🔄 ImageUpload - currentImage cambió:', {
      currentImage,
      tipo: typeof currentImage,
      esString: typeof currentImage === 'string',
      tieneContenido: currentImage && typeof currentImage === 'string' && currentImage.trim() !== '',
      esSupabase: currentImage && typeof currentImage === 'string' && currentImage.includes('supabase.co'),
      esUnsplash: currentImage && typeof currentImage === 'string' && currentImage.includes('unsplash.com')
    })
    
    if (
      currentImage && 
      typeof currentImage === 'string' && 
      currentImage.trim() !== '' &&
      !currentImage.includes('unsplash.com')
    ) {
      console.log('✅ Estableciendo preview:', currentImage.trim())
      setPreview(currentImage.trim())
    } else {
      console.log('❌ No hay imagen válida, limpiando preview')
      setPreview(null)
    }
  }, [currentImage])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleFileSelect llamado', e.target.files)
    const file = e.target.files?.[0]
    if (!file) {
      console.log('❌ No se seleccionó ningún archivo')
      // Resetear el input si no hay archivo seleccionado
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    console.log('📄 Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de archivo inválido:', file.type)
      setError('Por favor selecciona un archivo de imagen')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Archivo demasiado grande:', file.size)
      setError('La imagen es demasiado grande. Máximo 5MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setError(null)

    // Crear preview inmediatamente
    const reader = new FileReader()
    reader.onloadend = () => {
      console.log('✅ Preview creado')
      setPreview(reader.result as string)
    }
    reader.onerror = () => {
      console.error('❌ Error al leer el archivo')
      setError('Error al leer el archivo')
    }
    reader.readAsDataURL(file)

    // Subir archivo
    console.log('🚀 Iniciando subida de archivo')
    uploadFile(file)
  }

  // Comprimir imagen antes de subir
  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img') as HTMLImageElement
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Redimensionar si es muy grande
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'))
                return
              }
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              console.log(`📦 Imagen comprimida: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`)
              resolve(compressedFile)
            },
            file.type,
            quality
          )
        }
        img.onerror = () => reject(new Error('Error al cargar la imagen'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Comprimir imagen antes de subir (máximo 1200px de ancho, calidad 80%)
      console.log('🗜️ Comprimiendo imagen...', { 
        tamañoOriginal: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        tipo: file.type 
      })
      
      let fileToUpload = file
      try {
        fileToUpload = await compressImage(file, 1200, 0.8)
      } catch (compressError) {
        console.warn('⚠️ No se pudo comprimir la imagen, subiendo original:', compressError)
        // Si falla la compresión, subir el archivo original
        fileToUpload = file
      }

      const formData = new FormData()
      formData.append('file', fileToUpload)
      if (productId) {
        formData.append('productId', productId)
      }

      console.log('🚀 Subiendo imagen comprimida...', { 
        fileName: fileToUpload.name, 
        size: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`, 
        type: fileToUpload.type 
      })

      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error en respuesta:', data)
        throw new Error(data.error || 'Error al subir la imagen')
      }

      console.log('✅ Imagen subida exitosamente:', data.url)
      
      // Actualizar preview con la URL de Supabase
      const imageUrl = data.url
      setPreview(imageUrl)
      
      // Llamar al callback para actualizar el formulario con la URL de la imagen
      console.log('📤 Llamando onImageUploaded con:', imageUrl)
      onImageUploaded(imageUrl)
      setError(null)
    } catch (err: any) {
      console.error('Error al subir imagen:', err)
      const errorMessage = err.message || 'Error al subir la imagen. Verifica que Supabase Storage esté configurado.'
      setError(errorMessage)
      // No resetear el preview si hay error, para que el usuario pueda intentar de nuevo
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          {preview ? (
            <>
              <img
                src={preview}
                alt={productName}
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
                onError={(e) => {
                  console.error('Error al cargar preview:', preview)
                  setPreview(null)
                }}
              />
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center p-4">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Sin imagen</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`image-upload-${productId || 'new'}`}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="w-full cursor-pointer"
            onClick={() => {
              console.log('🖱️ Click en botón de subir imagen')
              if (fileInputRef.current) {
                console.log('📂 Abriendo selector de archivos')
                fileInputRef.current.click()
              } else {
                console.error('❌ fileInputRef.current es null')
              }
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {preview ? 'Cambiar imagen' : 'Subir imagen'}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG o WEBP. Máximo 5MB
          </p>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                handleRemove()
              }}
              className="w-full mt-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Eliminar imagen
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}


