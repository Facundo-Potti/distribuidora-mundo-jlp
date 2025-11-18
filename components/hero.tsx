"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-white to-white py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Distribuidor Mayorista de{" "}
            <span className="text-primary">Materia Prima</span>
          </h1>
          <p className={`text-xl md:text-2xl text-gray-700 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Atención directa a panaderías, pastelerías, pizzerías, fábrica de pastas, 
            industria gastronómica y profesionales
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button size="lg" asChild className="group">
              <Link href="/productos">
                Ver Productos
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contacto">Contactanos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

