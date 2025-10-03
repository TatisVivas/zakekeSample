'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartItem = {
  id: string;
  sku: string;
  quantity: number;
  designId?: string;
  product?: {
    base_price: number;
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
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const items = await response.json();
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
    console.log('🛒 [CHECKOUT] Starting checkout process...');
    console.log('🛒 [CHECKOUT] Cart items:', cartItems.length);

    if (cartItems.length === 0) {
      console.log('🛒 [CHECKOUT] No items in cart, aborting');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      console.log('🛒 [CHECKOUT] Getting user session for customercode...');
      // Get user session for customercode
      let customercode: string | undefined;
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          customercode = sessionData.user?.id;
          console.log('🛒 [CHECKOUT] Customer code obtained:', customercode);
        } else {
          console.log('🛒 [CHECKOUT] Failed to get session, status:', sessionResponse.status);
        }
      } catch (err) {
        console.warn('🛒 [CHECKOUT] Could not get user session:', err);
      }

      // Filter items with designs
      const itemsWithDesigns = cartItems.filter(item => item.designId);
      console.log('🛒 [CHECKOUT] Items with designs:', itemsWithDesigns.length);

      if (itemsWithDesigns.length === 0) {
        console.log('🛒 [CHECKOUT] No items with designs found');
        setError('No tienes productos personalizados en el carrito');
        setProcessing(false);
        return;
      }

      // Create order payload for Zakeke
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
          designID: item.designId,
          modelUnitPrice: item.product?.base_price || 0,
          designUnitPrice: 0, // Will be calculated from design info
          quantity: item.quantity,
          designModificationID: undefined // Only needed for bulk orders
        }))
      };

      console.log('🛒 [CHECKOUT] Order payload:', JSON.stringify(orderPayload, null, 2));

      // Register order with Zakeke
      console.log('🛒 [CHECKOUT] Calling Zakeke API...');
      const registerResponse = await fetch('/api/zakeke/register-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      console.log('🛒 [CHECKOUT] Zakeke response status:', registerResponse.status);

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error('🛒 [CHECKOUT] Zakeke error response:', errorText);
        throw new Error(`Error al registrar el pedido en Zakeke: ${registerResponse.status}`);
      }

      const registerResult = await registerResponse.json();
      console.log('🛒 [CHECKOUT] Zakeke success response:', registerResult);

      // Save order to Supabase
      console.log('🛒 [CHECKOUT] Saving order to Supabase...');
      const saveOrderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code: orderCode,
          items: cartItems.map(item => ({
            sku: item.sku,
            quantity: item.quantity,
            designId: item.designId
          })),
          total,
          orderDate: new Date().toISOString()
        })
      });

      if (!saveOrderResponse.ok) {
        throw new Error('Failed to save order to database');
      }

      // Clear cart
      console.log('🛒 [CHECKOUT] Clearing cart...');
      const clearResponse = await fetch('/api/cart/clear', { method: 'POST' });
      console.log('🛒 [CHECKOUT] Cart clear response:', clearResponse.status);

      // Redirect to success page
      console.log('🛒 [CHECKOUT] Redirecting to success page...');
      router.push(`/checkout/success?order=${orderCode}`);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Error en el checkout');
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

  const hasCustomizedItems = cartItems.some(item => item.designId);

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
                  <p className="font-medium">{item.sku}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                    {item.designId && <span className="ml-2 text-green-600">(Personalizado)</span>}
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
