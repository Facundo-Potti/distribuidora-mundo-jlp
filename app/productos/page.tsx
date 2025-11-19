"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ShoppingCart, Plus, Minus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Producto {
  id: number
  nombre: string
  categoria: string
  precio: number
  unidad: string
  imagen: string
  stock?: number
}

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function ProductosPage() {
  const { data: session } = useSession()
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [dialogCarritoAbierto, setDialogCarritoAbierto] = useState(false)
  const [dialogPedidoAbierto, setDialogPedidoAbierto] = useState(false)

  // Cargar productos desde localStorage (sincronizado con admin)
  useEffect(() => {
    const productosGuardados = localStorage.getItem("admin_productos")
    if (productosGuardados) {
      const productosData = JSON.parse(productosGuardados)
      setProductos(productosData)
    } else {
      // Productos por defecto
      const productosIniciales: Producto[] = [
        {
          id: 1,
          nombre: "Harina 0000",
          categoria: "Harinas",
          precio: 15000,
          unidad: "bolsa 25kg",
          imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",
          stock: 45,
        },
        {
          id: 2,
          nombre: "Azúcar Refinada",
          categoria: "Azúcares",
          precio: 8500,
          unidad: "bolsa 50kg",
          imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
          stock: 120,
        },
        {
          id: 3,
          nombre: "Levadura Seca",
          categoria: "Levaduras",
          precio: 12000,
          unidad: "paquete 500g",
          imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
          stock: 78,
        },
        {
          id: 4,
          nombre: "Chocolate Semi Amargo",
          categoria: "Chocolates",
          precio: 18500,
          unidad: "bolsa 5kg",
          imagen: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
          stock: 32,
        },
        {
          id: 5,
          nombre: "Nueces Peladas",
          categoria: "Frutas Secas",
          precio: 22000,
          unidad: "bolsa 1kg",
          imagen: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&h=400&fit=crop",
          stock: 15,
        },
        {
          id: 6,
          nombre: "Manteca",
          categoria: "Grasas",
          precio: 14500,
          unidad: "bolsa 5kg",
          imagen: "https://images.unsplash.com/photo-1474979266404-7eaacb8cc273?w=400&h=400&fit=crop",
          stock: 67,
        },
      ]
      setProductos(productosIniciales)
    }

    // Cargar carrito desde localStorage
    const carritoGuardado = localStorage.getItem("carrito")
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem("carrito", JSON.stringify(carrito))
    } else {
      localStorage.removeItem("carrito")
    }
  }, [carrito])

  const categorias = Array.from(new Set(productos.map((p) => p.categoria)))

  const productosFiltrados = productos.filter((producto) => {
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = !selectedCategory || producto.categoria === selectedCategory
    return matchSearch && matchCategory
  })

  const agregarAlCarrito = (producto: Producto) => {
    const itemExistente = carrito.find((item) => item.producto.id === producto.id)
    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      )
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }])
    }
  }

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId)
    } else {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      )
    }
  }

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId))
  }

  const totalCarrito = carrito.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  )

  const realizarPedido = () => {
    if (!session?.user) {
      alert("Debes iniciar sesión para realizar un pedido")
      return
    }

    if (carrito.length === 0) {
      alert("El carrito está vacío")
      return
    }

    // Crear pedido
    const nuevoPedido = {
      id: `PED-${Date.now()}`,
      cliente: session.user.name || "Cliente",
      clienteEmail: session.user.email || "",
      fecha: new Date().toISOString().split("T")[0],
      total: totalCarrito,
      estado: "pendiente",
      items: carrito.reduce((sum, item) => sum + item.cantidad, 0),
      productos: carrito.map((item) => ({
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio: item.producto.precio,
      })),
    }

    // Guardar pedido
    const pedidosGuardados = localStorage.getItem("admin_pedidos")
    const pedidos = pedidosGuardados ? JSON.parse(pedidosGuardados) : []
    pedidos.push(nuevoPedido)
    localStorage.setItem("admin_pedidos", JSON.stringify(pedidos))

    // Limpiar carrito
    setCarrito([])
    localStorage.removeItem("carrito")

    setDialogCarritoAbierto(false)
    setDialogPedidoAbierto(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black">Nuestros Productos</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Amplia variedad de materias primas de la más alta calidad
            </p>
          </div>

          {/* Filtros y Carrito */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
              <Input
                placeholder="Buscar productos..."
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {carrito.length > 0 && (
              <Button onClick={() => setDialogCarritoAbierto(true)} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)})
              </Button>
            )}
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => (
              <Card key={producto.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      {producto.categoria}
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{producto.nombre}</CardTitle>
                  <CardDescription>{producto.categoria}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">
                    ${producto.precio.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">{producto.unidad}</p>
                  {producto.stock !== undefined && (
                    <p className={`text-xs mt-1 ${producto.stock > 20 ? 'text-green-600' : 'text-red-600'}`}>
                      Stock: {producto.stock} unidades
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full group-hover:bg-primary/90"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock !== undefined && producto.stock === 0}
                  >
                    Agregar al Carrito
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se encontraron productos con esos filtros.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Dialog del Carrito */}
      <Dialog open={dialogCarritoAbierto} onOpenChange={setDialogCarritoAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carrito de Compras</DialogTitle>
            <DialogDescription>
              Revisa y gestiona los productos en tu carrito
            </DialogDescription>
          </DialogHeader>
          {carrito.length > 0 ? (
            <div className="space-y-4">
              {carrito.map((item) => (
                <div key={item.producto.id} className="flex items-center justify-between p-4 border-2 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.producto.nombre}</p>
                      <p className="text-sm text-gray-600">${item.producto.precio.toLocaleString()} c/u</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-3 font-semibold">{item.cantidad}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-bold text-primary w-24 text-right">
                      ${(item.producto.precio * item.cantidad).toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarDelCarrito(item.producto.id)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalCarrito.toLocaleString()}
                  </span>
                </div>
                <Button className="w-full" onClick={realizarPedido}>
                  Realizar Pedido
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">El carrito está vacío</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Pedido Realizado */}
      <Dialog open={dialogPedidoAbierto} onOpenChange={setDialogPedidoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Pedido Realizado!</DialogTitle>
            <DialogDescription>
              Tu pedido ha sido registrado exitosamente
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-600 mb-4">
              Te contactaremos pronto para confirmar tu pedido.
            </p>
            <p className="text-center text-sm text-gray-500">
              Puedes ver el estado de tus pedidos en la sección de Estadísticas.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogPedidoAbierto(false)} className="w-full">
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
