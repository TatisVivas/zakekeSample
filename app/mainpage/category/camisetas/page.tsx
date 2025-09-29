import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function CamisetasPage() {
  const products = [
    { id: "1001", name: "Camiseta Premium", price: 24.99, image: "/products/small.png" },
    { id: "1002", name: "Camiseta Básica", price: 19.99, image: "/products/small.png" },
    { id: "1003", name: "Camiseta Deportiva", price: 29.99, image: "/products/small.png" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Camisetas</h1>
          <p className="text-muted-foreground">Personaliza camisetas de alta calidad</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-serif text-xl">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-secondary mb-4">${product.price}</p>
                <Link href={`/mainpage/create-design?product=${product.id}`}>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Personalizar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
