import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Search,
  TrendingUp,
  Users,
  Award
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MarketplacePage() {
  const featuredProducts = [
    {
      id: "mp001",
      name: "Camiseta Vintage Rock",
      price: 24.99,
      originalPrice: 29.99,
      image: "/products/small.png",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      isSale: true,
      category: "camisetas",
      tags: ["Vintage", "Rock", "Unisex"],
      seller: "RockStore",
      sellerRating: 4.9
    },
    {
      id: "mp002",
      name: "Gorra Streetwear",
      price: 19.99,
      image: "/products/small.png",
      rating: 4.6,
      reviews: 89,
      category: "gorras",
      tags: ["Streetwear", "Urban", "Unisex"],
      seller: "UrbanGear",
      sellerRating: 4.7
    },
    {
      id: "mp003",
      name: "Bolso Eco-Friendly",
      price: 39.99,
      image: "/products/small.png",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      category: "marroquineria",
      tags: ["Eco", "Sostenible", "Unisex"],
      seller: "EcoStyle",
      sellerRating: 4.8
    },
    {
      id: "mp004",
      name: "Taza Minimalista",
      price: 16.99,
      image: "/products/small.png",
      rating: 4.5,
      reviews: 67,
      category: "termos",
      tags: ["Minimalista", "Moderno", "Unisex"],
      seller: "MinimalCo",
      sellerRating: 4.6
    },
    {
      id: "mp005",
      name: "Pañoleta Artística",
      price: 22.99,
      image: "/products/small.png",
      rating: 4.7,
      reviews: 43,
      category: "panoletas",
      tags: ["Arte", "Creativo", "Unisex"],
      seller: "ArtCraft",
      sellerRating: 4.9
    },
    {
      id: "mp006",
      name: "Camiseta Orgánica",
      price: 34.99,
      image: "/products/small.png",
      rating: 4.8,
      reviews: 98,
      category: "sostenibles",
      tags: ["Orgánica", "Eco", "Unisex"],
      seller: "GreenWear",
      sellerRating: 4.8
    }
  ]

  const topSellers = [
    { name: "RockStore", sales: 1250, rating: 4.9, products: 45 },
    { name: "UrbanGear", sales: 980, rating: 4.7, products: 32 },
    { name: "EcoStyle", sales: 756, rating: 4.8, products: 28 },
    { name: "MinimalCo", sales: 654, rating: 4.6, products: 19 },
    { name: "ArtCraft", sales: 543, rating: 4.9, products: 15 }
  ]

  return (
    <main className="min-h-screen">
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-chart-1/5 to-chart-2/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
              Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Descubre productos únicos creados por diseñadores y emprendedores de todo el mundo. 
              Encuentra inspiración y compra productos personalizados de alta calidad.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos, categorías o vendedores..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-chart-1 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 mx-auto mb-4 text-chart-1" />
                <div className="text-2xl font-bold">1,250+</div>
                <div className="text-sm text-muted-foreground">Productos únicos</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 mx-auto mb-4 text-chart-2" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Vendedores activos</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="w-8 h-8 mx-auto mb-4 text-chart-3" />
                <div className="text-2xl font-bold">4.8/5</div>
                <div className="text-sm text-muted-foreground">Calificación promedio</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Sellers */}
          <div className="mb-16">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
              Vendedores Destacados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topSellers.map((seller, index) => (
                <Card key={seller.name} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-chart-1/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-chart-1">
                        {seller.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{seller.name}</h3>
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-4 h-4 fill-chart-1 text-chart-1 mr-1" />
                      <span className="text-sm">{seller.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {seller.sales} ventas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {seller.products} productos
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl font-bold text-foreground">
                Productos Destacados
              </h2>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <SortAsc className="w-4 h-4 mr-2" />
                  Ordenar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col space-y-1">
                      {product.isNew && (
                        <Badge className="bg-chart-1 text-white">Nuevo</Badge>
                      )}
                      {product.isSale && (
                        <Badge className="bg-chart-2 text-white">Oferta</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        por <span className="font-medium">{product.seller}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 fill-chart-1 text-chart-1" />
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-chart-2">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/mainpage/create-design?product=${product.id}`} className="flex-1">
                        <Button className="w-full bg-chart-1 hover:bg-chart-1/90 text-white">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Personalizar
                        </Button>
                      </Link>
                      <Link href={`/product/${product.id}`}>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
