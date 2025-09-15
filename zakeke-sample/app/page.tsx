import Link from "next/link";
import { getProducts } from "@/lib/db";

export default function Home() {
  const { items } = getProducts(1, 10);
  const p = items[0];
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Catálogo</h1>
      {p && (
        <div className="border rounded p-4 flex gap-4 items-center">
          <img src={p.imageUrl || "/totebag-sample.jpg"} alt={p.name} width={120} height={120} />
          <div className="flex-1">
            <h2 className="text-lg font-medium">{p.name}</h2>
            <p className="text-sm opacity-80">{p.code}</p>
            <p className="mt-2">Precio: {new Intl.NumberFormat("es-CO", { style: "currency", currency: p.currency || "COP" }).format(p.basePrice)}</p>
            <Link href={`/product/${p.code}`} className="inline-block mt-3 px-4 py-2 bg-black text-white rounded">
              Ver producto
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
