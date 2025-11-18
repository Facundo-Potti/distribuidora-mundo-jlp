import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ProductosPage() {
  // Datos de ejemplo - en producción vendrían de una API
  const categorias = [
    "Harinas",
    "Azúcares",
    "Levaduras",
    "Grasas",
    "Chocolates",
    "Frutas Secas",
  ]

  const productos = [
    {
      id: 1,
      nombre: "Harina 0000",
      categoria: "Harinas",
      precio: 15000,
      unidad: "bolsa 25kg",
    },
    {
      id: 2,
      nombre: "Azúcar Refinada",
      categoria: "Azúcares",
      precio: 8500,
      unidad: "bolsa 50kg",
    },
    {
      id: 3,
      nombre: "Levadura Seca",
      categoria: "Levaduras",
      precio: 12000,
      unidad: "paquete 500g",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Nuestros Productos</h1>

          {/* Filtros */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar productos..."
              className="flex-1"
            />
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <Card key={producto.id}>
                <CardHeader>
                  <CardTitle>{producto.nombre}</CardTitle>
                  <CardDescription>{producto.categoria}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${producto.precio.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{producto.unidad}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Ver Detalles</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Próximamente podrás realizar pedidos online
            </p>
            <Button variant="outline" asChild>
              <a href="/contacto">Contactanos para más información</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

