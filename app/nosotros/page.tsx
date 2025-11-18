import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Sobre Nosotros</h1>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-700 mb-6">
              Somos una empresa dedicada hace más de 40 años a la distribución y 
              comercialización de productos alimenticios destinados a la panadería 
              tradicional, confitería, pizzería, fábrica de pastas, restaurantes y afines.
            </p>
            <p className="text-gray-600 mb-6">
              Nuestra misión es brindar a nuestros clientes materias primas de la más 
              alta calidad, con un servicio personalizado y atención directa a panaderías, 
              pastelerías, pizzerías, fábricas de pastas, industria gastronómica y profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Nuestra Visión</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ser el distribuidor líder en materias primas para la industria gastronómica, 
                  reconocido por nuestra calidad, servicio y compromiso con nuestros clientes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nuestros Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Calidad, compromiso, servicio personalizado y atención al cliente son los 
                  pilares que nos han acompañado durante más de 40 años en el mercado.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

