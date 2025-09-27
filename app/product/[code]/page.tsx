"use server";

import Link from "next/link";
import Image from "next/image";
import { getProductByCode } from "@/lib/db";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const product = getProductByCode(code);
  if (!product) {
    return <div className="p-8">Producto no encontrado.</div>;
  }
  const quantity = 1;
  const href = `/customizer?productid=${encodeURIComponent(product.code)}&quantity=${quantity}`;
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex gap-6">
        <Image
          src={product.imageUrl || "/totebag-sample.png"}
          alt={product.name}
          width={300}
          height={300}
        />

        <div>
          <div className="text-2xl font-semibold">{product.name}</div>

          <div className="opacity-80 mt-1">{product.code}</div>

          <div className="mt-2">
            Precio base:{" "}
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: product.currency || "COP",
            }).format(product.basePrice)}
          </div>

          <div className="mt-4 flex gap-2 items-center">
            <Link href={href} className="px-4 py-2 bg-black text-white rounded">
              Personalizar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
