import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-serif text-2xl font-bold text-foreground">
              MerchLab
            </Link>
            <p className="text-muted-foreground mt-4 max-w-md">
              La plataforma de impresión bajo demanda que empodera a emprendedores y diseñadores 
              a construir su marca sin complicaciones.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Productos</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/mainpage/category/camisetas" className="hover:text-foreground transition-colors">Camisetas</Link></li>
              <li><Link href="/mainpage/category/gorras" className="hover:text-foreground transition-colors">Gorras</Link></li>
              <li><Link href="/mainpage/category/marroquineria" className="hover:text-foreground transition-colors">Marroquinería</Link></li>
              <li><Link href="/mainpage/category/termos" className="hover:text-foreground transition-colors">Termos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#help" className="hover:text-foreground transition-colors">Centro de Ayuda</Link></li>
              <li><Link href="#contact" className="hover:text-foreground transition-colors">Contacto</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition-colors">Precios</Link></li>
              <li><Link href="#terms" className="hover:text-foreground transition-colors">Términos</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 MerchLab. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
