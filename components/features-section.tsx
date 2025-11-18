"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Truck, Heart } from "lucide-react"
import { useEffect, useState, useRef } from "react"

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

  const features = [
    {
      icon: Package,
      title: "Amplitud de Productos",
      description: "Amplia variedad de materias primas para todas tus necesidades",
    },
    {
      icon: ShoppingCart,
      title: "Tienda Online",
      description: "Próximamente: compra online con facilidad y comodidad",
    },
    {
      icon: Truck,
      title: "Logística de Entrega",
      description: "Sistema eficiente de entrega para garantizar tu stock",
    },
    {
      icon: Heart,
      title: "Pensando en Vos",
      description: "Atención personalizada y servicio de calidad",
    },
  ]

  return (
    <section ref={sectionRef} className="py-16">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            ¿Por qué nosotros?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Somos una empresa dedicada hace más de 40 años a la distribución y 
            comercialización de productos alimenticios
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className={`transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-3 transition-transform duration-300 hover:scale-110 hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

