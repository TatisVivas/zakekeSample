import Link from "next/link";
import Image from "next/image";
import { getCartItems, getProductByCode } from "@/lib/db";
import { getClientToken, getDesignInfo } from "@/lib/zakeke";

type DesignInfo = {
  designUnitPrice?: number;
  designUnitPercentagePrice?: number;
  tempPreviewImageUrl?: string | null;
  previewFiles?: { url?: string | null }[];
} | null;

async function getDesign(designId: string): Promise<DesignInfo> {
  try {
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const info = await getDesignInfo(designId, access_token);
    return info as DesignInfo;
  } catch {
    return null;
  }
}

export default async function CartPage() {
  const items = getCartItems();
  const data = await Promise.all(
    items.map(async (it) => {
      const product = getProductByCode(it.sku);
      const design = it.designId ? await getDesign(it.designId) : null;
      const basePrice = Number(product?.basePrice || 0);
      const designUnitPrice = Number(design?.designUnitPrice || 0);
      const designUnitPercentagePrice = Number(design?.designUnitPercentagePrice || 0);
      const finalUnitPrice =
        basePrice + designUnitPrice + (basePrice * designUnitPercentagePrice) / 100;
      const total = finalUnitPrice * (it.quantity || 1);
      const preview =
        design?.tempPreviewImageUrl || design?.previewFiles?.[0]?.url || null;
      return {
        it,
        product,
        design,
        total,
        preview,
        basePrice,
        designUnitPrice,
        designUnitPercentagePrice,
        finalUnitPrice,
      };
    })
  );

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Carrito</h1>
      {!data.length && <p>Tu carrito está vacío.</p>}
      <div className="space-y-4">
        {data.map(
          ({
            it,
            product,
            preview,
            total,
            basePrice,
            designUnitPrice,
            designUnitPercentagePrice,
          }) => (
            <div key={it.id} className="border rounded p-4 flex gap-4 items-center">
              {preview ? (
                <Image src={preview} alt="Preview" width={120} height={120} unoptimized />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center">
                  Sin preview
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-medium">{product?.name || it.sku}</h2>
                <p className="text-sm opacity-80">Cantidad: {it.quantity}</p>
                <p className="text-sm">
                  Precio base:{" "}
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: product?.currency || "COP",
                  }).format(basePrice)}
                </p>
                <p className="text-sm">
                  Diseño (unit.):{" "}
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: product?.currency || "COP",
                  }).format(designUnitPrice)}
                  {designUnitPercentagePrice ? ` + ${designUnitPercentagePrice}%` : ""}
                </p>
                <p className="font-semibold mt-1">
                  Total:{" "}
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: product?.currency || "COP",
                  }).format(total)}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/customizer?productid=${encodeURIComponent(
                      it.sku
                    )}&quantity=${it.quantity || 1}${
                      it.designId ? `&designid=${encodeURIComponent(it.designId)}` : ""
                    }`}
                    className="px-3 py-2 bg-black text-white rounded"
                  >
                    Editar diseño
                  </Link>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
