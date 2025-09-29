import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance">
            Crea. Personaliza. Vende.
            <span className="text-secondary block">Sin Inventario.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            La plataforma de impresión bajo demanda definitiva que empodera a emprendedores y diseñadores a construir su marca sin
            las complicaciones de inventario, logística o costos iniciales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-4"
            >
              Comenzar a Crear
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent">
              Explorar Mercado
            </Button>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <Image
                src="/products/small.png"
                alt="Custom T-shirt"
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-serif text-xl font-semibold mb-2">Ropa Personalizada</h3>
              <p className="text-muted-foreground">Diseña ropa única que refleje tu marca</p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <Image
                src="/products/small.png"
                alt="Custom Mug"
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-serif text-xl font-semibold mb-2">Hogar y Oficina</h3>
              <p className="text-muted-foreground">Artículos personalizados para uso diario</p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <Image
                src="/products/small.png"
                alt="Custom Phone Case"
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-serif text-xl font-semibold mb-2">Accesorios</h3>
              <p className="text-muted-foreground">Accesorios tecnológicos y artículos personales</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
