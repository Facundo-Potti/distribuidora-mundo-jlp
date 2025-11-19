"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, User, LogOut, BarChart3, Settings } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Logo } from "./logo"

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userRole = session?.user ? (session.user as { role?: string }).role : null

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex h-28 md:h-32 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          {userRole !== "admin" && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-base md:text-lg font-semibold text-gray-700 hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-base md:text-lg font-semibold text-gray-700 hover:text-primary transition-colors">
                Productos
              </Link>
              <Link href="/nosotros" className="text-base md:text-lg font-semibold text-gray-700 hover:text-primary transition-colors">
                Nosotros
              </Link>
              <Link href="/contacto" className="text-base md:text-lg font-semibold text-gray-700 hover:text-primary transition-colors">
                Contacto
              </Link>
            </nav>
          )}

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center gap-3">
                {/* Badge de Rol */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  userRole === "admin"
                    ? "bg-primary text-white"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {userRole === "admin" ? "Administrador" : "Cliente"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user?.name && (
                          <p className="font-medium">{session.user.name}</p>
                        )}
                        {session.user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                        <span className={`text-xs mt-1 ${
                          userRole === "admin"
                            ? "text-primary font-semibold"
                            : "text-blue-600 font-semibold"
                        }`}>
                          {userRole === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/estadisticas" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Estadísticas
                      </Link>
                    </DropdownMenuItem>
                    {userRole === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Administración
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Ingresar</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && userRole !== "admin" && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-base font-semibold text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                className="text-base font-semibold text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/nosotros"
                className="text-base font-semibold text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                className="text-base font-semibold text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              {!session && (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Ingresar
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      Registrarse
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
