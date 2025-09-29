import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function ProductsShowcase() {
  const categories = [
    {
      id: "camisetas",
      name: "Camisetas",
      description: "Ropa personalizada de alta calidad",
      image: "/products/small.png",
      href: "/mainpage/category/camisetas"
    },
    {
      id: "gorras",
      name: "Gorras",
      description: "Accesorios con estilo único",
      image: "/products/small.png",
      href: "/mainpage/category/gorras"
    },
    {
      id: "marroquineria",
      name: "Marroquinería",
      description: "Bolsos y accesorios premium",
      image: "/products/small.png",
      href: "/mainpage/category/marroquineria"
    },
    {
      id: "panoletas",
      name: "Pañoletas",
      description: "Accesorios elegantes y versátiles",
      image: "/products/small.png",
      href: "/mainpage/category/panoletas"
    },
    {
      id: "sostenibles",
      name: "Sostenibles",
      description: "Productos eco-friendly",
      image: "/products/small.png",
      href: "/mainpage/category/sostenibles"
    },
    {
      id: "termos",
      name: "Termos",
      description: "Mantén tus bebidas perfectas",
      image: "/products/small.png",
      href: "/mainpage/category/termos"
    }
  ]

  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nuestros Productos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre nuestra amplia gama de productos personalizables. Desde ropa hasta accesorios, todo lo que necesitas para tu marca.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <Link href={category.href}>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Explorar {category.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/mainpage">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Ver Todos los Productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
