'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [printFiles, setPrintFiles] = useState<{[key: string]: string}>({});
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchPrintFiles();
    }
  }, [orderId]);

  const fetchPrintFiles = async () => {
    setLoadingFiles(true);
    try {
      // In a real implementation, you'd fetch the order details from your database
      // and then get print files for each designId in the order
      // For now, we'll just show the concept
      console.log('Order completed:', orderId);
    } catch (error) {
      console.error('Error fetching print files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

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
            <p><strong>Número de pedido:</strong> {orderId}</p>
            <p><strong>Estado:</strong> <span className="text-green-600 font-medium">Confirmado</span></p>
            <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Archivos de impresión</h3>
          <p className="text-blue-700 mb-4">
            Los archivos de impresión para tus productos personalizados estarán disponibles
            en breve en la sección "Pedidos" del panel de administración de Zakeke.
          </p>
          <div className="text-sm text-blue-600">
            <p>• PDF con diseños vectoriales</p>
            <p>• Archivos ZIP con todos los recursos necesarios</p>
            <p>• Archivos listos para impresión profesional</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">¿Qué sucede ahora?</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>1. <strong>Procesamiento:</strong> Tu pedido está siendo procesado por nuestro sistema.</p>
            <p>2. <strong>Generación de archivos:</strong> Zakeke está generando los archivos de impresión para tus diseños personalizados.</p>
            <p>3. <strong>Producción:</strong> Una vez listos los archivos, comenzaremos con la producción.</p>
            <p>4. <strong>Envío:</strong> Te notificaremos cuando tu pedido esté listo para envío.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/mainpage"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700"
          >
            Seguir comprando
          </Link>
          <Link
            href="/orders"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
