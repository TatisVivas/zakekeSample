'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

// Add status to track the fetching state of design info
type DesignInfoStatus = 'idle' | 'loading' | 'success' | 'error';

type CartItemType = {
  id: string;
  sku: string;
  quantity: number;
  design_id?: string;
  designInfo?: {
    tempPreviewImageUrl?: string;
    designUnitPrice?: number;
    designUnitPercentagePrice?: number;
    name?: string;
  } | null;
  designInfoStatus: DesignInfoStatus;
  product?: {
    code: string;
    name: string;
    image_url?: string;
    base_price: number;
    currency: string;
  } | null;
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const pollDesignInfo = useCallback(async (itemId: string, designId: string, quantity: number, attempt = 1) => {
    console.log(`[POLL_DESIGN][${designId}] Attempt ${attempt}/${MAX_RETRIES}`);
    try {
      const designResponse = await fetch(`/api/zakeke/designs/${designId}?quantity=${quantity}`);

      if (designResponse.ok) { // Status 200
        const designData = await designResponse.json();
        console.log(`[POLL_DESIGN][${designId}] Success!`, designData);
        setCartItems(prevItems => prevItems.map(item =>
          item.id === itemId
            ? {
                ...item,
                designInfoStatus: 'success',
                designInfo: {
                  tempPreviewImageUrl: designData.tempPreviewImageUrl,
                  designUnitPrice: designData.designUnitPrice || 0,
                  designUnitPercentagePrice: designData.designUnitPercentagePrice || 0,
                  name: designData.name,
                }
              }
            : item
        ));
      } else if (designResponse.status === 202) { // "Processing" status from our API
        if (attempt < MAX_RETRIES) {
          console.log(`[POLL_DESIGN][${designId}] Still processing, retrying in ${RETRY_DELAY_MS}ms`);
          setTimeout(() => pollDesignInfo(itemId, designId, quantity, attempt + 1), RETRY_DELAY_MS);
        } else {
          throw new Error(`Failed to fetch design info for ${designId} after ${MAX_RETRIES} attempts.`);
        }
      } else {
        throw new Error(`Unexpected status code: ${designResponse.status}`);
      }
    } catch (error) {
      console.error(`[POLL_DESIGN][${designId}] Failed permanently:`, error);
      setCartItems(prevItems => prevItems.map(item =>
        item.id === itemId ? { ...item, designInfoStatus: 'error' } : item
      ));
    }
  }, []);

  useEffect(() => {
    const fetchInitialCart = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const items = await response.json();
          const initialItems = items.map((item: any) => ({
            ...item,
            designInfoStatus: item.design_id ? 'loading' : 'idle',
          }));
          setCartItems(initialItems);

          // Trigger polling for items that need it
          initialItems.forEach((item: CartItemType) => {
            if (item.design_id && item.designInfoStatus === 'loading') {
              pollDesignInfo(item.id, item.design_id, item.quantity);
            }
          });
        }
      } catch (error) {
        console.error(`[CART_PAGE] Error fetching initial cart:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialCart();
  }, [pollDesignInfo]);

  const handleRemoveItem = async (id: string) => {
    const requestId = crypto.randomUUID();
    console.log(`[CART_PAGE][${requestId}] Removing item ${id}`);
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        console.log(`[CART_PAGE][${requestId}] Item ${id} removed`);
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error(`[CART_PAGE][${requestId}] Error removing item:`, error);
      alert("Error al eliminar el item del carrito");
    }
  };

  if (loading) {
    return (
      <main className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Carrito</h1>
        <p>Cargando...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Carrito</h1>
      {!cartItems.length && <p>Tu carrito está vacío.</p>}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <CartItemSimple
            key={item.id}
            item={item}
            onRemove={handleRemoveItem}
            onRetry={() => item.design_id && pollDesignInfo(item.id, item.design_id, item.quantity)}
          />
        ))}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Link
            href="/checkout"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Proceder al checkout
          </Link>
        </div>
      )}
    </main>
  );
}

function CartItemSimple({ item, onRemove, onRetry }: { item: CartItemType; onRemove: (id: string) => void, onRetry: () => void }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(item.id);
    // No need for finally block as the component will be unmounted
  };

  const product = item.product;
  const designInfo = item.designInfo;
  const basePrice = product?.base_price || 0;
  const designUnitPrice = designInfo?.designUnitPrice || 0;
  const designPercentagePrice = designInfo?.designUnitPercentagePrice || 0;

  const finalUnitPrice = basePrice + designUnitPrice + (basePrice * designPercentagePrice / 100);
  const total = finalUnitPrice * (item.quantity || 1);

  const renderImage = () => {
    switch(item.designInfoStatus){
      case 'loading':
        return (
          <div className="w-[120px] h-[120px] bg-gray-100 flex flex-col items-center justify-center rounded text-center text-xs p-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mb-2"></div>
            Generando previsualización...
          </div>
        );
      case 'error':
        return (
          <div className="w-[120px] h-[120px] bg-red-50 border border-red-200 flex flex-col items-center justify-center rounded text-center text-xs p-2">
            <p className="text-red-700">Error al cargar la imagen.</p>
            <button onClick={onRetry} className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs">Reintentar</button>
          </div>
        );
      case 'success':
        return (
          <img
            src={designInfo?.tempPreviewImageUrl || product?.image_url}
            alt={designInfo?.name || product?.name || item.sku}
            className="w-[120px] h-[120px] object-cover rounded"
          />
        );
      default: // idle or fallback
        return (
          product?.image_url ?
          <img src={product.image_url} alt={product.name} className="w-[120px] h-[120px] object-cover rounded" /> :
          <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center rounded">
            Sin imagen
          </div>
        );
    }
  }

  return (
    <div className="border rounded p-4 flex gap-4 items-center">
      {renderImage()}
      <div className="flex-1">
        <h2 className="text-lg font-medium">{product?.name || item.sku}</h2>
        {designInfo?.name && (
          <p className="text-sm text-gray-600">Diseño: {designInfo.name}</p>
        )}
        <p className="text-sm opacity-80">Cantidad: {item.quantity}</p>
        <p className="text-sm">
          Precio base: {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: product?.currency || "COP",
          }).format(basePrice)}
        </p>
        {item.designInfoStatus === 'success' && designInfo && (designUnitPrice > 0 || designPercentagePrice > 0) && (
          <p className="text-sm">
            Costo diseño (unit.): {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: product?.currency || "COP",
            }).format(designUnitPrice + (basePrice * designPercentagePrice / 100))}
          </p>
        )}
        <p className="font-semibold mt-1">
          Total: {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: product?.currency || "COP",
          }).format(total)}
        </p>
        <div className="mt-2 flex gap-2">
          {item.design_id && (
            <Link
              href={`/customizer?productid=${encodeURIComponent(item.sku)}&quantity=${item.quantity || 1}&designid=${encodeURIComponent(item.design_id)}&from=cart`}
              className="px-3 py-2 bg-black text-white rounded text-sm"
            >
              Editar diseño
            </Link>
          )}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-3 py-2 bg-red-500 text-white rounded disabled:opacity-50 text-sm"
          >
            {isRemoving ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}