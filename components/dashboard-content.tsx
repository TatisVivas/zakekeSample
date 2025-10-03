"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Play,
  ChevronRight,
  Heart,
  ShoppingBag,
  Crown,
  Leaf,
  Shirt,
  Coffee
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export function DashboardContent() {
  const [userName, setUserName] = useState<string>("Usuario")
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (!error && user?.email) {
        // Extraer nombre del email (antes del @) o usar el nombre completo si existe
        const name = user.user_metadata?.name ||
                    user.email?.split('@')[0] ||
                    "Usuario"
        const finalName = name.charAt(0).toUpperCase() + name.slice(1)
        setUserName(finalName)
      }
    }
    getUser()
  }, [supabase])
  const categories = [
    {
      id: "marroquineria",
      name: "Marroquinería",
      description: "Carteras, billeteras y accesorios de cuero",
      icon: ShoppingBag,
      color: "bg-amber-500",
      href: "/mainpage/category/marroquineria"
    },
    {
      id: "camisetas",
      name: "Camisetas",
      description: "Diseños únicos en textiles premium",
      icon: Shirt,
      color: "bg-blue-500",
      href: "/mainpage/category/camisetas"
    },
    {
      id: "gorras",
      name: "Gorras",
      description: "Estilos urbanos y deportivos",
      icon: Crown,
      color: "bg-purple-500",
      href: "/mainpage/category/gorras"
    },
    {
      id: "panoletas",
      name: "Pañoletas",
      description: "Accesorios elegantes y versátiles",
      icon: Heart,
      color: "bg-pink-500",
      href: "/mainpage/category/panoletas"
    },
    {
      id: "termos",
      name: "Termos",
      description: "Mantén tus bebidas perfectas",
      icon: Coffee,
      color: "bg-green-500",
      href: "/mainpage/category/termos"
    },
    {
      id: "sostenibles",
      name: "Línea Sostenible",
      description: "Productos eco-amigables",
      icon: Leaf,
      color: "bg-emerald-500",
      href: "/mainpage/category/sostenibles"
    }
  ]

  const recommendedProducts = [
    {
      id: 1,
      name: "Cartera Ejecutiva Premium",
      category: "Marroquinería",
      price: "$89.99",
      image: "/products/small.png",
      trending: true
    },
    {
      id: 2,
      name: "Camiseta Vintage Retro",
      category: "Camisetas",
      price: "$24.99",
      image: "/totebag-sample.jpg",
      trending: false
    },
    {
      id: 3,
      name: "Gorra Snapback Urban",
      category: "Gorras",
      price: "$34.99",
      image: "/products/small.png",
      trending: true
    },
    {
      id: 4,
      name: "Termo Eco-Friendly",
      category: "Sostenibles",
      price: "$45.99",
      image: "/products/small.png",
      trending: false
    }
  ]

  const recentlyViewed = [
    {
      id: 1,
      name: "Billetera Minimalista",
      category: "Marroquinería",
      image: "/products/small.png"
    },
    {
      id: 2,
      name: "Pañoleta Seda Premium",
      category: "Pañoletas",
      image: "/products/small.png"
    },
    {
      id: 3,
      name: "Botella Bambú",
      category: "Sostenibles",
      image: "/products/small.png"
    }
  ]

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-accent/5 to-secondary/5 min-h-screen">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">¡Hola, {userName}! 👋</h1>
            <p className="text-muted-foreground text-lg">¿Qué vas a crear hoy?</p>
          </div>
          <Link href="/mainpage/create-design">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
              <Plus className="h-5 w-5 mr-2" />
              Personalizar producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">Explora por Categoría</h2>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Ver todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-0">
                    <div className="relative h-32 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
                      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <Play className="w-6 h-6 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-xl font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">Tendencias Ahora 🔥</h2>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Ver más
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/products/small.png'
                        }}
                      />
                    </div>
                    {product.trending && (
                      <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                        Trending
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <p className="font-bold text-secondary">{product.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">Vistos Recientemente</h2>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Limpiar historial
            </Button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {recentlyViewed.map((item) => (
              <Card key={item.id} className="flex-shrink-0 w-48 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-full h-32 bg-muted rounded-t-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={200}
                      height={128}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/products/small.png'
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="pb-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Tu Rendimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Productos Activos</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas del Mes</p>
                    <p className="text-2xl font-bold">$2,847</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vistas Totales</p>
                    <p className="text-2xl font-bold">1,429</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversión</p>
                    <p className="text-2xl font-bold">3.2%</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
