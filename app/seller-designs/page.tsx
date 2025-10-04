'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SellerDesignsPage() {
  const [designs, setDesigns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSellerDesigns();
  }, []);

  const fetchSellerDesigns = async () => {
    try {
      const response = await fetch('/api/seller-designs');
      if (response.ok) {
        const data = await response.json();
        setDesigns(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar diseños del seller');
      }
    } catch (err) {
      setError('Error al cargar diseños del seller');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando diseños del seller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Diseños del Seller</h1>
          <Link
            href="/mainpage"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al marketplace
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!designs && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron diseños</h3>
            <p className="text-gray-500 mb-6">No hay diseños disponibles para este seller.</p>
          </div>
        )}

        {designs && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Respuesta de la API de Zakeke</h2>
            <div className="bg-gray-50 rounded p-4 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(designs, null, 2)}
              </pre>
            </div>

            {Array.isArray(designs) && designs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Vista de Diseños ({designs.length} diseños)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designs.map((design: any, index: number) => (
                    <div key={design.id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="space-y-2">
                        {design.tempPreviewImageUrl && (
                          <img
                            src={design.tempPreviewImageUrl}
                            alt={design.name || `Diseño ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/small.png';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{design.name || `Diseño ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">ID: {design.id || design.designId}</p>
                          {design.designUnitPrice && (
                            <p className="text-sm text-green-600">
                              Precio: ${design.designUnitPrice}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
