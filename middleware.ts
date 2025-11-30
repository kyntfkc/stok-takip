import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  
  // Eğer login sayfasındaysa ve zaten giriş yapmışsa ana sayfaya yönlendir
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Eğer giriş yapmamışsa login sayfasına yönlendir
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  const path = request.nextUrl.pathname
  
  // Admin only routes
  if (path.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
