"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, Calendar } from "lucide-react"
import { useEffect, useState, useRef } from "react"

export function StatsSection() {
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

  const stats = [
    {
      icon: Users,
      value: "+500",
      label: "Clientes",
      description: "Comercios, profesionales y empresas",
    },
    {
      icon: Package,
      value: "+700",
      label: "Productos",
      description: "De las mejores marcas y propias",
    },
    {
      icon: Calendar,
      value: "+40",
      label: "Años",
      description: "En el mercado junto a vos",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 md:py-24 bg-gray-50 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Números que nos respaldan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Más de 40 años de experiencia al servicio de la industria gastronómica
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card 
                key={index} 
                className={`text-center border-2 border-gray-200 hover:border-primary transition-all duration-500 hover:shadow-xl hover:-translate-y-2 bg-white ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardContent className="pt-8 pb-8">
                  <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-primary/10 p-5 transition-all duration-300 hover:scale-110 hover:bg-primary/20">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-5xl md:text-6xl font-extrabold text-primary mb-3">{stat.value}</h3>
                  <h4 className="text-xl md:text-2xl font-bold text-black mb-3">{stat.label}</h4>
                  <p className="text-sm md:text-base text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

