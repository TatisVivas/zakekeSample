import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Palette, 
  Truck, 
  Shield, 
  Zap, 
  Users, 
  Globe 
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: "Diseño Ilimitado",
      description: "Crea diseños únicos con nuestras herramientas profesionales. Sin límites de creatividad."
    },
    {
      icon: Truck,
      title: "Envío Rápido",
      description: "Impresión y envío en 3-5 días hábiles. Entrega directa a tus clientes."
    },
    {
      icon: Shield,
      title: "Calidad Garantizada",
      description: "Productos premium con garantía de calidad. Satisfacción 100% garantizada."
    },
    {
      icon: Zap,
      title: "Sin Inventario",
      description: "Vende sin preocuparte por stock. Imprimimos solo cuando hay pedidos."
    },
    {
      icon: Users,
      title: "Marca Personal",
      description: "Construye tu marca con productos personalizados y diseños únicos."
    },
    {
      icon: Globe,
      title: "Mercado Global",
      description: "Vende en todo el mundo con nuestra red de impresión internacional."
    }
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            ¿Por qué elegir MerchLab?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            La plataforma más completa para crear, personalizar y vender productos sin las complicaciones tradicionales del comercio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-chart-1" />
                </div>
                <CardTitle className="font-serif text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
