"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react"

interface Pedido {
  id: string
  cliente: string
  fecha: string
  total: number
  estado: string
  items: number
  productos?: { nombre: string; cantidad: number; precio: number }[]
}

export default function EstadisticasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidosUsuario, setPedidosUsuario] = useState<Pedido[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      // Obtener pedidos del usuario
      const pedidosGuardados = localStorage.getItem("admin_pedidos")
      if (pedidosGuardados) {
        const todosPedidos: Pedido[] = JSON.parse(pedidosGuardados)
        // Filtrar pedidos del usuario actual
        const pedidos = todosPedidos.filter((p) => 
          p.clienteEmail === session.user?.email || 
          p.cliente === session.user?.name
        )
        setPedidosUsuario(pedidos)
      }
    }
  }, [session])

  // Calcular estadísticas
  const stats = {
    totalPedidos: pedidosUsuario.length,
    totalGastado: pedidosUsuario.reduce((sum, p) => sum + p.total, 0),
    productosFavoritos: 0, // Se puede calcular basándose en productos más comprados
    pedidosPendientes: pedidosUsuario.filter((p) => p.estado === "pendiente").length,
  }

  // Productos más comprados
  const productosMasComprados = pedidosUsuario.reduce((acc: any, pedido) => {
    if (pedido.productos) {
      pedido.productos.forEach((prod) => {
        if (acc[prod.nombre]) {
          acc[prod.nombre] += prod.cantidad
        } else {
          acc[prod.nombre] = prod.cantidad
        }
      })
    }
    return acc
  }, {})

  const productosOrdenados = Object.entries(productosMasComprados)
    .map(([nombre, cantidad]) => ({ nombre, cantidad: cantidad as number }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Estadísticas</h1>

          {/* Cards de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalPedidos}</div>
                <p className="text-xs text-muted-foreground">Todos los tiempos</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${stats.totalGastado.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Acumulado</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos Favoritos</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{productosOrdenados.length}</div>
                <p className="text-xs text-muted-foreground">En tu lista</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.pedidosPendientes}</div>
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
                  {pedidosUsuario.length > 0 ? (
                    <div className="space-y-4">
                      {pedidosUsuario.map((pedido) => (
                        <div key={pedido.id} className="p-4 border-2 rounded-lg hover:border-primary transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-bold">{pedido.id}</p>
                              <p className="text-sm text-gray-600">{pedido.fecha}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">${pedido.total.toLocaleString()}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                pedido.estado === "completado" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {pedido.estado === "completado" ? "Completado" : "Pendiente"}
                              </span>
                            </div>
                          </div>
                          {pedido.productos && (
                            <div className="mt-2 space-y-1">
                              {pedido.productos.map((prod, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  {prod.nombre} x{prod.cantidad} - ${(prod.precio * prod.cantidad).toLocaleString()}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Aún no has realizado ningún pedido
                    </p>
                  )}
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
                  {productosOrdenados.length > 0 ? (
                    <div className="space-y-3">
                      {productosOrdenados.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{prod.nombre}</span>
                          <span className="text-primary font-bold">{prod.cantidad} unidades</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No hay productos para mostrar
                    </p>
                  )}
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
                  {pedidosUsuario.length > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Gastado</p>
                        <p className="text-3xl font-bold text-primary">${stats.totalGastado.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Promedio por Pedido</p>
                        <p className="text-2xl font-bold">
                          ${pedidosUsuario.length > 0 ? (stats.totalGastado / pedidosUsuario.length).toLocaleString() : "0"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No hay datos de gastos disponibles
                    </p>
                  )}
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
