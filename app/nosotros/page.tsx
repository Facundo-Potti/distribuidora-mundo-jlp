import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black">Sobre Nosotros</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Más de 40 años de experiencia en la distribución de materias primas
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-16">
            <div className="bg-gradient-to-br from-primary/5 to-white p-8 rounded-2xl mb-8">
              <p className="text-xl md:text-2xl text-gray-800 mb-6 leading-relaxed">
                Somos una empresa dedicada hace más de <span className="font-bold text-primary">40 años</span> a la distribución y 
                comercialización de productos alimenticios destinados a la panadería 
                tradicional, confitería, pizzería, fábrica de pastas, restaurantes y afines.
              </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Nuestra misión es brindar a nuestros clientes materias primas de la más 
                alta calidad, con un servicio personalizado y atención directa a panaderías, 
                pastelerías, pizzerías, fábricas de pastas, industria gastronómica y profesionales.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Nuestra Visión</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Ser el distribuidor líder en materias primas para la industria gastronómica, 
                  reconocido por nuestra calidad, servicio y compromiso con nuestros clientes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Nuestros Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
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

