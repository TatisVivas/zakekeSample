import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function CTAPage() {
  const testimonials = [
    {
      name: "María González",
      role: "Emprendedora",
      content: "MerchLab me permitió lanzar mi marca sin inversión inicial. ¡Increíble!",
      rating: 5
    },
    {
      name: "Carlos Ruiz",
      role: "Diseñador",
      content: "La calidad de impresión es excelente y el proceso súper fácil.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Tienda Online",
      content: "Mis clientes aman los productos personalizados. ¡Ventas por las nubes!",
      rating: 5
    }
  ]

  const stats = [
    { icon: Users, value: "10,000+", label: "Usuarios Activos" },
    { icon: Star, value: "4.9/5", label: "Calificación" },
    { icon: Zap, value: "3-5 días", label: "Tiempo de Entrega" }
  ]

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
            ¿Listo para Empezar?
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de emprendedores que ya están vendiendo con MerchLab. 
            Sin costos iniciales, sin inventario, sin complicaciones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-secondary" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/mainpage">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-4">
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-muted-foreground">
              Miles de emprendedores ya confían en MerchLab
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
            No esperes más
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Tu negocio de impresión bajo demanda te está esperando
          </p>
          
          <Link href="/mainpage">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-12 py-4">
              Empezar Ahora
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
