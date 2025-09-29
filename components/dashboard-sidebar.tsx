"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Palette, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut,
  Plus,
  BarChart3
} from "lucide-react"

export function DashboardSidebar() {
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/mainpage" },
    { icon: Palette, label: "Crear Diseño", href: "/mainpage/create-design" },
    { icon: ShoppingBag, label: "Productos", href: "/mainpage/products" },
    { icon: Package, label: "Pedidos", href: "/mainpage/orders" },
    { icon: BarChart3, label: "Analíticas", href: "/mainpage/analytics" },
    { icon: Settings, label: "Configuración", href: "/mainpage/settings" },
  ]

  return (
    <div className="w-64 bg-sidebar border-sidebar-border border-r min-h-screen p-6">
      <div className="mb-8">
        <Link href="/" className="font-serif text-2xl font-bold text-sidebar-foreground">
          MerchLab
        </Link>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Panel de Control</p>
      </div>

      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
        
        <Button variant="outline" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
