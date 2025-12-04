import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

// Extender tipos de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log(`🔐 Intentando autenticar: ${credentials.email}`)
          
          // Buscar usuario en la base de datos
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.error(`❌ Usuario no encontrado: ${credentials.email}`)
            return null
          }

          console.log(`✅ Usuario encontrado: ${user.email}, rol: ${user.role}`)

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error(`❌ Contraseña inválida para: ${credentials.email}`)
            return null
          }

          console.log(`✅ Usuario autenticado exitosamente: ${user.email} (rol: ${user.role})`)

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Error en autenticación:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

