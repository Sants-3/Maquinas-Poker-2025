'use client';

import { useEffect, useState } from 'react';

export default function ubicacionNombre({ item }) {
  const [ubicacionNombre, setUbicacionNombre] = useState('');

  useEffect(() => {
    const obtenerUbicacion = async () => {
      try {
        const response = await fetch(`http://backend:4000/api/ubicaciones?id=${item.ubicacion_id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        setUbicacionNombre(data.nombre);
      } catch (error) {
        console.error('Error al obtener datos de máquinas:', error);
      }
    };

    obtenerUbicacion();
  }, [item.ubicacion_id]);

  return (
    <p className="text-gray-700">
      <span className="font-semibold text-gray-600">Ubicación:</span>{' '}
      {ubicacionNombre || 'Cargando...'}
    </p>
  );
}
