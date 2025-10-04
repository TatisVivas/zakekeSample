'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartItem = {
  id: string;
  sku: string;
  quantity: number;
  design_id?: string;
  product?: {
    base_price: number;
    name: string;
    currency: string;
  };
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    const requestId = crypto.randomUUID();
    console.log(`[CHECKOUT][${requestId}] Fetching cart items`);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const items = await response.json();
        console.log(`[CHECKOUT][${requestId}] Fetched ${items.length} items`);
        setCartItems(items);
      } else {
        setError('Error al cargar el carrito');
      }
    } catch (err) {
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    const requestId = crypto.randomUUID();
    console.log(`[CHECKOUT][${requestId}] Starting checkout process with ${cartItems.length} items`);

    if (cartItems.length === 0) {
      console.log(`[CHECKOUT][${requestId}] No items, aborting`);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const itemsWithDesigns = cartItems.filter(item => item.design_id);
      console.log(`[CHECKOUT][${requestId}] Items with designs: ${itemsWithDesigns.length}`);

      if (itemsWithDesigns.length === 0) {
        console.log(`[CHECKOUT][${requestId}] No customized items`);
        setError('No tienes productos personalizados en el carrito');
        setProcessing(false);
        return;
      }

      const orderCode = `ORDER-${Date.now()}`;
      const total = cartItems.reduce((sum, item) => sum + (item.product?.base_price || 0) * item.quantity, 0);

      const orderPayload = {
        orderCode,
        orderDate: new Date().toISOString(),
        sessionID: 'session-' + Date.now(),
        total,
        details: itemsWithDesigns.map(item => ({
          orderDetailCode: item.id,
          sku: item.sku,
          designID: item.design_id,
          modelUnitPrice: item.product?.base_price || 0,
          designUnitPrice: 0,
          quantity: item.quantity,
          designModificationID: undefined
        })),
        compositionDetails: []
      };

      console.log(`[CHECKOUT][${requestId}] Order payload:`, JSON.stringify(orderPayload, null, 2));

      const registerResponse = await fetch('/api/zakeke/register-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      console.log(`[CHECKOUT][${requestId}] Zakeke response status: ${registerResponse.status}`);

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Unknown error';
        throw new Error(`Zakeke error: ${errorMsg}`);
      }

      const registerResult = await registerResponse.json();
      console.log(`[CHECKOUT][${requestId}] Zakeke registration success:`, JSON.stringify(registerResult, null, 2));

      const saveOrderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code: orderCode,
          items: cartItems.map(item => ({
            code: item.id,
            productSku: item.sku,
            productName: item.product?.name || 'Unknown',
            thumbnail: '', // Add if available
            quantity: item.quantity,
            designId: item.design_id
          })),
          total,
          orderDate: new Date().toISOString()
        })
      });

      if (!saveOrderResponse.ok) {
        const errorData = await saveOrderResponse.json();
        throw new Error(errorData.error || 'Failed to save order');
      }

      console.log(`[CHECKOUT][${requestId}] Order saved to Supabase`);

      const clearResponse = await fetch('/api/cart/clear', { method: 'POST' });
      console.log(`[CHECKOUT][${requestId}] Cart clear status: ${clearResponse.status}`);

      console.log(`[CHECKOUT][${requestId}] Redirecting to success`);
      router.push(`/checkout/success?order=${orderCode}`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[CHECKOUT][${requestId}] Error: ${msg}`);
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <Link href="/mainpage" className="px-4 py-2 bg-blue-600 text-white rounded">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const hasCustomizedItems = cartItems.some(item => item.design_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.product?.name || item.sku}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                    {item.design_id && <span className="ml-2 text-green-600">(Personalizado)</span>}
                  </p>
                </div>
                <p className="font-semibold">$ {(item.quantity * (item.product?.base_price || 50000)).toLocaleString('es-CO')}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>$ {cartItems.reduce((total, item) => total + (item.quantity * (item.product?.base_price || 50000)), 0).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {!hasCustomizedItems && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Nota:</strong> No tienes productos personalizados en tu carrito.
              Los productos sin personalización no generarán archivos de impresión.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/cart"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
          >
            Volver al carrito
          </Link>
          <button
            onClick={handleCheckout}
            disabled={processing}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}