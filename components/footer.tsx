import Link from "next/link"
import { Instagram, Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <span className="text-xl font-bold text-white">DM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-normal text-gray-300">Distribuidora</span>
                <span className="text-lg font-bold">MUNDO JLP</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Distribuidora mayorista de materias primas para panaderías, confiterías, 
              pizzerías, fábrica de pastas, industria gastronómica y profesionales.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-gray-300 hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+541160051540" className="text-gray-300 hover:text-white transition-colors">
                  11 6005-1540
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram className="h-4 w-4" />
                <a
                  href="https://instagram.com/distribuidoramundo_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  @distribuidoramundo_
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@mundojlp.com" className="text-gray-300 hover:text-white transition-colors">
                  info@mundojlp.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Distribuidora MUNDO JLP - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}

