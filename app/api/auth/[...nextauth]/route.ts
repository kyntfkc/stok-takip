import NextAuth from "next-auth"
import { config } from "@/lib/auth"

const nextAuth = NextAuth(config)

export const { handlers, auth } = nextAuth
export const { GET, POST } = handlers

