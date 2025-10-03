'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartItem = {
  id: string;
  sku: string;
  quantity: number;
  designId?: string;
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
    if (cartItems.length === 0) return;

    setProcessing(true);
    setError('');

    try {
      // Get user session for customercode
      let customercode: string | undefined;
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          customercode = sessionData.user?.id;
        }
      } catch (err) {
        console.warn('Could not get user session:', err);
      }

      // Create order payload for Zakeke
      const orderCode = `ORDER-${Date.now()}`;
      const orderPayload = {
        orderCode,
        orderDate: new Date().toISOString(),
        sessionID: 'session-' + Date.now(),
        total: cartItems.reduce((sum, item) => sum + (item.product?.base_price || 0) * item.quantity, 0),
        details: cartItems
          .filter(item => item.designId)
          .map(item => ({
            orderDetailCode: item.id,
            sku: item.sku,
            designID: item.designId,
            modelUnitPrice: item.product?.base_price || 0,
            designUnitPrice: 0, // Will be calculated from design info
            quantity: item.quantity,
            designModificationID: undefined // Only needed for bulk orders
          }))
      };

      console.log('Registering order with Zakeke:', orderPayload);

      // Register order with Zakeke
      const registerResponse = await fetch('/api/zakeke/register-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!registerResponse.ok) {
        throw new Error('Error al registrar el pedido en Zakeke');
      }

      const registerResult = await registerResponse.json();
      console.log('Order registered successfully:', registerResult);

      // Clear cart
      await fetch('/api/cart/clear', { method: 'POST' });

      // Redirect to success page
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
                <p className="font-semibold">$ {(item.quantity * 50000).toLocaleString('es-CO')}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>$ {cartItems.reduce((total, item) => total + (item.quantity * 50000), 0).toLocaleString('es-CO')}</span>
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
