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
  
  // Actualizar preview cuando currentImage cambie (solo imágenes de Supabase)
  useEffect(() => {
    // No actualizar durante subida, ya que se maneja manualmente
    if (uploading) {
      return
    }
    
    // Si hay una imagen válida de Supabase, usarla
    if (
      currentImage && 
      typeof currentImage === 'string' && 
      currentImage.trim() !== '' &&
      currentImage.includes('supabase.co') &&
      !currentImage.includes('unsplash.com')
    ) {
      const imagenTrimmed = currentImage.trim()
      console.log('🖼️ ImageUpload: Actualizando preview con imagen de Supabase:', imagenTrimmed)
      setPreview(imagenTrimmed)
    } 
    // Si la imagen está vacía o es null, limpiar el preview
    else if (!currentImage || (typeof currentImage === 'string' && currentImage.trim() === '')) {
      console.log('🖼️ ImageUpload: Limpiando preview (imagen vacía o null)')
      setPreview(null)
    }
    // Si hay una imagen pero no es de Supabase (puede ser una URL manual), también mostrarla
    else if (
      currentImage && 
      typeof currentImage === 'string' && 
      currentImage.trim() !== '' &&
      currentImage.startsWith('http') &&
      !currentImage.includes('unsplash.com')
    ) {
      const imagenTrimmed = currentImage.trim()
      console.log('🖼️ ImageUpload: Actualizando preview con URL manual:', imagenTrimmed)
      setPreview(imagenTrimmed)
    }
  }, [currentImage, uploading])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tamaño (3MB máximo para más velocidad)
    if (file.size > 3 * 1024 * 1024) {
      setError('La imagen es demasiado grande. Máximo 3MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setError(null)

    // Crear preview rápido
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Subir inmediatamente
    uploadFile(file)
  }

  // Comprimir imagen antes de subir (más rápido, menos calidad)
  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.6): Promise<File> => {
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
      // Comprimir imagen rápidamente (máximo 600px, calidad 60% para máxima velocidad)
      let fileToUpload = file
      
      // Solo comprimir si el archivo es mayor a 500KB
      if (file.size > 500 * 1024) {
        try {
          fileToUpload = await compressImage(file, 600, 0.6)
        } catch (compressError) {
          console.warn('⚠️ No se pudo comprimir, subiendo original')
          fileToUpload = file
        }
      }

      const formData = new FormData()
      formData.append('file', fileToUpload)
      if (productId) {
        formData.append('productId', productId)
      }

      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir la imagen')
      }

      const data = await response.json()
      const imageUrl = data.url
      
      if (!imageUrl || !imageUrl.includes('supabase.co')) {
        throw new Error('URL de imagen inválida recibida del servidor')
      }
      
      console.log('✅ ImageUpload: Imagen subida exitosamente:', imageUrl)
      
      // Actualizar preview inmediatamente
      setPreview(imageUrl)
      setError(null)
      
      // Llamar al callback para actualizar el formulario padre
      // Usar setTimeout para asegurar que el estado se actualice
      setTimeout(() => {
        onImageUploaded(imageUrl)
        console.log('✅ ImageUpload: Callback ejecutado con URL:', imageUrl)
      }, 50)
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
    console.log('🗑️ ImageUpload: Eliminando imagen')
    setPreview(null)
    // Notificar al componente padre que se eliminó la imagen
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
              fileInputRef.current?.click()
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


