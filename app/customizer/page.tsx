"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    ZakekeDesigner?: new () => {
      createIframe: (cfg: unknown, container?: HTMLElement | null) => void;
      removeIframe?: () => void;
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

  // Allow override from env if your Zakeke model code differs from the ecommerce product code
  // Set NEXT_PUBLIC_ZAKEKE_PRODUCT_ID in your environment if needed.
  const zakekeProductId =
    process.env.NEXT_PUBLIC_ZAKEKE_PRODUCT_ID && process.env.NEXT_PUBLIC_ZAKEKE_PRODUCT_ID !== ""
      ? process.env.NEXT_PUBLIC_ZAKEKE_PRODUCT_ID
      : productId;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configBase = useMemo(
    () => ({
      productId: zakekeProductId,
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
    [zakekeProductId]
  );

  useEffect(() => {
    let destroyed = false;
    async function init() {
      const requestId = Math.random().toString(36).slice(2, 10);
      try {
        console.log(
          `[CUSTOMIZER][${requestId}] init`,
          JSON.stringify({
            urlParamProductId: productId,
            effectiveProductId: configBase.productId,
            quantity,
            hasDesignId: Boolean(designId),
          })
        );

        console.log(
          `[CUSTOMIZER][${requestId}] requesting token`,
          JSON.stringify({ accessType: "C2S" })
        );
        const tokenRes = await fetch(`/api/zakeke/token`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ accessType: "C2S" }),
        });
        if (!tokenRes.ok) {
          const text = await tokenRes.text().catch(() => "");
          console.error(
            `[CUSTOMIZER][${requestId}] token error`,
            JSON.stringify({ status: tokenRes.status, body: text.slice(0, 800) })
          );
          throw new Error(`Token error: ${tokenRes.status}`);
        }
        const token: { access_token: string } = await tokenRes.json();
        console.log(
          `[CUSTOMIZER][${requestId}] token ok`,
          JSON.stringify({ hasToken: Boolean(token?.access_token) })
        );

        if (!window.ZakekeDesigner) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://portal.zakeke.com/scripts/integration/apiV2/customizer.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
              console.error(`[CUSTOMIZER][${requestId}] failed to load customizer.js`);
              reject(new Error("Failed to load Zakeke script"));
            };
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

          // No variants in this sample
          selectedAttributes: {},
          getProductAttribute: async () => {
            return {
              attributes: [],
              variants: [],
            };
          },

          // Must return final unit price (product + design)
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
            } catch (err) {
              console.error("[CUSTOMIZER] getProductPrice failed", err);
              return { price: 0, isOutOfStock: false };
            }
          },

          // Minimal for compatibility (price already computed in getProductPrice)
          getProductInfo: async () => {
            return { price: 0, isOutOfStock: false };
          },

          // Cart actions
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
              console.error("[CUSTOMIZER] addToCart failed", res.status);
              alert("Could not add to cart");
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
              console.error("[CUSTOMIZER] editAddToCart failed", res.status);
              alert("Could not update cart");
              return;
            }
            router.push("/cart");
          },

          // Client previews
          isClientPreviews: true,
          imagePreviewHeight: 400,
          imagePreviewWidth: 400,
          hideVariants: true,
        };

        console.log(
          `[CUSTOMIZER][${requestId}] creating iframe`,
          JSON.stringify({
            productId: cfg.productId,
            quantity: cfg.quantity,
            hasDesignId: Boolean(cfg.designId),
            isClientPreviews: cfg.isClientPreviews,
            imagePreview: { w: cfg.imagePreviewWidth, h: cfg.imagePreviewHeight },
          })
        );

        designer.createIframe(cfg, containerRef.current);
        setLoading(false);
      } catch (e: unknown) {
        console.error(e);
        const msg =
          e instanceof Error ? e.message : "Error initializing customizer";
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
      <div className="text-xl font-semibold mb-4">Customizer</div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div
        id="zakeke-container"
        ref={containerRef}
        style={{
          border: "1px solid #ddd",
        }}
      />
    </div>
  );
}

export default function CustomizerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div>Loading...</div>
        </div>
      }
    >
      <CustomizerContent />
    </Suspense>
  );
}
