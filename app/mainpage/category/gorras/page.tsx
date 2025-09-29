import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CategoryContent } from "@/components/category-content"

export default function GorrasPage() {
  const products = [
    { 
      id: "2001", 
      name: "Gorra Clásica", 
      price: 19.99, 
      image: "/products/small.png",
      rating: 4.6,
      reviews: 89,
      category: "gorras",
      tags: ["Clásica", "Unisex", "Ajustable"]
    },
    { 
      id: "2002", 
      name: "Gorra Snapback", 
      price: 24.99, 
      image: "/products/small.png",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      category: "gorras",
      tags: ["Snapback", "Urban", "Unisex"]
    },
    { 
      id: "2003", 
      name: "Gorra Trucker", 
      price: 22.99, 
      image: "/products/small.png",
      rating: 4.5,
      reviews: 67,
      category: "gorras",
      tags: ["Trucker", "Vintage", "Unisex"]
    },
    { 
      id: "2004", 
      name: "Gorra Deportiva", 
      price: 26.99, 
      image: "/products/small.png",
      rating: 4.7,
      reviews: 98,
      isNew: true,
      category: "gorras",
      tags: ["Deportiva", "Tecnología", "Unisex"]
    },
    { 
      id: "2005", 
      name: "Gorra Minimalista", 
      price: 21.99, 
      image: "/products/small.png",
      rating: 4.4,
      reviews: 43,
      category: "gorras",
      tags: ["Minimalista", "Moderno", "Unisex"]
    },
    { 
      id: "2006", 
      name: "Gorra Personalizada", 
      price: 28.99, 
      image: "/products/small.png",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      category: "gorras",
      tags: ["Personalizada", "Premium", "Unisex"]
    },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1">
        <CategoryContent category="gorras" products={products} />
      </div>
    </div>
  )
}
