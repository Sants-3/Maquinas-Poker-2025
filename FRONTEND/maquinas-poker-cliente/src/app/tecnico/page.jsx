'use client';

import { useEffect, useState } from 'react';

export default function DashboardTecnico() {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);
  const [pausadas, setPausadas] = useState([]);

  // Datos de ejemplo simulados para las órdenes de trabajo
  // NOTA: En un entorno real, estos datos vendrían de una API o un contexto.
  useEffect(() => {
    try {
      setError(null);
      const datosEjemplo = [
        {
          codigo: 'ORD001',
          maquina: 'Máquina A1-Poker',
          tipo: 'Mantenimiento Preventivo',
          prioridad: 'alta',
          descripcion: 'Revisión general de componentes internos y limpieza.',
          estado: 'pendiente',
          fecha_creacion: '2025-07-15T10:00:00Z',
          comentario: '',
          comentario_temp: '',
        },
        {
          codigo: 'ORD002',
          maquina: 'Máquina B3-Slots',
          tipo: 'Reparación de Hardware',
          prioridad: 'urgente',
          descripcion: 'Falla en el lector de billetes. Sustitución de pieza.',
          estado: 'en_proceso',
          fecha_creacion: '2025-07-16T11:30:00Z',
          fecha_inicio: '2025-07-16T12:00:00Z',
          comentario: 'Esperando pieza de repuesto.',
          comentario_temp: 'Esperando pieza de repuesto.',
        },
        {
          codigo: 'ORD003',
          maquina: 'Máquina C5-Roulette',
          tipo: 'Actualización de Software',
          prioridad: 'media',
          descripcion: 'Instalación de nueva versión del sistema operativo.',
          estado: 'finalizada',
          fecha_creacion: '2025-07-14T09:00:00Z',
          fecha_inicio: '2025-07-14T10:00:00Z',
          fecha_finalizacion: '2025-07-14T11:00:00Z',
          comentario: 'Actualización completada con éxito. Cliente notificado.',
          tiempo_real: 60,
          cliente_notificado: true,
          firma_cliente: 'Juan Perez',
          calificacion_servicio: 5,
          comentarios_cliente: 'Excelente servicio, muy rápido.',
          comentario_temp: '',
        },
        {
          codigo: 'ORD004',
          maquina: 'Máquina D2-Blackjack',
          tipo: 'Mantenimiento Correctivo',
          prioridad: 'alta',
          descripcion: 'Pantalla táctil no responde. Posible reemplazo.',
          estado: 'pendiente',
          fecha_creacion: '2025-07-17T14:00:00Z',
          comentario: '',
          comentario_temp: '',
        },
        {
          codigo: 'ORD005',
          maquina: 'Máquina E7-Poker',
          tipo: 'Instalación de Periférico',
          prioridad: 'baja',
          descripcion: 'Instalación de impresora de tickets externa.',
          estado: 'en_proceso',
          fecha_creacion: '2025-07-17T10:00:00Z',
          fecha_inicio: '2025-07-17T10:30:00Z',
          comentario: '',
          comentario_temp: '',
        },
        {
          codigo: 'ORD006',
          maquina: 'Máquina F9-Slots',
          tipo: 'Revisión de Seguridad',
          prioridad: 'media',
          descripcion: 'Verificación de sistemas de seguridad y alarmas.',
          estado: 'finalizada',
          fecha_creacion: '2025-07-13T16:00:00Z',
          fecha_inicio: '2025-07-13T16:30:00Z',
          fecha_finalizacion: '2025-07-13T17:15:00Z',
          comentario: 'Sistema verificado y funcionando correctamente.',
          tiempo_real: 45,
          cliente_notificado: true,
          firma_cliente: 'Maria Lopez',
          calificacion_servicio: 4,
          comentarios_cliente: 'Todo bien, un poco lento al iniciar.',
          comentario_temp: '',
        },
      ];
      setOrdenes(datosEjemplo);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      setError("Error al cargar las órdenes. Inténtalo de nuevo más tarde.");
    }
  }, []);

  const getPriorityColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'urgente': return 'text-red-600 font-bold'; // Añadido font-bold
      case 'alta': return 'text-yellow-600 font-bold';
      case 'media': return 'text-blue-600 font-bold';
      case 'baja': return 'text-green-600 font-bold';
      default: return 'text-gray-500';
    }
  };

  const getStatusClasses = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-blue-50 border-blue-300 text-blue-800'; // Fondo muy claro, borde azul medio, texto azul oscuro
      case 'en_proceso':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800'; // Fondo muy claro, borde amarillo medio, texto amarillo oscuro
      case 'finalizada':
        return 'bg-green-50 border-green-300 text-green-800'; // Fondo muy claro, borde verde medio, texto verde oscuro
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const actualizarEstadoOrden = (codigo, nuevoEstado) => {
    const actualizadas = ordenes.map((orden) =>
      orden.codigo === codigo
        ? {
            ...orden,
            estado: nuevoEstado,
            // Establecer fecha de inicio/finalización al cambiar de estado
            fecha_inicio: nuevoEstado === 'en_proceso' ? new Date().toISOString() : orden.fecha_inicio,
            fecha_finalizacion: nuevoEstado === 'finalizada' ? new Date().toISOString() : orden.fecha_finalizacion,
          }
        : orden
    );
    setOrdenes(actualizadas);
    setPausadas(pausadas.filter((p) => p !== codigo)); // Si se actualiza el estado, se despausa
  };

  const handleComentarioChange = (codigo, nuevoComentario) => {
    const actualizadas = ordenes.map((orden) =>
      orden.codigo === codigo ? { ...orden, comentario_temp: nuevoComentario } : orden
    );
    setOrdenes(actualizadas);
  };

  const guardarComentario = (codigo) => {
    const actualizadas = ordenes.map((orden) =>
      orden.codigo === codigo
        ? { ...orden, comentario: orden.comentario_temp || '', comentario_temp: '' }
        : orden
    );
    setOrdenes(actualizadas);
  };

  const togglePausa = (codigo) => {
    setPausadas(
      pausadas.includes(codigo)
        ? pausadas.filter((p) => p !== codigo)
        : [...pausadas, codigo]
    );
  };

  const renderBotones = (orden) => {
    if (orden.estado === 'pendiente') {
      return (
        <button
          onClick={() => actualizarEstadoOrden(orden.codigo, 'en_proceso')}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 shadow-md"
        >
          Despachar
        </button>
      );
    }

    if (orden.estado === 'en_proceso') {
      const isPaused = pausadas.includes(orden.codigo);
      return (
        <div className="flex flex-col gap-3 mt-4"> {/* Increased gap */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Comentario del técnico:
            </label>
            <textarea
              value={orden.comentario_temp || ''}
              onChange={(e) => handleComentarioChange(orden.codigo, e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-200"
              rows={3}
              placeholder="Escribe un comentario..."
            />
            <button
              onClick={() => guardarComentario(orden.codigo)}
              className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm transition duration-200"
            >
              Guardar Comentario
            </button>
          </div>

          <div className="flex gap-2"> {/* Gap between buttons */}
            <button
              onClick={() => actualizarEstadoOrden(orden.codigo, 'finalizada')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg transition duration-200 shadow-md"
            >
              Finalizar
            </button>
            <button
              onClick={() => togglePausa(orden.codigo)}
              className={`flex-1 text-white font-semibold px-3 py-2 rounded-lg transition duration-200 shadow-md ${
                isPaused
                  ? 'bg-red-500 hover:bg-red-600' // Paused state is red
                  : 'bg-yellow-500 hover:bg-yellow-600' // Pause button is yellow
              }`}
            >
              {isPaused ? 'Despausar' : 'Pausar'}
            </button>
          </div>

          {isPaused && (
            <div className="text-red-600 font-semibold text-sm mt-1 p-2 bg-red-50 rounded-md border border-red-200">
              Esta tarea está actualmente en pausa.
            </div>
          )}
        </div>
      );
    }

    // Para órdenes finalizadas, no hay botones de acción
    return null;
  };

  const renderOrdenes = (estado, titulo) => {
    const filtradas = ordenes.filter(o => o.estado === estado);
    const hasOrders = filtradas.length > 0;

    return (
      <div className="mb-12"> {/* Increased bottom margin for sections */}
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4 text-center"> {/* Larger heading, bottom border */}
          {titulo}
        </h2>
        {!hasOrders ? (
          <div className="bg-gray-50 text-gray-600 border border-gray-200 rounded-xl p-8 text-center text-lg italic shadow-sm">
            <p>🎉 ¡Todo tranquilo por aquí! No hay órdenes en esta categoría por ahora.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Increased gap */}
            {filtradas.map((orden) => {
              const isPaused = pausadas.includes(orden.codigo);
              const cardClasses = `
                rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col gap-3 border-2
                ${getStatusClasses(orden.estado)}
                ${isPaused ? 'border-dashed border-red-500 ring-2 ring-red-200' : ''} /* Borde punteado y anillo para pausadas */
                hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
              `;

              return (
                <div key={orden.codigo} className={cardClasses}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {orden.maquina}
                  </h3>
                  <div className="text-base text-gray-700 space-y-1"> {/* Adjusted text size and spacing */}
                    <p><span className="font-semibold text-gray-900">Código:</span> {orden.codigo}</p>
                    <p><span className="font-semibold text-gray-900">Tipo:</span> {orden.tipo}</p>
                    <p><span className="font-semibold text-gray-900">Prioridad:</span>{' '}
                      <span className={`${getPriorityColor(orden.prioridad)} uppercase`}>{orden.prioridad}</span> {/* Uppercase priority */}
                    </p>
                    <p className="text-gray-800 leading-snug"><span className="font-semibold text-gray-900">Descripción:</span> {orden.descripcion}</p>
                  </div>

                  {orden.comentario && (
                    <div className="bg-gray-100 p-3 rounded-md border border-gray-200 text-gray-700 text-sm italic">
                      <span className="font-semibold text-gray-800">Comentario Técnico:</span> {orden.comentario}
                    </div>
                  )}

                  {orden.tiempo_real && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">Tiempo real:</span> {orden.tiempo_real} min
                    </p>
                  )}

                  {orden.cliente_notificado && (
                    <p className="text-sm text-green-700 font-semibold flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Cliente notificado
                    </p>
                  )}

                  {orden.firma_cliente && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">Firma:</span> {orden.firma_cliente}
                    </p>
                  )}

                  {orden.calificacion_servicio && (
                    <p className="text-sm text-yellow-600 font-semibold flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.729c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path></svg> Calificación: {orden.calificacion_servicio}/5
                    </p>
                  )}

                  {orden.comentarios_cliente && (
                    <p className="text-sm italic text-gray-600 border-t border-gray-200 pt-3 mt-3">
                      <span className="font-semibold">Feedback Cliente:</span> {orden.comentarios_cliente}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mt-auto pt-3 border-t border-gray-200"> {/* Smaller text for dates, softer border */}
                    <p><span className="font-semibold">Creada:</span> {new Date(orden.fecha_creacion).toLocaleString()}</p> {/* Full date/time */}
                    {orden.fecha_inicio && <p><span className="font-semibold">Iniciada:</span> {new Date(orden.fecha_inicio).toLocaleString()}</p>}
                    {orden.fecha_finalizacion && <p><span className="font-semibold">Finalizada:</span> {new Date(orden.fecha_finalizacion).toLocaleString()}</p>}
                  </div>

                  {renderBotones(orden)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-red-50 text-red-700 text-xl font-semibold p-4 rounded-md shadow-md">
        <p className="flex items-center gap-2">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 sm:p-10">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 text-center mb-16 tracking-tight drop-shadow-sm"> {/* Larger, more impactful heading */}
        Panel de Órdenes Técnicas
      </h1>

      {renderOrdenes('pendiente', '🔴 Órdenes Pendientes')}
      {renderOrdenes('en_proceso', '🟡 Órdenes en Proceso')}
      {renderOrdenes('finalizada', '🟢 Órdenes Finalizadas')}
    </div>
  );
}