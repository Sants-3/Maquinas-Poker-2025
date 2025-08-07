'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function VerInventario() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/inventario', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        setInventario(data);
      } catch (error) {
        console.error('Error al obtener datos de máquinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 sm:p-10">

      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Regresar
        </button>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 text-center mb-10 tracking-wide drop-shadow-sm">
        Detalle de Inventario 📊
      </h1>

      {inventario.length === 0 ? (
        <div className="text-center text-gray-500 text-xl py-20">
          No hay ítems en el inventario para mostrar. 😔
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {inventario.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col gap-3
                         border border-gray-200 hover:shadow-xl hover:border-blue-500
                         transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                {item.nombre_repuesto}
              </h2>

              <p className="text-gray-700"><span className="font-semibold text-gray-600">ID Artículo:</span> {item.id}</p>
              <p className="text-gray-700"><span className="font-semibold text-gray-600">Cantidad:</span> {item.cantidad}</p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-600">Ubicación:</span>{' '}
                {item.ubicacion.nombre || 'Cargando...'}
              </p>
              <p className="text-gray-700"><span className="font-semibold text-gray-600">Stock Mínimo:</span> {item.stock}</p>

              <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-600">
                <p><span className="font-semibold">Última Entrada:</span> {new Date(item.ultima_entrada_fecha).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <p><span className="font-semibold">Última Salida:</span> {new Date(item.ultima_salida_fecha).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold text-gray-600">Notas:</span> {item.notas}
              </p>

              <div className="text-xs text-gray-500 mt-auto pt-3 border-t border-gray-200">
                <p><span className="font-semibold">Creado en:</span> {new Date(item.creado_en).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <p><span className="font-semibold">Actualizado en:</span> {new Date(item.actualizado_en).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}