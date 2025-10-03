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
  const from = search.get("from") || "products"; // 'products' or 'cart'

  // This will be set after validation
  const [zakekeModelCode, setZakekeModelCode] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configBase = useMemo(
    () => ({
      productId: zakekeModelCode || productId, // Use validated model code or fallback
      productName: "Producto Personalizable",
      currency:
        process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ||
        process.env.DEFAULT_CURRENCY ||
        "COP",
      culture:
        process.env.NEXT_PUBLIC_DEFAULT_CULTURE ||
        process.env.DEFAULT_CULTURE ||
        "es-ES",
    }),
    [zakekeModelCode, productId]
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
            quantity,
            hasDesignId: Boolean(designId),
          })
        );

        // First, validate the model code exists in Zakeke
        console.log(`[CUSTOMIZER][${requestId}] validating model code for product ${productId}`);
        const validationRes = await fetch("/api/zakeke/validate-model", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ productCode: productId }),
        });

        if (!validationRes.ok) {
          const errorData = await validationRes.json().catch(() => ({}));
          const errorMsg = errorData.error || `Validation failed: ${validationRes.status}`;
          console.error(`[CUSTOMIZER][${requestId}] validation failed:`, errorMsg);
          setValidationError(errorMsg);
          setLoading(false);
          return;
        }

        const validationData = await validationRes.json();
        console.log(`[CUSTOMIZER][${requestId}] validation success:`, validationData);
        setZakekeModelCode(validationData.modelCode);

        // Get user session for customercode
        let customercode: string | undefined;
        try {
          const sessionRes = await fetch('/api/auth/session');
          if (sessionRes.ok) {
            const session = await sessionRes.json();
            customercode = session.user?.id;
          }
        } catch (e) {
          console.warn(`[CUSTOMIZER][${requestId}] could not get session:`, e);
        }

        console.log(
          `[CUSTOMIZER][${requestId}] requesting token`,
          JSON.stringify({ accessType: "C2S", hasCustomer: Boolean(customercode) })
        );
        const tokenRes = await fetch(`/api/zakeke/token`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            accessType: "C2S",
            customercode
          }),
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

          onBackClicked: async (payload: unknown) => {
            console.log(`[CUSTOMIZER][${requestId}] back clicked`, payload);
            // Redirect based on origin
            if (from === "cart") {
              router.push("/cart");
            } else {
              router.push("/mainpage/category/camisetas");
            }
          },

          // Client previews
          isClientPreviews: true,
          imagePreviewHeight: 400,
          imagePreviewWidth: 400,
          // Container sizing
          containerHeight: 800,
          containerWidth: '100%',
          hideVariants: true,
        };

        console.log(
          `[CUSTOMIZER][${requestId}] creating iframe`,
          JSON.stringify({
            originalProductId: productId,
            zakekeModelCode: cfg.productId,
            quantity: cfg.quantity,
            hasDesignId: Boolean(cfg.designId),
            isClientPreviews: cfg.isClientPreviews,
            imagePreview: { w: cfg.imagePreviewWidth, h: cfg.imagePreviewHeight },
            sellerId: process.env.NEXT_PUBLIC_ZAKEKE_SELLER_ID || "288274",
            environment: process.env.NODE_ENV,
          })
        );

        designer.createIframe(cfg, containerRef.current);

        // Force iframe sizing after creation
        setTimeout(() => {
          const container = containerRef.current;
          if (container) {
            const iframe = container.querySelector('iframe');
            if (iframe) {
              iframe.style.width = '100%';
              iframe.style.height = '800px';
              iframe.style.minHeight = '600px';
            }
          }
        }, 1000);

        setLoading(false);
      } catch (e: unknown) {
        console.error(`[CUSTOMIZER][${requestId}] initialization failed:`, e);
        const msg =
          e instanceof Error ? e.message : "Error initializing customizer";
        setError(`Error al inicializar el customizador: ${msg}`);
        setLoading(false);
      }
    }
    init();
    return () => {
      destroyed = true;
    };
  }, [quantity, designId, productId, router]);

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Customizer</div>

      {loading && <div>Loading...</div>}
      {validationError && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <strong>Error de validación:</strong> {validationError}
          <div className="mt-2 text-sm">
            <p>El producto no se puede personalizar porque:</p>
            <ul className="list-disc list-inside mt-1">
              <li>El Model Code no existe en Zakeke</li>
              <li>El producto no está configurado para personalización</li>
              <li>Hay un problema de configuración</li>
            </ul>
            <p className="mt-2">
              <strong>Producto:</strong> {productId}
            </p>
          </div>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {!validationError && (
        <div
          id="zakeke-container"
          ref={containerRef}
          style={{
            border: "1px solid #ddd",
            maxWidth: "1200px",
            width: "100%",
            height: "800px",
            minHeight: "600px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <style jsx>{`
            #zakeke-container iframe {
              width: 100% !important;
              height: 100% !important;
              minHeight: 600px !important;
            }
          `}</style>
        </div>
      )}
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
