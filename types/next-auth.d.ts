import { Role } from "@/lib/types"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
    }
  }

  interface User {
    role: Role
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    id: string
  }
}

