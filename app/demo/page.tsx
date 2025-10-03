import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const features = [
    "Diseño intuitivo y fácil de usar",
    "Más de 100 productos personalizables",
    "Impresión de alta calidad",
    "Envío rápido y confiable",
    "Sin costos iniciales",
    "Soporte 24/7"
  ]

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
            Ve MerchLab en Acción
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubre cómo funciona nuestra plataforma de impresión bajo demanda. 
            Ve ejemplos reales de productos personalizados.
          </p>
          
          <div className="mb-12">
            <div className="relative bg-muted rounded-lg p-8 mb-6">
              <div className="w-full h-64 bg-background rounded flex items-center justify-center">
                <Play className="w-16 h-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Video demostrativo de la plataforma MerchLab
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">¿Qué incluye la demo?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Casos de Éxito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h3 className="font-semibold">Tienda de Deportes</h3>
                    <p className="text-sm text-muted-foreground">
                      Vendió 500+ camisetas personalizadas en su primer mes
                    </p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h3 className="font-semibold">Artista Local</h3>
                    <p className="text-sm text-muted-foreground">
                      Monetizó su arte con productos personalizados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mainpage">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
