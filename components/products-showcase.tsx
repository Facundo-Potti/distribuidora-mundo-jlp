"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { useEffect, useState, useRef } from "react"

const productosDestacados = [
  {
    id: 1,
    nombre: "Harinas Premium",
    categoria: "Harinas",
    imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop",
    descripcion: "Harinas de trigo 0000, 000 y especiales para panadería",
  },
  {
    id: 2,
    nombre: "Chocolates y Coberturas",
    categoria: "Chocolates",
    imagen: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=600&fit=crop",
    descripcion: "Chocolates de calidad premium para confitería",
  },
  {
    id: 3,
    nombre: "Frutas Secas",
    categoria: "Frutas Secas",
    imagen: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&h=600&fit=crop",
    descripcion: "Nueces, almendras, pasas y más frutas secas",
  },
  {
    id: 4,
    nombre: "Levaduras",
    categoria: "Levaduras",
    imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop",
    descripcion: "Levaduras frescas y secas para panadería",
  },
  {
    id: 5,
    nombre: "Azúcares",
    categoria: "Azúcares",
    imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop",
    descripcion: "Azúcar refinada, impalpable y especiales",
  },
  {
    id: 6,
    nombre: "Grasas y Aceites",
    categoria: "Grasas",
    imagen: "https://images.unsplash.com/photo-1474979266404-7eaacb8cc273?w=600&h=600&fit=crop",
    descripcion: "Manteca, margarina y aceites para panadería",
  },
]

export function ProductsShowcase() {
  const [isVisible, setIsVisible] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({})
  const sectionRef = useRef<HTMLElement>(null)

  const handleImageLoad = (key: string) => {
    setImagesLoaded(prev => ({ ...prev, [key]: true }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <ShoppingBag className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Amplia variedad de materias primas de la más alta calidad para tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {productosDestacados.map((producto, index) => (
            <Card
              key={producto.id}
              className={`group overflow-hidden border-2 border-gray-200 hover:border-primary transition-all duration-500 hover:shadow-2xl bg-white ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative h-72 overflow-hidden">
                {!imagesLoaded[producto.id] && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  src={producto.imagen}
                  alt={producto.nombre}
                  fill
                  className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imagesLoaded[producto.id] ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onLoad={() => handleImageLoad(producto.id.toString())}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                    {producto.categoria}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{producto.nombre}</h3>
                  <p className="text-sm text-gray-200 leading-relaxed">{producto.descripcion}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className={`text-center transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Button size="lg" asChild className="group px-8 py-6 text-lg">
            <Link href="/productos">
              Ver Todos los Productos
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

