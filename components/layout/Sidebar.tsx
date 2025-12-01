"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  BarChart3,
  Menu,
  Settings,
  ScanLine,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Üretim Talepleri", href: "/orders/production", icon: ShoppingCart },
  { name: "Operasyonel İşlemler", href: "/operations", icon: ScanLine },
  { name: "Stok", href: "/stock", icon: Warehouse },
  { name: "Raporlar", href: "/reports", icon: BarChart3 },
  { name: "İşlem Kayıtları", href: "/logs", icon: History },
  { name: "Ayarlar", href: "/settings", icon: Settings, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { data: session } = useSession()
  
  // Admin kontrolü ile filtrele
  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || session?.user?.role === "ADMIN"
  )

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex flex-col shrink-0 items-center justify-center py-4 gap-1.5">
            {logoError ? (
              <h1 className="text-xl font-bold text-gray-900">Stok Takip</h1>
            ) : (
              <>
                <div className="relative w-28 h-auto">
                  <Image
                    src="/logo.png"
                    alt="indigo TAKI"
                    width={112}
                    height={112}
                    className="w-full h-auto object-contain"
                    unoptimized
                    onError={() => setLogoError(true)}
                  />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-0.5">Stok Takip</p>
              </>
            )}
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            isActive
                              ? "bg-gray-50 text-gray-900"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors"
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4">
          {logoError ? (
            <h1 className="text-lg font-bold text-gray-900">Stok Takip</h1>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-20 h-auto">
                <Image
                  src="/logo.png"
                  alt="indigo TAKI"
                  width={112}
                  height={112}
                  className="w-full h-auto object-contain"
                  unoptimized
                  onError={() => setLogoError(true)}
                />
              </div>
              <p className="text-xs font-medium text-gray-600">Stok Takip</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    isActive
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                    "group flex gap-x-3 rounded-md p-2 mx-2 text-sm leading-6 font-semibold"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900",
                      "h-6 w-6 shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

