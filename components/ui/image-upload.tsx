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
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Log inicial cuando el componente se monta
  useEffect(() => {
    console.log('🖼️ ImageUpload montado/actualizado:', {
      productId,
      productName,
      currentImage,
      preview,
      tipoCurrentImage: typeof currentImage,
      esSupabase: currentImage && currentImage.includes('supabase.co')
    })
  }, [])

  // Actualizar preview cuando currentImage cambie
  useEffect(() => {
    console.log('🔄 ImageUpload - currentImage cambió:', {
      currentImage,
      tipo: typeof currentImage,
      esString: typeof currentImage === 'string',
      tieneContenido: currentImage && currentImage.trim() !== '',
      esSupabase: currentImage && currentImage.includes('supabase.co')
    })
    if (currentImage && currentImage.trim() !== '') {
      console.log('✅ ImageUpload - Estableciendo preview:', currentImage)
      setPreview(currentImage)
    } else {
      console.log('❌ ImageUpload - No hay imagen, limpiando preview')
      setPreview(null)
    }
  }, [currentImage])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      // Resetear el input si no hay archivo seleccionado
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

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
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
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (productId) {
        formData.append('productId', productId)
      }

      console.log('Subiendo imagen...', { fileName: file.name, size: file.size, type: file.type })

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
      setPreview(data.url)
      onImageUploaded(data.url)
      
      // Mostrar mensaje de éxito temporal
      setError(null)
      setTimeout(() => {
        // El mensaje de éxito desaparece automáticamente
      }, 2000)
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
              <Image
                src={preview}
                alt={productName}
                fill
                className="object-cover"
                sizes="128px"
              />
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`image-upload-${productId || 'new'}`}
          />
          <label htmlFor={`image-upload-${productId || 'new'}`}>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="w-full cursor-pointer"
              asChild
            >
              <span className="flex items-center justify-center">
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
              </span>
            </Button>
          </label>
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


