"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    ZakekeDesigner?: new () => {
      createIframe: (cfg: unknown, container?: HTMLElement | null) => void;
    };
  }
}

type ZakekeSelectedAttributes = Record<string, string>;
interface ZakekeGetProductPriceInput {
  productid?: string;
  productId?: string;
  selectedattributes?: ZakekeSelectedAttributes[];
  percentPrice?: number;
  price?: number;
  quantity?: number;
  additionaldata?: unknown;
}

function CustomizerContent() {
  const search = useSearchParams();
  const router = useRouter();
  const productId = search.get("productid") || "1001";
  const quantity = Number(search.get("quantity") || "1");
  const designId = search.get("designid") || undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configBase = useMemo(
    () => ({
      productId,
      productName: "Tote Bag Blanca",
      currency:
        process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ||
        process.env.DEFAULT_CURRENCY ||
        "COP",
      culture:
        process.env.NEXT_PUBLIC_DEFAULT_CULTURE ||
        process.env.DEFAULT_CULTURE ||
        "es-ES",
    }),
    [productId]
  );

  useEffect(() => {
    let destroyed = false;
    async function init() {
      try {
        // Token C2S vinculado al visitor automáticamente en el endpoint
        const tokenRes = await fetch(`/api/zakeke/token`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ accessType: "C2S" }),
        });
        if (!tokenRes.ok) throw new Error(`Token error: ${tokenRes.status}`);
        const token: { access_token: string } = await tokenRes.json();

        // Cargar script si no está presente
        if (!window.ZakekeDesigner) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://portal.zakeke.com/scripts/integration/apiV2/customizer.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error("Failed to load Zakeke script"));
            document.head.appendChild(script);
          });
        }

        if (destroyed) return;
        const designer = new (window as Window & typeof globalThis)
          .ZakekeDesigner!();

        const cfg = {
          tokenOauth: token.access_token,
          productId: configBase.productId,
          productName: configBase.productName,
          currency: configBase.currency,
          culture: configBase.culture,
          quantity,
          designId,

          // Sin variantes
          selectedAttributes: {},
          getProductAttribute: async () => {
            return {
              attributes: [],
              variants: [],
            };
          },

          // Debe devolver el precio unitario final (producto + diseño)
          getProductPrice: async (zakekeData: ZakekeGetProductPriceInput) => {
            try {
              const res = await fetch("/api/products", { cache: "no-store" });
              const items = (await res.json()) as Array<{
                code: string;
                basePrice: number;
              }>;
              const p = items.find(
                (it) => String(it.code) === String(configBase.productId)
              );
              const base = Number(p?.basePrice || 0);
              const designUnit = Number(zakekeData?.price || 0);
              const percent = Number(zakekeData?.percentPrice || 0);
              const finalUnit = base + designUnit + (base * percent) / 100;
              return { price: finalUnit, isOutOfStock: false };
            } catch {
              return { price: 0, isOutOfStock: false };
            }
          },

          // Mínimo requerido para compatibilidad (precio ya calculado en getProductPrice)
          getProductInfo: async () => {
            return { price: 0, isOutOfStock: false };
          },

          // Carrito
          addToCart: async (payload: {
            quantity?: number;
            designid?: string;
            designId?: string;
          }) => {
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                sku: productId,
                quantity: payload?.quantity || quantity,
                designId: payload?.designid || payload?.designId,
              }),
            });
            if (!res.ok) {
              alert("No se pudo agregar al carrito");
              return;
            }
            router.push("/cart");
          },
          editAddToCart: async (payload: {
            quantity?: number;
            designid?: string;
            designId?: string;
          }) => {
            const res = await fetch("/api/cart", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                sku: productId,
                quantity: payload?.quantity || quantity,
                designId: payload?.designid || payload?.designId,
              }),
            });
            if (!res.ok) {
              alert("No se pudo actualizar el carrito");
              return;
            }
            router.push("/cart");
          },

          // Previews generadas en cliente
          isClientPreviews: true,
          imagePreviewHeight: 220,
          imagePreviewWidth: 220,
          hideVariants: true,
        };

        designer.createIframe(cfg, containerRef.current);
        setLoading(false);
      } catch (e: unknown) {
        console.error(e);
        const msg =
          e instanceof Error ? e.message : "Error inicializando el customizer";
        setError(msg);
        setLoading(false);
      }
    }
    init();
    return () => {
      destroyed = true;
    };
  }, [configBase, quantity, designId, productId, router]);

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Personalizador</div>

      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div
        id="zakeke-container"
        ref={containerRef}
        style={{ width: "100%", minHeight: 600, border: "1px solid #ddd" }}
      />
    </div>
  );
}

export default function CustomizerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div>Cargando...</div>
        </div>
      }
    >
      <CustomizerContent />
    </Suspense>
  );
}
