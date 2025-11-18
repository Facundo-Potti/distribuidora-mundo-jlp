import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Distribuidora MUNDO JLP - Materias Primas para Panaderías y Confiterías",
  description: "Distribuidora mayorista de materias primas para panaderías, confiterías, pizzerías y más. Más de 40 años en el mercado.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

