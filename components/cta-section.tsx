import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary text-secondary-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para comenzar tu negocio?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Únete a miles de emprendedores que ya están vendiendo con MerchLab. 
          Sin costos iniciales, sin inventario, sin complicaciones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/mainpage">
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-4"
            >
              Comenzar Ahora
            </Button>
          </Link>
          <Link href="/demo">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-background text-background hover:bg-background hover:text-foreground text-lg px-8 py-4"
            >
              Ver Demo
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">0$</div>
            <div className="opacity-80">Costo inicial</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">3-5 días</div>
            <div className="opacity-80">Tiempo de entrega</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="opacity-80">Soporte disponible</div>
          </div>
        </div>
      </div>
    </section>
  )
}
