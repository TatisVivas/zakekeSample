'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

type CartItemType = {
  id: string;
  sku: string;
  quantity: number;
  designId?: string;
  product?: {
    code: string;
    name: string;
    image_url?: string;
    base_price: number;
    currency: string;
  } | null;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Actualizar el estado local removiendo el item
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
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
          />
        ))}
      </div>
    </main>
  );
}

function CartItemSimple({ item, onRemove }: { item: CartItemType; onRemove: (id: string) => void }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error al eliminar el item del carrito");
    } finally {
      setIsRemoving(false);
    }
  };

  const product = item.product;
  const basePrice = product?.base_price || 0;
  const total = basePrice * (item.quantity || 1);

  return (
    <div className="border rounded p-4 flex gap-4 items-center">
      {product?.image_url ? (
        <img
          src={product.image_url}
          alt={product.name || item.sku}
          className="w-[120px] h-[120px] object-cover rounded"
        />
      ) : (
        <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center rounded">
          Sin imagen
        </div>
      )}
      <div className="flex-1">
        <h2 className="text-lg font-medium">{product?.name || item.sku}</h2>
        <p className="text-sm opacity-80">Cantidad: {item.quantity}</p>
        <p className="text-sm">
          Precio base: {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: product?.currency || "COP",
          }).format(basePrice)}
        </p>
        <p className="text-sm">Diseño (unit.): $ 0,00</p>
        <p className="font-semibold mt-1">
          Total: {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: product?.currency || "COP",
          }).format(total)}
        </p>
        <div className="mt-2 flex gap-2">
          <Link
            href={`/customizer?productid=${encodeURIComponent(item.sku)}&quantity=${item.quantity || 1}${
              item.designId ? `&designid=${encodeURIComponent(item.designId)}` : ""
            }&from=cart`}
            className="px-3 py-2 bg-black text-white rounded"
          >
            Editar diseño
          </Link>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-3 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            {isRemoving ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
