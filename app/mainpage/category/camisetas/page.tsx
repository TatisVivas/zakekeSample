import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CategoryContent } from "@/components/category-content"

export default function CamisetasPage() {
  const products = [
    { 
      id: "1001", 
      name: "Camiseta Premium", 
      price: 24.99, 
      originalPrice: 29.99,
      image: "/products/small.png",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      isSale: true,
      category: "camisetas",
      tags: ["Premium", "Algodón", "Unisex"]
    },
    { 
      id: "1002", 
      name: "Camiseta Básica", 
      price: 19.99, 
      image: "/products/small.png",
      rating: 4.5,
      reviews: 89,
      category: "camisetas",
      tags: ["Básica", "Económica", "Unisex"]
    },
    { 
      id: "1003", 
      name: "Camiseta Deportiva", 
      price: 29.99, 
      image: "/products/small.png",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      category: "camisetas",
      tags: ["Deportiva", "Tecnología", "Unisex"]
    },
    { 
      id: "1004", 
      name: "Camiseta Vintage", 
      price: 22.99, 
      image: "/products/small.png",
      rating: 4.3,
      reviews: 67,
      category: "camisetas",
      tags: ["Vintage", "Retro", "Unisex"]
    },
    { 
      id: "1005", 
      name: "Camiseta Orgánica", 
      price: 34.99, 
      image: "/products/small.png",
      rating: 4.7,
      reviews: 43,
      category: "camisetas",
      tags: ["Orgánica", "Eco-friendly", "Unisex"]
    },
    { 
      id: "1006", 
      name: "Camiseta Slim Fit", 
      price: 26.99, 
      image: "/products/small.png",
      rating: 4.6,
      reviews: 98,
      category: "camisetas",
      tags: ["Slim Fit", "Moderno", "Unisex"]
    },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1">
        <CategoryContent category="camisetas" products={products} />
      </div>
    </div>
  )
}
