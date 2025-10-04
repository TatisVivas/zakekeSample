'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';

type OrderItem = {
  designId?: string;
  productName: string;
  quantity: number;
};

type Order = {
  code: string;
  items: OrderItem[];
  orderDate: string;
  total: number;
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [printFiles, setPrintFiles] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderCode) {
      fetchOrderDetails();
    }
  }, [orderCode]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?code=${orderCode}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data[0]); // Assuming single order fetch
        // Fetch print files for each design
        const files: {[key: string]: string} = {};
        for (const item of data[0].items) {
          if (item.designId) {
            const fileRes = await fetch(`/api/zakeke/print-files/${item.designId}`);
            if (fileRes.ok) {
              const fileData = await fileRes.json();
              files[item.designId] = fileData.url;
            }
          }
        }
        setPrintFiles(files);
      } else {
        setError('Error al cargar detalles del pedido');
      }
    } catch (err) {
      setError('Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  };

  const handleExportZip = async (designId: string, productName: string) => {
    try {
      const zip = new JSZip();
      
      // Add print files ZIP
      const printZipUrl = printFiles[designId];
      if (printZipUrl) {
        const printZipResponse = await fetch(printZipUrl);
        const printZipBlob = await printZipResponse.blob();
        zip.file('print-files.zip', printZipBlob);
      }

      // Add configurations JSON
      const config = {
        designId,
        productName,
        // Add more config from design info if needed
      };
      zip.file('configuration.json', JSON.stringify(config, null, 2));

      // Generate and download ZIP
      const content = await zip.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${designId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error exporting ZIP:', err);
      alert('Error al exportar ZIP');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div>Pedido no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">¡Pedido confirmado!</h1>
          <p className="text-gray-600">Tu pedido ha sido procesado exitosamente.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detalles del pedido</h2>
          <div className="space-y-2">
            <p><strong>Número de pedido:</strong> {order.code}</p>
            <p><strong>Fecha:</strong> {new Date(order.orderDate).toLocaleDateString('es-ES')}</p>
            <p><strong>Total:</strong> $ {order.total.toLocaleString('es-CO')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Archivos de impresión</h2>
          {Object.keys(printFiles).length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item, index) => (
                item.designId && printFiles[item.designId] && (
                  <div key={index} className="border p-4 rounded">
                    <p><strong>Producto:</strong> {item.productName} (x{item.quantity})</p>
                    <button
                      onClick={() => handleExportZip(item.designId!, item.productName)}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      Exportar ZIP (PDFs, imágenes, config)
                    </button>
                  </div>
                )
              ))}
            </div>
          ) : (
            <p>Archivos de impresión no disponibles aún. Intenta refrescar en unos minutos.</p>
          )}
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="flex gap-4">
          <Link href="/mainpage" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700">
            Seguir comprando
          </Link>
          <Link href="/orders" className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
