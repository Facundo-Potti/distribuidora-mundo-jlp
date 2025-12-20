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
interface Producto {
  id: string | number // ID real de la base de datos
  nombre: string
  categoria: string
  precio: number
  stock: number
  imagen: string // Para mostrar en la lista (puede ser Unsplash por defecto)
  imagenOriginal?: string | null // Imagen real de la BD (para edición)
  descripcion?: string
  unidad?: string
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

  // Estados para productos
  const [productos, setProductos] = useState<Producto[]>([])
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([])
  const [busquedaProductos, setBusquedaProductos] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [dialogProductoAbierto, setDialogProductoAbierto] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Para forzar re-render de imágenes
  const [formProducto, setFormProducto] = useState({
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

  // Cargar productos desde la base de datos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        // Agregar timestamp para evitar cache del navegador
        const response = await fetch(`/api/products?t=${Date.now()}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const productosData = await response.json()
          console.log('📥 Productos cargados desde BD:', productosData.length)
          
          // Convertir el formato de la base de datos al formato esperado por el componente
          const productosFormateados: Producto[] = productosData.map((p: any) => {
            // Extraer la imagen de la BD: si existe y es válida, usarla; si no, usar imagen por defecto
            let imagenDeBD: string | null = null
            if (p.imagen !== null && 
                p.imagen !== undefined && 
                typeof p.imagen === 'string' && 
                p.imagen.trim() !== '') {
              imagenDeBD = p.imagen.trim()
            }
            
            // Para mostrar: usar la imagen de la BD si existe, sino usar imagen por defecto
            const imagenParaMostrar = imagenDeBD || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop"
            
            // Log para productos con imágenes de Supabase
            if (imagenDeBD && imagenDeBD.includes('supabase.co')) {
              console.log(`🖼️ Producto con imagen Supabase: ${p.nombre}`, {
                imagenBD: imagenDeBD,
                imagenParaMostrar: imagenParaMostrar
              })
            }
            
            return {
              id: p.id, // Usar el ID real de la base de datos
              nombre: p.nombre,
              categoria: p.categoria,
              precio: p.precio,
              stock: p.stock || 0,
              // imagen: URL para mostrar (puede ser de Supabase o por defecto)
              imagen: imagenParaMostrar,
              // imagenOriginal: URL real de la BD (null si no hay imagen guardada)
              imagenOriginal: imagenDeBD,
              descripcion: p.descripcion || "",
              unidad: p.unidad || "",
            }
          })
          
          console.log(`✅ Productos cargados: ${productosFormateados.length}`)
          const productosConImagen = productosFormateados.filter(p => p.imagenOriginal !== null)
          console.log(`🖼️ Productos con imagen guardada: ${productosConImagen.length}`)
          
          // Log de los primeros productos con imagen para verificar
          if (productosConImagen.length > 0) {
            console.log('📸 Primeros productos con imagen:', productosConImagen.slice(0, 3).map(p => ({
              nombre: p.nombre,
              imagenOriginal: p.imagenOriginal
            })))
          }
          
          setProductos(productosFormateados)
          setProductosFiltrados(productosFormateados)
        } else {
          console.error('Error al cargar productos:', response.statusText)
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
    }

    cargarProductos()

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

  // Filtrar productos
  useEffect(() => {
    let filtrados = productos

    if (busquedaProductos) {
      filtrados = filtrados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaProductos.toLowerCase()) ||
          p.categoria.toLowerCase().includes(busquedaProductos.toLowerCase())
      )
    }

    if (categoriaFiltro) {
      filtrados = filtrados.filter((p) => p.categoria === categoriaFiltro)
    }

    setProductosFiltrados(filtrados)
  }, [busquedaProductos, categoriaFiltro, productos])

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

  // Funciones de productos
  const abrirDialogProducto = (producto?: Producto) => {
    if (producto) {
      // Usar imagenOriginal si existe (imagen real de la BD), sino string vacío
      // También verificar si imagen tiene una URL de Supabase (por si imagenOriginal no está establecida)
      let imagenParaFormulario = ''
      if (producto.imagenOriginal && 
          typeof producto.imagenOriginal === 'string' && 
          producto.imagenOriginal.trim() !== '') {
        imagenParaFormulario = producto.imagenOriginal.trim()
      } else if (producto.imagen && 
                 typeof producto.imagen === 'string' && 
                 producto.imagen.trim() !== '' &&
                 !producto.imagen.includes('unsplash.com') &&
                 producto.imagen.includes('supabase.co')) {
        // Si imagenOriginal no está pero imagen es de Supabase, usarla
        imagenParaFormulario = producto.imagen.trim()
      }
      
      console.log('📝 Abriendo diálogo de edición:', {
        id: producto.id,
        nombre: producto.nombre,
        imagenOriginal: producto.imagenOriginal,
        imagen: producto.imagen,
        imagenParaFormulario: imagenParaFormulario
      })
      
      setProductoEditando(producto)
      setFormProducto({
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        imagen: imagenParaFormulario,
        descripcion: producto.descripcion || "",
        unidad: producto.unidad || "",
      })
    } else {
      setProductoEditando(null)
      setFormProducto({
        nombre: "",
        categoria: "",
        precio: "",
        stock: "",
        imagen: "",
        descripcion: "",
        unidad: "",
      })
    }
    setDialogProductoAbierto(true)
  }

  const guardarProducto = async () => {
    if (!formProducto.nombre || !formProducto.categoria || !formProducto.precio || !formProducto.stock) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      // Guardar en la base de datos
      const url = productoEditando 
        ? `/api/products/${productoEditando.id}`
        : '/api/products/create'
      
      const method = productoEditando ? 'PUT' : 'POST'
      
      // Preparar datos: imagen debe ser null si está vacía, sino la URL completa
      // CRÍTICO: Verificar que la imagen no sea de Unsplash (imagen por defecto)
      let imagenParaGuardar: string | null = null
      if (formProducto.imagen && 
          typeof formProducto.imagen === 'string' &&
          formProducto.imagen.trim() !== '' && 
          !formProducto.imagen.includes('unsplash.com')) {
        imagenParaGuardar = formProducto.imagen.trim()
      }
      
      console.log('💾 Guardando producto con imagen:', {
        productoEditando: productoEditando?.id,
        imagenFormulario: formProducto.imagen,
        imagenParaGuardar: imagenParaGuardar,
        esSupabase: imagenParaGuardar && imagenParaGuardar.includes('supabase.co'),
        esUnsplash: formProducto.imagen && formProducto.imagen.includes('unsplash.com')
      })
      
      const bodyData: any = {
        nombre: formProducto.nombre.trim(),
        categoria: formProducto.categoria,
        precio: formProducto.precio,
        stock: formProducto.stock,
        imagen: imagenParaGuardar, // Puede ser null (para eliminar) o una URL válida
        descripcion: formProducto.descripcion && formProducto.descripcion.trim() !== '' ? formProducto.descripcion.trim() : null,
        unidad: formProducto.unidad && formProducto.unidad.trim() !== '' ? formProducto.unidad.trim() : null,
      }
      
      console.log('📤 Enviando datos a la API:', {
        url,
        method,
        imagenEnBody: bodyData.imagen || 'null',
        tieneImagen: !!bodyData.imagen
      })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar producto')
      }

      const productoGuardado = await response.json()
      
      console.log('✅ Producto guardado en BD:', {
        nombre: productoGuardado.nombre,
        imagen: productoGuardado.imagen,
        imagenEsNull: productoGuardado.imagen === null,
        imagenEsString: typeof productoGuardado.imagen === 'string'
      })

      // Cerrar el diálogo primero
      setDialogProductoAbierto(false)
      setProductoEditando(null)

      // Recargar productos desde la BD para asegurar que tenemos los datos más actualizados
      const productosResponse = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
      })
      
      if (productosResponse.ok) {
        const productosData = await productosResponse.json()
        const productosFormateados: Producto[] = productosData.map((p: any) => {
          const imagenDeBD = p.imagen && typeof p.imagen === 'string' && p.imagen.trim() !== ''
            ? p.imagen.trim()
            : null
          const imagenParaMostrar = imagenDeBD || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop"
          
          return {
            id: p.id, // Usar el ID real de la base de datos
            nombre: p.nombre,
            categoria: p.categoria,
            precio: p.precio,
            stock: p.stock || 0,
            imagen: imagenParaMostrar,
            imagenOriginal: imagenDeBD,
            descripcion: p.descripcion || "",
            unidad: p.unidad || "",
          }
        })
        
        setProductos(productosFormateados)
        
        // Actualizar productos filtrados
        let filtrados = productosFormateados
        if (busquedaProductos) {
          filtrados = filtrados.filter(
            (p) =>
              p.nombre.toLowerCase().includes(busquedaProductos.toLowerCase()) ||
              p.categoria.toLowerCase().includes(busquedaProductos.toLowerCase())
          )
        }
        if (categoriaFiltro) {
          filtrados = filtrados.filter((p) => p.categoria === categoriaFiltro)
        }
        setProductosFiltrados(filtrados)
        
        // Forzar re-render de imágenes
        setRefreshKey(prev => prev + 1)
      }
    } catch (error: any) {
      console.error('Error al guardar producto:', error)
      alert('Error al guardar producto: ' + error.message)
    }
  }

  const eliminarProducto = async (id: string | number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return
    }

    try {
      // Buscar el producto por ID local para obtener el nombre
      const producto = productos.find((p) => p.id === id)
      if (!producto) {
        alert('Producto no encontrado')
        return
      }

      // Eliminar de la base de datos - usar el ID real del producto
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: producto.nombre,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar producto')
      }

      // Recargar productos desde la base de datos
      const productosResponse = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (productosResponse.ok) {
        const productosData = await productosResponse.json()
        const productosFormateados: Producto[] = productosData.map((p: any) => {
          const imagenDeBD = p.imagen && typeof p.imagen === 'string' && p.imagen.trim() !== ''
            ? p.imagen.trim()
            : null
          const imagenParaMostrar = imagenDeBD || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop"
          
          return {
            id: p.id, // Usar el ID real de la base de datos
            nombre: p.nombre,
            categoria: p.categoria,
            precio: p.precio,
            stock: p.stock || 0,
            imagen: imagenParaMostrar,
            imagenOriginal: imagenDeBD,
            descripcion: p.descripcion || "",
            unidad: p.unidad || "",
          }
        })
        setProductos(productosFormateados)
        setProductosFiltrados(productosFormateados)
      }
    } catch (error: any) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar producto: ' + error.message)
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

  const categorias = Array.from(new Set(productos.map((p) => p.categoria)))

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

            {/* Productos Tab */}
            <TabsContent value="productos" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos..."
                      className="pl-10"
                      value={busquedaProductos}
                      onChange={(e) => setBusquedaProductos(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <Button className="gap-2" onClick={() => abrirDialogProducto()}>
                  <Plus className="h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosFiltrados.map((producto) => (
                  <Card key={`${producto.id}-${producto.nombre}`} className="overflow-hidden border-2 hover:border-primary transition-all">
                    <div className="relative h-48 bg-gray-100 overflow-hidden" style={{ minHeight: '192px' }}>
                      {/* Placeholder mientras carga - más ligero */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center z-0">
                        <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <img
                        key={`img-${producto.id}-${producto.nombre}-${refreshKey}-${producto.imagenOriginal || 'no-img'}`}
                        src={(() => {
                          // Priorizar imagenOriginal (imagen guardada en BD)
                          // La imagen ya está comprimida al subir (máximo 800px, calidad 70%)
                          if (producto.imagenOriginal && producto.imagenOriginal.includes('supabase.co')) {
                            // Agregar parámetros de caché para mejorar rendimiento
                            const url = producto.imagenOriginal
                            // Si no tiene parámetros, agregar timestamp para forzar recarga si es necesario
                            return url.includes('?') ? url : `${url}?cache=1`
                          }
                          // Si no hay imagenOriginal, usar imagen (puede ser por defecto)
                          return producto.imagen
                        })()}
                        alt={producto.nombre}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        width={400}
                        height={300}
                        style={{ 
                          display: 'block', 
                          width: '100%', 
                          height: '100%',
                          opacity: 0,
                          objectFit: 'cover'
                        }}
                        onLoad={(e) => {
                          // Mostrar imagen cuando esté cargada
                          e.currentTarget.style.opacity = '1'
                          // Ocultar placeholder
                          const placeholder = e.currentTarget.previousElementSibling as HTMLElement
                          if (placeholder) {
                            placeholder.style.opacity = '0'
                            setTimeout(() => {
                              placeholder.style.display = 'none'
                            }, 200)
                          }
                        }}
                        onError={(e) => {
                          console.error('❌ Error al cargar imagen:', {
                            nombre: producto.nombre,
                            imagenOriginal: producto.imagenOriginal,
                            imagen: producto.imagen
                          })
                          // Si falla la carga, usar imagen por defecto solo si no es de Supabase
                          if (!producto.imagenOriginal || !producto.imagenOriginal.includes('supabase.co')) {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop"
                          }
                        }}
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{producto.nombre}</CardTitle>
                          <CardDescription>{producto.categoria}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => abrirDialogProducto(producto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => eliminarProducto(producto.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precio:</span>
                          <span className="font-bold text-primary">
                            ${producto.precio.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock:</span>
                          <span className={`font-semibold ${producto.stock > 20 ? 'text-green-600' : 'text-red-600'}`}>
                            {producto.stock} unidades
                          </span>
                        </div>
                        {producto.unidad && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Unidad:</span>
                            <span className="text-sm">{producto.unidad}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {productosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No se encontraron productos</p>
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

      {/* Dialog para Producto */}
      <Dialog open={dialogProductoAbierto} onOpenChange={setDialogProductoAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {productoEditando ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {productoEditando ? "Modifica la información del producto" : "Completa los datos del nuevo producto"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                  placeholder="Ej: Harina 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <select
                  id="categoria"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formProducto.categoria}
                  onChange={(e) => setFormProducto({ ...formProducto, categoria: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Harinas">Harinas</option>
                  <option value="Azúcares">Azúcares</option>
                  <option value="Levaduras">Levaduras</option>
                  <option value="Chocolates">Chocolates</option>
                  <option value="Frutas Secas">Frutas Secas</option>
                  <option value="Grasas">Grasas</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio *</Label>
                <Input
                  id="precio"
                  type="number"
                  value={formProducto.precio}
                  onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formProducto.stock}
                  onChange={(e) => setFormProducto({ ...formProducto, stock: e.target.value })}
                  placeholder="45"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagen del Producto</Label>
              <ImageUpload
                currentImage={formProducto.imagen}
                onImageUploaded={(imageUrl) => {
                  console.log('🖼️ Imagen subida, actualizando formulario:', {
                    imageUrl,
                    imageUrlType: typeof imageUrl,
                    imageUrlLength: imageUrl ? imageUrl.length : 0,
                    esSupabase: imageUrl && imageUrl.includes('supabase.co'),
                    formProductoActual: formProducto
                  })
                  
                  // CRÍTICO: Actualizar el formulario con la URL de Supabase
                  // Solo si es una URL válida de Supabase (no Unsplash)
                  if (imageUrl && imageUrl.includes('supabase.co')) {
                    setFormProducto(prev => {
                      const nuevo = { ...prev, imagen: imageUrl }
                      console.log('✅ FormProducto actualizado con imagen Supabase:', nuevo)
                      return nuevo
                    })
                  } else if (imageUrl === '') {
                    // Si se eliminó la imagen, limpiar el campo
                    setFormProducto(prev => {
                      const nuevo = { ...prev, imagen: '' }
                      console.log('🗑️ FormProducto actualizado (imagen eliminada):', nuevo)
                      return nuevo
                    })
                  } else {
                    console.warn('⚠️ URL de imagen no válida:', imageUrl)
                  }
                }}
                productId={productoEditando?.id.toString()}
                productName={formProducto.nombre || 'producto'}
              />
              <p className="text-xs text-gray-500 mt-2">
                O ingresa una URL manualmente:
              </p>
              <Input
                id="imagen"
                value={formProducto.imagen}
                onChange={(e) => setFormProducto({ ...formProducto, imagen: e.target.value })}
                placeholder="https://images.unsplash.com/... o /productos/imagen.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad</Label>
              <Input
                id="unidad"
                value={formProducto.unidad}
                onChange={(e) => setFormProducto({ ...formProducto, unidad: e.target.value })}
                placeholder="Ej: bolsa 25kg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formProducto.descripcion}
                onChange={(e) => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                placeholder="Descripción del producto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogProductoAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarProducto}>
              {productoEditando ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
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
