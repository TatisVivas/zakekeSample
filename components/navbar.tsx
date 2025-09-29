import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-serif text-2xl font-bold">
              MerchLab
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#features" className="hover:text-secondary transition-colors">
                Características
              </Link>
              <Link href="#products" className="hover:text-secondary transition-colors">
                Productos
              </Link>
              <Link href="/mainpage/category/camisetas" className="hover:text-secondary transition-colors">
                Catálogo
              </Link>
              <Link href="/cart" className="hover:text-secondary transition-colors">
                Carrito
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/mainpage">
              <Button variant="ghost" className="text-primary-foreground hover:text-secondary">
                Dashboard
              </Button>
            </Link>
            <Link href="/mainpage/category/camisetas">
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Comenzar</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
