"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Palette, 
  Building, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react"

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      icon: Package,
      label: "Mis Productos",
      href: "/mainpage",
      active: true
    },
    {
      icon: Palette,
      label: "Mis Diseños",
      href: "/mainpage/create-design",
      active: false
    },
    {
      icon: Building,
      label: "Mi Empresa",
      href: "/mainpage/company",
      active: false
    },
    {
      icon: BarChart3,
      label: "Analíticas",
      href: "/mainpage/analytics",
      active: false
    },
    {
      icon: Settings,
      label: "Configuración",
      href: "/mainpage/settings",
      active: false
    }
  ]

  return (
    <div className={`bg-primary text-primary-foreground transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-primary-foreground/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="font-serif text-2xl font-bold">
              MerchLab
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-primary-foreground hover:text-secondary"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-primary-foreground/10 ${
                item.active ? 'bg-secondary text-secondary-foreground' : ''
              }`}>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-primary-foreground/20">
        <div className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-secondary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">Juan Pablo</p>
              <p className="text-xs text-primary-foreground/70">juan@example.com</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:text-secondary mt-2">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
