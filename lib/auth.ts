import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "./types"

export const config: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string }
          })

          if (!user) {
            console.log("User not found:", credentials.username)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.username)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// NextAuth v5 için auth helper
export async function getServerSession() {
  try {
    // NextAuth v5 beta'da auth() fonksiyonu route handler'dan geliyor
    const { auth } = await import("@/app/api/auth/[...nextauth]/route")
    const session = await auth()
    if (session) {
      console.log("getServerSession: Session found for user:", session.user?.email || session.user?.name)
    } else {
      console.log("getServerSession: No session found")
    }
    return session
  } catch (error) {
    console.error("getServerSession error:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}

// Backward compatibility için
export const authOptions = config
