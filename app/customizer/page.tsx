"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    ZakekeDesigner: any;
  }
}

export default function CustomizerPage() {
  const search = useSearchParams();
  const router = useRouter();
  const productId = search.get("productid") || "TOTEBAG-001"; // Adjust if needed
  const quantity = Number(search.get("quantity") || "1");
  const designId = search.get("designid") || undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configBase = useMemo(() => ({
    productId,
    productName: "Tote Bag Blanca", // Change if needed
    currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || process.env.DEFAULT_CURRENCY || "COP",
    culture: process.env.NEXT_PUBLIC_DEFAULT_CULTURE || process.env.DEFAULT_CULTURE || "es-ES",
  }), [productId]);

  useEffect(() => {
    let destroyed = false;
    async function init() {
      try {
        // Get OAuth token from server without exposing secret
        const tokenRes = await fetch(`/api/
          zakeke/token`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ accessType: "S2S" }),
        });
        if (!tokenRes.ok) throw new Error(`Token error: ${tokenRes.status}`);
        const token = await tokenRes.json();

        // Load script if not already loaded
        if (!(window as any).ZakekeDesigner) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://portal.zakeke.com/scripts/integration/apiV2/customizer.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Zakeke script"));
            document.head.appendChild(script);
          });
        }

        if (destroyed) return;
        const designer = new (window as any).ZakekeDesigner();
        const cfg = {
          tokenOauth: token.access_token,
          productId: configBase.productId,
          productName: configBase.productName,
          currency: configBase.currency,
          culture: configBase.culture,
          quantity: quantity,
          designId: designId,
          // Callbacks required
          getProductInfo: async () => {
            // Basic info for pricing/stock
            // If you need real-time price, fetch from your server
            return { price: 45000, isOutOfStock: false };
          },
          addToCart: async (payload: any) => {
            // payload may contain: designid, quantity, selectedattributes, etc.
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ sku: productId, quantity: payload?.quantity || quantity, designId: payload?.designid || payload?.designId }),
            });
            if (!res.ok) {
              alert("No se pudo agregar al carrito");
              return;
            }
            router.push("/cart");
          },
          editAddToCart: async (payload: any) => {
            // For simplicity, upsert by SKU
            const res = await fetch("/api/cart", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ sku: productId, quantity: payload?.quantity || quantity, designId: payload?.designid || payload?.designId }),
            });
            if (!res.ok) {
              alert("No se pudo actualizar el carrito");
              return;
            }
            router.push("/cart");
          },
        };

        designer.createIframe(cfg, containerRef.current);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Error inicializando el customizer");
        setLoading(false);
      }
    }
    init();
    return () => {
      destroyed = true;
    };
  }, [configBase, quantity, designId, productId, router]);

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">Personalizador</h1>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div id="zakeke-container" ref={containerRef} style={{ width: "100%", minHeight: 600, border: "1px solid #ddd" }} />
    </main>
  );
}


