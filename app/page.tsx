"use client"

import { useSession } from "next-auth/react"
import AdminPage from "./admin/page"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { ProductsShowcase } from "@/components/products-showcase"

export default function Home() {
  const { data: session } = useSession()
  const userRole = session?.user ? (session.user as { role?: string }).role : null
  const isAdmin = userRole === "admin"

  // Si es admin, mostrar el panel de administración completo
  if (isAdmin) {
    return <AdminPage />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <ProductsShowcase />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

