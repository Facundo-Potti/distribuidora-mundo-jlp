"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react"

export default function EstadisticasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Datos de ejemplo - en producción vendrían de una API
  const stats = {
    totalPedidos: 0,
    totalGastado: 0,
    productosFavoritos: 0,
    pedidosPendientes: 0,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Estadísticas</h1>

          {/* Cards de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPedidos}</div>
                <p className="text-xs text-muted-foreground">Todos los tiempos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalGastado.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Acumulado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos Favoritos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.productosFavoritos}</div>
                <p className="text-xs text-muted-foreground">En tu lista</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pedidosPendientes}</div>
                <p className="text-xs text-muted-foreground">En proceso</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs con más información */}
          <Tabs defaultValue="pedidos" className="w-full">
            <TabsList>
              <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              <TabsTrigger value="productos">Productos</TabsTrigger>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
            </TabsList>
            <TabsContent value="pedidos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pedidos</CardTitle>
                  <CardDescription>
                    Revisa todos tus pedidos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    Aún no has realizado ningún pedido
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="productos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Comprados</CardTitle>
                  <CardDescription>
                    Tus productos favoritos y más comprados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    No hay productos para mostrar
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="gastos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Gastos</CardTitle>
                  <CardDescription>
                    Visualiza tus gastos por período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    No hay datos de gastos disponibles
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

