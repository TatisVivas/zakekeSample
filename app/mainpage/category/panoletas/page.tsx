import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CategoryContent } from "@/components/category-content"

export default function PanoletasPage() {
  const products = [
    { 
      id: "4001", 
      name: "Pañoleta Clásica", 
      price: 14.99, 
      image: "/products/small.png",
      rating: 4.5,
      reviews: 67,
      category: "panoletas",
      tags: ["Clásica", "Elegante", "Unisex"]
    },
    { 
      id: "4002", 
      name: "Pañoleta Deportiva", 
      price: 16.99, 
      image: "/products/small.png",
      rating: 4.7,
      reviews: 89,
      isNew: true,
      category: "panoletas",
      tags: ["Deportiva", "Práctica", "Unisex"]
    },
    { 
      id: "4003", 
      name: "Pañoleta Elegante", 
      price: 19.99, 
      image: "/products/small.png",
      rating: 4.8,
      reviews: 124,
      category: "panoletas",
      tags: ["Elegante", "Premium", "Unisex"]
    },
    { 
      id: "4004", 
      name: "Pañoleta Artística", 
      price: 22.99, 
      image: "/products/small.png",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      category: "panoletas",
      tags: ["Arte", "Creativo", "Unisex"]
    },
    { 
      id: "4005", 
      name: "Pañoleta Minimalista", 
      price: 17.99, 
      image: "/products/small.png",
      rating: 4.6,
      reviews: 43,
      category: "panoletas",
      tags: ["Minimalista", "Moderno", "Unisex"]
    },
    { 
      id: "4006", 
      name: "Pañoleta Vintage", 
      price: 21.99, 
      image: "/products/small.png",
      rating: 4.4,
      reviews: 98,
      category: "panoletas",
      tags: ["Vintage", "Retro", "Unisex"]
    },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1">
        <CategoryContent category="pañoletas" products={products} />
      </div>
    </div>
  )
}
