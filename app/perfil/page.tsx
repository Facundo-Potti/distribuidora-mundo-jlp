"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface PerfilUsuario {
  nombre: string
  email: string
  telefono: string
  direccion: string
  fechaRegistro: string
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      // Cargar datos del perfil desde localStorage
      const perfilGuardado = localStorage.getItem(`perfil_${session.user.email}`)
      if (perfilGuardado) {
        const perfil: PerfilUsuario = JSON.parse(perfilGuardado)
        setFormData({
          nombre: perfil.nombre || session.user.name || "",
          telefono: perfil.telefono || "",
          direccion: perfil.direccion || "",
        })
      } else {
        setFormData({
          nombre: session.user.name || "",
          telefono: "",
          direccion: "",
        })
      }
    }
  }, [session])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGuardado(false)

    if (!session?.user?.email) return

    const perfilCompleto: PerfilUsuario = {
      nombre: formData.nombre,
      email: session.user.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      fechaRegistro: new Date().toISOString().split("T")[0],
    }

    // Guardar en localStorage
    localStorage.setItem(`perfil_${session.user.email}`, JSON.stringify(perfilCompleto))

    setTimeout(() => {
      setLoading(false)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }, 500)
  }

  // Obtener pedidos del usuario
  const obtenerPedidosUsuario = () => {
    if (!session?.user?.email) return []
    const pedidosGuardados = localStorage.getItem("admin_pedidos")
    if (!pedidosGuardados) return []
    const pedidos = JSON.parse(pedidosGuardados)
    // Buscar pedidos del cliente por email o nombre
    return pedidos.filter((p: any) => 
      p.clienteEmail === session.user?.email || 
      p.cliente === session.user?.name ||
      p.cliente === formData.nombre
    )
  }

  const pedidosUsuario = obtenerPedidosUsuario()

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información del Usuario */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center space-x-4 pb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="text-2xl">
                        {session.user?.name?.charAt(0).toUpperCase() || formData.nombre?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{formData.nombre || session.user?.name || "Usuario"}</h3>
                      <p className="text-sm text-gray-600">{session.user?.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={session.user?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Tu dirección"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Guardando..." : guardado ? "✓ Guardado" : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="font-semibold">
                    {new Date().getFullYear()}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Pedidos realizados</p>
                  <p className="font-semibold text-2xl text-primary">{pedidosUsuario.length}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Estado de cuenta</p>
                  <p className="font-semibold text-green-600">Activa</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  <p className="font-semibold">
                    {session.user?.role === "admin" ? (
                      <span className="text-primary">Administrador</span>
                    ) : (
                      <span className="text-blue-600">Cliente</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
