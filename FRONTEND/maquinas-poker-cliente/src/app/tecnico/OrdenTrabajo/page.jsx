'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdenesTecnico() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pendiente');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (sessionStatus === 'authenticated' && session.user.role === 'tecnico') {
      fetchOrders();
    }
  }, [sessionStatus, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/tecnico/ordenes?status=${filter}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar órdenes');
      }

      // Asegúrate de acceder a result.data que contiene el array
      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading') {
    return <div className="p-4">Cargando...</div>;
  }

  if (session?.user.role !== 'tecnico') {
    return <div className="p-4">No tienes permisos para ver esta página</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mis Órdenes de Trabajo</h1>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['Pendiente', 'Asignada', 'En progreso', 'Completada'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status 
                ? status === 'Pendiente' ? 'bg-yellow-500 text-white' :
                  status === 'Asignada' ? 'bg-blue-500 text-white' :
                  status === 'En progreso' ? 'bg-green-500 text-white' :
                  'bg-purple-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Listado de órdenes */}
      {loading ? (
        <div className="text-center py-8">
          <p>Cargando órdenes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded">
          <p>No hay órdenes {filter.toLowerCase()} en este momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/tecnico/ordenTrabajo/${order.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{order.title}</h3>
                  <p className="text-gray-600">{order.machine_name} - {order.machine_location}</p>
                  <p className="mt-2 text-sm">{order.description?.substring(0, 100)}...</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.priority === 'Urgente' ? 'bg-red-100 text-red-800' :
                  order.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.priority}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : 'Sin fecha'}
                </span>
                <Link 
                  href={`/tecnico/ordenTrabajo/${order.id}`}
                  className="text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()} // Evita que se active el onClick del div padre
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}