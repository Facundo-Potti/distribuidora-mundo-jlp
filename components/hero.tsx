"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Instagram } from "lucide-react"
import { useEffect, useState } from "react"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImageLoad = (key: string) => {
    setImagesLoaded(prev => ({ ...prev, [key]: true }))
  }

  return (
    <section className="relative bg-white py-32 md:py-48 overflow-hidden">
      {/* Patrón sutil de fondo */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Contenido de texto */}
          <div className="text-center md:text-left">
            {/* Badge destacado */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="text-sm md:text-base font-bold">+40 Años de Experiencia</span>
            </div>
            
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="text-black">Distribuidor Mayorista de</span>{" "}
              <span className="text-primary block md:inline">Materia Prima</span>
            </h1>
            <p className={`text-xl md:text-2xl lg:text-3xl text-gray-700 mb-10 font-medium leading-relaxed transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Atendiendo <span className="font-bold text-primary">panaderías, pastelerías, pizzerías</span>, fábrica de pastas, 
              industria gastronómica y profesionales
            </p>
            
            {/* Información de contacto destacada */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-10 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <a href="tel:+541160051540" className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-lg">
                <Phone className="h-6 w-6" />
                <span>11 6005-1540</span>
              </a>
              <a href="https://instagram.com/distribuidoramundo_" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-lg">
                <Instagram className="h-6 w-6" />
                <span>@distribuidoramundo_</span>
              </a>
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center md:justify-start transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button size="lg" asChild className="group shadow-xl hover:shadow-2xl text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                <Link href="/productos">
                  Ver Productos
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-3 border-primary hover:bg-primary hover:text-white hover:border-primary text-lg px-8 py-6 font-bold">
                <Link href="/contacto">Contactanos</Link>
              </Button>
            </div>
          </div>

          {/* Imágenes de productos destacados */}
          <div className="relative">
            {/* Overlay decorativo sutil */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className={`grid grid-cols-2 gap-6 relative z-10 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl hover:shadow-2xl transition-all group border-2 border-gray-200 hover:border-primary">
              {!imagesLoaded.harinas && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop"
                alt="Harinas y productos de panadería"
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imagesLoaded.harinas ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 768px) 50vw, 500px"
                onLoad={() => handleImageLoad('harinas')}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg md:text-xl drop-shadow-2xl">Harinas Premium</p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl hover:shadow-2xl transition-all group border-2 border-gray-200 hover:border-primary mt-12">
              {!imagesLoaded.chocolates && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop"
                alt="Chocolates y confitería"
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imagesLoaded.chocolates ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 768px) 50vw, 500px"
                onLoad={() => handleImageLoad('chocolates')}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg md:text-xl drop-shadow-2xl">Chocolates</p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl hover:shadow-2xl transition-all group border-2 border-gray-200 hover:border-primary">
              {!imagesLoaded.frutas && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src="https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&h=500&fit=crop"
                alt="Frutas secas y nueces"
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imagesLoaded.frutas ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 768px) 50vw, 500px"
                onLoad={() => handleImageLoad('frutas')}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg md:text-xl drop-shadow-2xl">Frutas Secas</p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl hover:shadow-2xl transition-all group border-2 border-gray-200 hover:border-primary mt-12">
              {!imagesLoaded.pasteleria && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop"
                alt="Productos de pastelería"
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imagesLoaded.pasteleria ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 768px) 50vw, 500px"
                onLoad={() => handleImageLoad('pasteleria')}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg md:text-xl drop-shadow-2xl">Pastelería</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

