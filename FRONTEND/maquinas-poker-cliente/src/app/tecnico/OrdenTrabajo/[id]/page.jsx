'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DetalleOrden() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tecnico/ordenes/${id}`);
        
        if (!response.ok) {
          throw new Error('Orden no encontrada');
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar orden:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="p-4">Cargando detalles de la orden...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => router.push('/tecnico/ordenTrabajo')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <p>No se encontró la orden solicitada</p>
        <button 
          onClick={() => router.push('/tecnico/ordenTrabajo')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orden #{order.id}</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{order.title}</h2>
        <p className="text-gray-600">{order.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Detalles de la Máquina</h3>
          <p><strong>Nombre:</strong> {order.machine_name}</p>
          <p><strong>Modelo:</strong> {order.machine_model}</p>
          <p><strong>Ubicación:</strong> {order.machine_location}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Estado</h3>
          <p><strong>Prioridad:</strong> 
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              order.priority === 'Urgente' ? 'bg-red-100 text-red-800' :
              order.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.priority}
            </span>
          </p>
          <p><strong>Estado:</strong> 
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'En progreso' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {order.status}
            </span>
          </p>
          <p><strong>Fecha programada:</strong> {new Date(order.scheduled_date).toLocaleString()}</p>
        </div>
      </div>
      
      <button 
        onClick={() => router.push('/tecnico/ordenTrabajo')}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Volver al listado
      </button>
    </div>
  );
}