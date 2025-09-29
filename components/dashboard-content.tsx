"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DesignCreationFlow } from "@/components/design-creation-flow"
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users,
  Plus,
  Eye
} from "lucide-react"
import Link from "next/link"

export function DashboardContent() {
  const stats = [
    { title: "Ventas del Mes", value: "$2,450", change: "+12%", icon: DollarSign },
    { title: "Productos Vendidos", value: "156", change: "+8%", icon: Package },
    { title: "Nuevos Clientes", value: "23", change: "+15%", icon: Users },
    { title: "Tasa de Conversión", value: "3.2%", change: "+0.5%", icon: TrendingUp },
  ]

  const recentProducts = [
    { name: "Camiseta Premium", price: "$24.99", orders: 45, image: "/products/small.png" },
    { name: "Taza Personalizada", price: "$16.99", orders: 32, image: "/products/small.png" },
    { name: "Gorra con Logo", price: "$19.99", orders: 28, image: "/products/small.png" },
  ]

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          ¡Bienvenido de vuelta!
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu negocio de impresión bajo demanda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-chart-1">
                {stat.change} desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Productos Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.orders} pedidos • {product.price}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/mainpage/category/camisetas">
                  <Button className="w-full h-20 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-semibold">Crear Nuevo Diseño</div>
                      <div className="text-xs opacity-80">Personaliza productos</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/mainpage/category/camisetas">
                  <Button variant="outline" className="w-full h-20">
                    <div className="text-center">
                      <Package className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-semibold">Explorar Productos</div>
                      <div className="text-xs text-muted-foreground">Ver catálogo</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
