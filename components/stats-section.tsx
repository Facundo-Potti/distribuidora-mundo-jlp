import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, Calendar } from "lucide-react"

export function StatsSection() {
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold text-primary mb-2">{stat.value}</h3>
                  <h4 className="text-xl font-semibold text-black mb-2">{stat.label}</h4>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

