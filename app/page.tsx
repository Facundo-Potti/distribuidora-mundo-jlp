import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

