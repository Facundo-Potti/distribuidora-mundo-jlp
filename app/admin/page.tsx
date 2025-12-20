"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Download,
  X,
  Upload
} from "lucide-react"
import Image from "next/image"
import { ImageUpload } from "@/components/ui/image-upload"

// Tipos
type Producto = {
  id: string | number
  nombre: string
  categoria: string
  precio: number
  stock: number
  imagen: string | null
  descripcion: string | null
  unidad: string | null
}

interface Pedido {
  id: string
  cliente: string
  fecha: string
  total: number
  estado: "pendiente" | "completado" | "cancelado"
  items: number
  productos?: { nombre: string; cantidad: number; precio: number }[]
}

interface Cliente {
  id: number
  nombre: string
  email: string
  telefono?: string
  fechaRegistro: string
  totalPedidos: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  // ========== SECCIÓN PRODUCTOS - NUEVA IMPLEMENTACIÓN COMPLETA ==========
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    imagen: "",
    descripcion: "",
    unidad: "",
  })

  // Estados para pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])
  const [busquedaPedidos, setBusquedaPedidos] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
  const [dialogPedidoAbierto, setDialogPedidoAbierto] = useState(false)

  // Estados para clientes
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busquedaClientes, setBusquedaClientes] = useState("")
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [dialogClienteAbierto, setDialogClienteAbierto] = useState(false)
  const [dialogClienteDetallesAbierto, setDialogClienteDetallesAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [formCliente, setFormCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  })

  // Función para obtener productos
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre ?? '',
        categoria: p.categoria ?? '',
        precio: Number(p.precio) ?? 0,
        stock: Number(p.stock) ?? 0,
        imagen: p.imagen ?? null,
        descripcion: p.descripcion ?? null,
        unidad: p.unidad ?? null,
      })))
    } catch (error) {
      console.error(error)
      alert('No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()

    // Cargar pedidos desde localStorage
    const pedidosGuardados = localStorage.getItem("admin_pedidos")
    const clientesGuardados = localStorage.getItem("admin_clientes")
    
    let pedidosData: Pedido[] = []
    if (pedidosGuardados) {
      pedidosData = JSON.parse(pedidosGuardados)
      setPedidos(pedidosData)
      setPedidosFiltrados(pedidosData)
    } else {
      const pedidosIniciales: Pedido[] = [
        {
          id: "PED-001",
          cliente: "Panadería El Buen Sabor",
          fecha: "2025-01-18",
          total: 45000,
          estado: "pendiente",
          items: 3,
          productos: [
            { nombre: "Harina 0000", cantidad: 2, precio: 15000 },
            { nombre: "Levadura Seca", cantidad: 1, precio: 12000 },
          ],
        },
        {
          id: "PED-002",
          cliente: "Confitería Dulce Tentación",
          fecha: "2025-01-17",
          total: 78000,
          estado: "completado",
          items: 5,
          productos: [
            { nombre: "Chocolate Semi Amargo", cantidad: 2, precio: 18500 },
            { nombre: "Nueces Peladas", cantidad: 1, precio: 22000 },
            { nombre: "Azúcar Refinada", cantidad: 2, precio: 8500 },
          ],
        },
        {
          id: "PED-003",
          cliente: "Pizzería La Nonna",
          fecha: "2025-01-18",
          total: 32000,
          estado: "pendiente",
          items: 2,
          productos: [
            { nombre: "Harina 0000", cantidad: 1, precio: 15000 },
            { nombre: "Manteca", cantidad: 1, precio: 14500 },
          ],
        },
      ]
      pedidosData = pedidosIniciales
      setPedidos(pedidosIniciales)
      setPedidosFiltrados(pedidosIniciales)
      localStorage.setItem("admin_pedidos", JSON.stringify(pedidosIniciales))
    }

    // Cargar clientes y sincronizar con pedidos
    if (clientesGuardados) {
      const clientesData = JSON.parse(clientesGuardados)
      // Sincronizar total de pedidos con pedidos reales
      const clientesActualizados = clientesData.map((cliente: Cliente) => {
        const pedidosDelCliente = pedidosData.filter((p: Pedido) => p.cliente === cliente.nombre)
        return { ...cliente, totalPedidos: pedidosDelCliente.length }
      })
      setClientes(clientesActualizados)
      if (clientesActualizados.length > 0) {
        localStorage.setItem("admin_clientes", JSON.stringify(clientesActualizados))
      }
    } else {
      const clientesIniciales: Cliente[] = [
        {
          id: 1,
          nombre: "Panadería El Buen Sabor",
          email: "contacto@buensabor.com",
          telefono: "11 2345-6789",
          fechaRegistro: "2024-06-15",
          totalPedidos: 0,
        },
        {
          id: 2,
          nombre: "Confitería Dulce Tentación",
          email: "info@dulcetentacion.com",
          telefono: "11 3456-7890",
          fechaRegistro: "2024-08-20",
          totalPedidos: 0,
        },
        {
          id: 3,
          nombre: "Pizzería La Nonna",
          email: "pedidos@lanonna.com",
          telefono: "11 4567-8901",
          fechaRegistro: "2024-09-10",
          totalPedidos: 0,
        },
      ]
      // Sincronizar total de pedidos con pedidos reales
      const clientesActualizados = clientesIniciales.map((cliente) => {
        const pedidosDelCliente = pedidosData.filter((p: Pedido) => p.cliente === cliente.nombre)
        return { ...cliente, totalPedidos: pedidosDelCliente.length }
      })
      setClientes(clientesActualizados)
      localStorage.setItem("admin_clientes", JSON.stringify(clientesActualizados))
    }
  }, [])

  // Filtros y datos derivados
  const filteredProducts = productos.filter(p => {
    const matchesSearch = !searchTerm || 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || p.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(productos.map(p => p.categoria).filter(Boolean))] as string[]

  // Filtrar pedidos
  useEffect(() => {
    let filtrados = pedidos

    if (busquedaPedidos) {
      filtrados = filtrados.filter(
        (p) =>
          p.id.toLowerCase().includes(busquedaPedidos.toLowerCase()) ||
          p.cliente.toLowerCase().includes(busquedaPedidos.toLowerCase())
      )
    }

    if (estadoFiltro) {
      filtrados = filtrados.filter((p) => p.estado === estadoFiltro)
    }

    setPedidosFiltrados(filtrados)
  }, [busquedaPedidos, estadoFiltro, pedidos])

  // Filtrar clientes
  useEffect(() => {
    if (!busquedaClientes) {
      return
    }
    // La búsqueda de clientes se maneja en el render
  }, [busquedaClientes])

  // Handlers para productos
  const openModal = (product?: Producto) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        nombre: product.nombre,
        categoria: product.categoria,
        precio: String(product.precio),
        stock: String(product.stock),
        imagen: product.imagen ?? '',
        descripcion: product.descripcion ?? '',
        unidad: product.unidad ?? '',
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        nombre: '',
        categoria: '',
        precio: '',
        stock: '',
        imagen: '',
        descripcion: '',
        unidad: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim() || !formData.categoria || !formData.precio || !formData.stock) {
      alert('Completa todos los campos obligatorios')
      return
    }

    setLoading(true)
    try {
      const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products/create'
      const method = selectedProduct ? 'PUT' : 'POST'
      
      const payload = {
        nombre: formData.nombre.trim(),
        categoria: formData.categoria,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        imagen: formData.imagen.trim() && !formData.imagen.includes('unsplash.com') 
          ? formData.imagen.trim() 
          : null,
        descripcion: formData.descripcion.trim() || null,
        unidad: formData.unidad.trim() || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al guardar')
      }

      setIsModalOpen(false)
      await fetchProducts()
    } catch (error: any) {
      alert(error.message || 'Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string | number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar')
      }

      await fetchProducts()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  // Funciones de pedidos
  const completarPedido = (id: string) => {
    const nuevosPedidos = pedidos.map((p) =>
      p.id === id ? { ...p, estado: "completado" as const } : p
    )
    setPedidos(nuevosPedidos)
    localStorage.setItem("admin_pedidos", JSON.stringify(nuevosPedidos))
    
    // Recalcular total de pedidos de todos los clientes
    const clientesActualizados = clientes.map((cliente) => {
      const pedidosDelCliente = nuevosPedidos.filter((p) => p.cliente === cliente.nombre)
      return { ...cliente, totalPedidos: pedidosDelCliente.length }
    })
    setClientes(clientesActualizados)
    localStorage.setItem("admin_clientes", JSON.stringify(clientesActualizados))
  }

  const verDetallesPedido = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido)
    setDialogPedidoAbierto(true)
  }

  // Funciones de clientes
  const abrirDialogCliente = (cliente?: Cliente) => {
    if (cliente) {
      setClienteEditando(cliente)
      setFormCliente({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono || "",
      })
    } else {
      setClienteEditando(null)
      setFormCliente({
        nombre: "",
        email: "",
        telefono: "",
      })
    }
    setDialogClienteAbierto(true)
  }

  const guardarCliente = () => {
    if (!formCliente.nombre || !formCliente.email) {
      alert("Por favor completa todos los campos obligatorios (nombre y email)")
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formCliente.email)) {
      alert("Por favor ingresa un email válido")
      return
    }

    const nuevoCliente: Cliente = {
      id: clienteEditando ? clienteEditando.id : Date.now(),
      nombre: formCliente.nombre,
      email: formCliente.email,
      telefono: formCliente.telefono || undefined,
      fechaRegistro: clienteEditando ? clienteEditando.fechaRegistro : new Date().toISOString().split("T")[0],
      totalPedidos: clienteEditando ? clienteEditando.totalPedidos : 0,
    }

    if (clienteEditando) {
      setClientes(clientes.map((c) => (c.id === clienteEditando.id ? nuevoCliente : c)))
      localStorage.setItem("admin_clientes", JSON.stringify(clientes.map((c) => (c.id === clienteEditando.id ? nuevoCliente : c))))
    } else {
      setClientes([...clientes, nuevoCliente])
      localStorage.setItem("admin_clientes", JSON.stringify([...clientes, nuevoCliente]))
    }

    setDialogClienteAbierto(false)
    setClienteEditando(null)
  }

  const eliminarCliente = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.")) {
      const nuevosClientes = clientes.filter((c) => c.id !== id)
      setClientes(nuevosClientes)
      localStorage.setItem("admin_clientes", JSON.stringify(nuevosClientes))
    }
  }

  const verDetallesCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setDialogClienteDetallesAbierto(true)
  }

  const obtenerPedidosDelCliente = (nombreCliente: string) => {
    return pedidos.filter((p) => p.cliente === nombreCliente)
  }

  // Función para exportar datos
  const exportarDatos = (tipo: string, formato: "csv" | "json") => {
    let datos: any = {}
    let nombreArchivo = ""

    if (tipo === "productos") {
      datos = productos
      nombreArchivo = "productos"
    } else if (tipo === "pedidos") {
      datos = pedidos
      nombreArchivo = "pedidos"
    } else if (tipo === "clientes") {
      datos = clientes
      nombreArchivo = "clientes"
    } else if (tipo === "todos") {
      datos = {
        productos,
        pedidos,
        clientes,
        exportado: new Date().toISOString(),
      }
      nombreArchivo = "datos_completos"
    }

    if (formato === "csv") {
      // Convertir a CSV
      if (Array.isArray(datos)) {
        if (datos.length === 0) {
          alert("No hay datos para exportar")
          return
        }
        const headers = Object.keys(datos[0])
        const csvContent = [
          headers.join(","),
          ...datos.map((row) =>
            headers.map((header) => {
              const value = row[header]
              // Escapar comillas y valores que contengan comas
              if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value ?? ""
            }).join(",")
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      // Exportar como JSON
      const jsonContent = JSON.stringify(datos, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Calcular estadísticas
  const dashboardStats = {
    totalVentas: pedidos
      .filter((p) => p.estado === "completado")
      .reduce((sum, p) => sum + p.total, 0),
    totalPedidos: pedidos.length,
    productosActivos: productos.length,
    clientesActivos: clientes.length,
    pedidosPendientes: pedidos.filter((p) => p.estado === "pendiente").length,
    pedidosCompletados: pedidos.filter((p) => p.estado === "completado").length,
  }


  const clientesFiltrados = busquedaClientes
    ? clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(busquedaClientes.toLowerCase()) ||
          c.email.toLowerCase().includes(busquedaClientes.toLowerCase())
      )
    : clientes

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated") {
      const userRole = (session?.user as { role?: string })?.role
      if (userRole !== "admin") {
        router.push("/")
      }
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const userRole = session?.user ? (session.user as { role?: string }).role : null
  if (!session || userRole !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header del Admin */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-black mb-2">Panel de Administración</h1>
                <p className="text-gray-600">Gestiona productos, pedidos y clientes</p>
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportarDatos("productos", "csv")}>
                      Exportar Productos (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportarDatos("pedidos", "csv")}>
                      Exportar Pedidos (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportarDatos("clientes", "csv")}>
                      Exportar Clientes (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportarDatos("productos", "json")}>
                      Exportar Productos (JSON)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportarDatos("pedidos", "json")}>
                      Exportar Pedidos (JSON)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportarDatos("clientes", "json")}>
                      Exportar Clientes (JSON)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportarDatos("todos", "json")}>
                      Exportar Todo (JSON)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Tabs de Navegación */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="productos">Productos</TabsTrigger>
              <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:border-primary transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      ${dashboardStats.totalVentas.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Completados</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {dashboardStats.totalPedidos}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Todos los tiempos</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                    <Package className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {dashboardStats.productosActivos}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">En catálogo</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {dashboardStats.clientesActivos}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Registrados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos y Tablas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos por Estado</CardTitle>
                    <CardDescription>Resumen de pedidos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="font-medium">Pendientes</span>
                        </div>
                        <span className="text-2xl font-bold">{dashboardStats.pedidosPendientes}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Completados</span>
                        </div>
                        <span className="text-2xl font-bold">{dashboardStats.pedidosCompletados}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Productos con Bajo Stock</CardTitle>
                    <CardDescription>Productos que necesitan reposición</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {productos
                        .filter((p) => p.stock < 20)
                        .slice(0, 5)
                        .map((producto) => (
                          <div key={producto.id} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                            <span className="font-medium">{producto.nombre}</span>
                            <span className="text-red-600 font-bold">{producto.stock} unidades</span>
                          </div>
                        ))}
                      {productos.filter((p) => p.stock < 20).length === 0 && (
                        <p className="text-center text-gray-500 py-4">Todos los productos tienen stock suficiente</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SECCIÓN PRODUCTOS - FORMATO TABLA */}
            <TabsContent value="productos" className="space-y-4">
              {/* Barra de herramientas */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre o categoría..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => openModal()} className="gap-2 whitespace-nowrap">
                  <Plus className="h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>

              {/* Tabla de productos */}
              <Card>
                <CardContent className="p-0">
                  {loading && productos.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600">Cargando productos...</p>
                      </div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                          {productos.length === 0 ? 'No hay productos registrados' : 'No se encontraron resultados'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProducts.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {producto.imagen ? (
                                    <img
                                      src={producto.imagen}
                                      alt={producto.nombre}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100&h=100&fit=crop"
                                      }}
                                    />
                                  ) : (
                                    <Package className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                                  {producto.descripcion && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{producto.descripcion}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {producto.categoria}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
                                ${producto.precio.toLocaleString('es-AR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${producto.stock > 20 ? 'text-green-600' : 'text-red-600'}`}>
                                  {producto.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {producto.unidad || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openModal(producto)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(producto.id, producto.nombre)}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información de resultados */}
              {filteredProducts.length > 0 && (
                <div className="text-sm text-gray-600">
                  Mostrando {filteredProducts.length} de {productos.length} productos
                </div>
              )}
            </TabsContent>

            {/* Pedidos Tab */}
            <TabsContent value="pedidos" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar pedidos..."
                      className="pl-10"
                      value={busquedaPedidos}
                      onChange={(e) => setBusquedaPedidos(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="completado">Completados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Pedidos</CardTitle>
                  <CardDescription>Gestiona todos los pedidos recibidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pedidosFiltrados.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">{pedido.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              pedido.estado === "completado" 
                                ? "bg-green-100 text-green-800" 
                                : pedido.estado === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {pedido.estado === "completado" ? "Completado" : pedido.estado === "cancelado" ? "Cancelado" : "Pendiente"}
                            </span>
                          </div>
                          <p className="text-gray-600">{pedido.cliente}</p>
                          <p className="text-sm text-gray-500">{pedido.fecha} • {pedido.items} items</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ${pedido.total.toLocaleString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => verDetallesPedido(pedido)}>
                              Ver Detalles
                            </Button>
                            {pedido.estado === "pendiente" && (
                              <Button size="sm" onClick={() => completarPedido(pedido.id)}>
                                Completar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pedidosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">No se encontraron pedidos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clientes Tab */}
            <TabsContent value="clientes" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar clientes..."
                      className="pl-10"
                      value={busquedaClientes}
                      onChange={(e) => setBusquedaClientes(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="gap-2" onClick={() => abrirDialogCliente()}>
                  <Plus className="h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Clientes Registrados</CardTitle>
                  <CardDescription>Gestiona la base de clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientesFiltrados.map((cliente) => (
                      <div
                        key={cliente.id}
                        className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{cliente.nombre}</p>
                            <p className="text-sm text-gray-600">{cliente.email}</p>
                            {cliente.telefono && (
                              <p className="text-sm text-gray-600">{cliente.telefono}</p>
                            )}
                            <p className="text-xs text-gray-500">Registrado el {new Date(cliente.fechaRegistro).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Pedidos</p>
                            <p className="text-xl font-bold text-primary">{cliente.totalPedidos}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => verDetallesCliente(cliente)}>
                              Ver Detalles
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => abrirDialogCliente(cliente)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => eliminarCliente(cliente.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {clientesFiltrados.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">No se encontraron clientes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Modal de Producto - Formulario Completo */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Modifica la información del producto' 
                : 'Completa todos los campos para crear un nuevo producto'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Fila 1: Nombre y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Harina 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <select
                  id="categoria"
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Harinas">Harinas</option>
                  <option value="Azúcares">Azúcares</option>
                  <option value="Levaduras">Levaduras</option>
                  <option value="Chocolates">Chocolates</option>
                  <option value="Frutas Secas">Frutas Secas</option>
                  <option value="Grasas">Grasas</option>
                  <option value="Conservas">Conservas</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            {/* Fila 2: Precio y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (ARS) *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Disponible *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="45"
                />
              </div>
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <Label>Imagen del Producto</Label>
              <ImageUpload
                currentImage={formData.imagen}
                onImageUploaded={(imageUrl) => {
                  setFormData(prev => ({ ...prev, imagen: imageUrl || '' }))
                }}
                productId={selectedProduct?.id?.toString()}
                productName={formData.nombre || 'producto'}
              />
              <p className="text-xs text-gray-500">
                También puedes ingresar una URL de imagen manualmente
              </p>
              <Input
                value={formData.imagen}
                onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            {/* Fila 3: Unidad y Descripción */}
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad de Medida</Label>
              <Input
                id="unidad"
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                placeholder="Ej: bolsa 25kg, caja x12 unidades"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                rows={4}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Descripción detallada del producto..."
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  selectedProduct ? 'Guardar Cambios' : 'Crear Producto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Detalles de Pedido */}
      <Dialog open={dialogPedidoAbierto} onOpenChange={setDialogPedidoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Pedido {pedidoSeleccionado?.id}</DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>
          {pedidoSeleccionado && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold">{pedidoSeleccionado.cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">{pedidoSeleccionado.fecha}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  pedidoSeleccionado.estado === "completado" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {pedidoSeleccionado.estado === "completado" ? "Completado" : "Pendiente"}
                </span>
              </div>
              {pedidoSeleccionado.productos && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Productos</p>
                  <div className="space-y-2">
                    {pedidoSeleccionado.productos.map((prod, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{prod.nombre} x{prod.cantidad}</span>
                        <span className="font-semibold">${(prod.precio * prod.cantidad).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${pedidoSeleccionado.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPedidoAbierto(false)}>
              Cerrar
            </Button>
            {pedidoSeleccionado?.estado === "pendiente" && (
              <Button onClick={() => {
                if (pedidoSeleccionado) {
                  completarPedido(pedidoSeleccionado.id)
                  setDialogPedidoAbierto(false)
                }
              }}>
                Completar Pedido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Cliente (Crear/Editar) */}
      <Dialog open={dialogClienteAbierto} onOpenChange={setDialogClienteAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {clienteEditando ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {clienteEditando ? "Modifica la información del cliente" : "Completa los datos del nuevo cliente"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente-nombre">Nombre *</Label>
              <Input
                id="cliente-nombre"
                value={formCliente.nombre}
                onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                placeholder="Ej: Panadería El Buen Sabor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-email">Email *</Label>
              <Input
                id="cliente-email"
                type="email"
                value={formCliente.email}
                onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                placeholder="contacto@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-telefono">Teléfono</Label>
              <Input
                id="cliente-telefono"
                value={formCliente.telefono}
                onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                placeholder="11 2345-6789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogClienteAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarCliente}>
              {clienteEditando ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Detalles de Cliente */}
      <Dialog open={dialogClienteDetallesAbierto} onOpenChange={setDialogClienteDetallesAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa del cliente y su historial de pedidos
            </DialogDescription>
          </DialogHeader>
          {clienteSeleccionado && (
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-semibold text-lg">{clienteSeleccionado.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{clienteSeleccionado.email}</p>
                </div>
                {clienteSeleccionado.telefono && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-semibold">{clienteSeleccionado.telefono}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Fecha de Registro</p>
                  <p className="font-semibold">{new Date(clienteSeleccionado.fechaRegistro).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                  <p className="font-semibold text-2xl text-primary">{clienteSeleccionado.totalPedidos}</p>
                </div>
              </div>

              {/* Historial de Pedidos */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg mb-4">Historial de Pedidos</h3>
                {obtenerPedidosDelCliente(clienteSeleccionado.nombre).length > 0 ? (
                  <div className="space-y-3">
                    {obtenerPedidosDelCliente(clienteSeleccionado.nombre).map((pedido) => (
                      <div key={pedido.id} className="p-4 border-2 rounded-lg hover:border-primary transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold">{pedido.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              pedido.estado === "completado" 
                                ? "bg-green-100 text-green-800" 
                                : pedido.estado === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {pedido.estado === "completado" ? "Completado" : pedido.estado === "cancelado" ? "Cancelado" : "Pendiente"}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            ${pedido.total.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pedido.fecha} • {pedido.items} items</p>
                        {pedido.productos && (
                          <div className="mt-2 space-y-1">
                            {pedido.productos.map((prod, idx) => (
                              <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                <span>{prod.nombre} x{prod.cantidad}</span>
                                <span className="font-semibold">${(prod.precio * prod.cantidad).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Este cliente aún no tiene pedidos registrados</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogClienteDetallesAbierto(false)}>
              Cerrar
            </Button>
            {clienteSeleccionado && (
              <Button onClick={() => {
                abrirDialogCliente(clienteSeleccionado)
                setDialogClienteDetallesAbierto(false)
              }}>
                Editar Cliente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
