import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-white to-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Distribuidor Mayorista de{" "}
            <span className="text-primary">Materia Prima</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Atención directa a panaderías, pastelerías, pizzerías, fábrica de pastas, 
            industria gastronómica y profesionales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/productos">
                Ver Productos
                <ArrowRight className="ml-2 h-5 w-5" />
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

