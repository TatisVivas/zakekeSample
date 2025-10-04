'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Order = {
  id: string;
  code: string;
  orderNumber: string;
  items: Array<{
    code: string;
    productSku: string;
    productName: string;
    thumbnail: string;
    quantity: number;
    designId?: string;
    printFilesStatus?: string;
    printingFilesZip?: string;
  }>;
  orderDate: string;
  total?: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Error al cargar pedidos');
      }
    } catch (err) {
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const downloadPrintFiles = async (designId: string, orderCode: string) => {
    try {
      const response = await fetch(`/api/zakeke/print-files/${designId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          const link = document.createElement('a');
          link.href = data.url;
          link.download = `print-files-${orderCode}-${designId}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Archivos de impresión no disponibles aún');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al obtener archivos de impresión');
      }
    } catch (error) {
      console.error('Error downloading print files:', error);
      alert('Error al descargar archivos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
          <Link
            href="/mainpage"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Seguir comprando
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!orders.length && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos aún</h3>
            <p className="text-gray-500 mb-6">Cuando realices tu primer pedido, aparecerá aquí.</p>
            <Link
              href="/mainpage"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Explorar productos
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Pedido #{order.code}</h3>
                  <p className="text-sm text-gray-600">
                    Fecha: {new Date(order.orderDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Completado
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={item.thumbnail || '/products/small.png'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/products/small.png';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-gray-600">
                        SKU: {item.productSku} | Cantidad: {item.quantity}
                      </p>
                      {item.designId && (
                        <p className="text-sm text-green-600">Producto personalizado</p>
                      )}
                    </div>
                    {item.designId && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => downloadPrintFiles(item.designId!, order.code)}
                          className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          Descargar ZIP (PDFs e imágenes)
                        </button>
                        <span className="text-xs text-gray-500 text-center">
                          {item.printFilesStatus === 'ready' ? 'Listo' : 'Procesando...'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div>
                  {order.total && (
                    <p className="font-semibold">
                      Total: {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                      }).format(order.total)}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
