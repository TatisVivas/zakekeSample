"use client"

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
  List
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  isNew?: boolean
  isSale?: boolean
  category: string
  tags: string[]
}

interface CategoryContentProps {
  category: string
  products: Product[]
}

export function CategoryContent({ category, products }: CategoryContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'newest'>('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return b.isNew ? 1 : -1
      default:
        return 0
    }
  })

  const filteredProducts = sortedProducts.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  )

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2 capitalize">
              {category}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} productos encontrados
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background"
          >
            <option value="newest">Más recientes</option>
            <option value="price">Precio: menor a mayor</option>
            <option value="rating">Mejor valorados</option>
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Precio:</span>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-24"
            />
            <span className="text-sm">${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden rounded-t-lg">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                  viewMode === 'grid' ? 'h-64' : 'h-32'
                }`}
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
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1 ml-2">
                  <Star className="w-4 h-4 fill-chart-1 text-chart-1" />
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
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
                <Link href={`/customizer?productid=${product.id}&quantity=1&from=products`} className="flex-1">
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No se encontraron productos con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  )
}
