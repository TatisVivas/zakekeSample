import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CategoryContent } from "@/components/category-content"

export default function MarroquineriaPage() {
  const products = [
    { 
      id: "3001", 
      name: "Bolso Tote", 
      price: 39.99, 
      image: "/products/small.png",
      rating: 4.7,
      reviews: 89,
      category: "marroquineria",
      tags: ["Tote", "Elegante", "Unisex"]
    },
    { 
      id: "3002", 
      name: "Mochila", 
      price: 49.99, 
      image: "/products/small.png",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      category: "marroquineria",
      tags: ["Mochila", "Práctica", "Unisex"]
    },
    { 
      id: "3003", 
      name: "Riñonera", 
      price: 24.99, 
      image: "/products/small.png",
      rating: 4.5,
      reviews: 67,
      category: "marroquineria",
      tags: ["Riñonera", "Compacta", "Unisex"]
    },
    { 
      id: "3004", 
      name: "Bolso Eco-Friendly", 
      price: 44.99, 
      image: "/products/small.png",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      category: "marroquineria",
      tags: ["Eco", "Sostenible", "Unisex"]
    },
    { 
      id: "3005", 
      name: "Cartera Minimalista", 
      price: 34.99, 
      image: "/products/small.png",
      rating: 4.6,
      reviews: 43,
      category: "marroquineria",
      tags: ["Cartera", "Minimalista", "Unisex"]
    },
    { 
      id: "3006", 
      name: "Bolso Premium", 
      price: 59.99, 
      image: "/products/small.png",
      rating: 4.8,
      reviews: 98,
      isNew: true,
      category: "marroquineria",
      tags: ["Premium", "Lujo", "Unisex"]
    },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1">
        <CategoryContent category="marroquinería" products={products} />
      </div>
    </div>
  )
}
