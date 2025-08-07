import { ReporteCliente } from '@/types/reportes';

interface Props {
  reportes: ReporteCliente[];
  onVerDetalles: (reporte: ReporteCliente) => void;
  onAsignarTecnico: (reporte: ReporteCliente) => void;
  onActualizarEstado: (id: number, datos: { estado?: string; observaciones_admin?: string }) => void;
  onEliminar: (id: number) => void;
}

export default function ReportesClienteTable({
  reportes,
  onVerDetalles,
  onAsignarTecnico,
  onActualizarEstado,
  onEliminar
}: Props) {
  const getEstadoBadge = (estado: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      procesado: 'bg-blue-100 text-blue-800',
      resuelto: 'bg-green-100 text-green-800'
    };
    
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getGravedadBadge = (gravedad: string) => {
    const styles = {
      'Baja': 'bg-green-100 text-green-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Alta': 'bg-orange-100 text-orange-800',
      'Crítica': 'bg-red-100 text-red-800'
    };
    
    return styles[gravedad as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (reportes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">No hay reportes disponibles</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Máquina
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gravedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Técnico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportes.map((reporte) => (
              <tr key={reporte.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{reporte.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reporte.cliente?.nombre || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reporte.cliente?.email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reporte.maquina?.codigo || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reporte.maquina?.modelo || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {reporte.descripcion}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGravedadBadge(reporte.gravedad)}`}>
                    {reporte.gravedad}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(reporte.estadoReporte)}`}>
                    {reporte.estadoReporte}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {reporte.tecnicoAsignado ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {reporte.tecnicoAsignado.nombre}
                      </div>
                      <div className="text-gray-500">
                        {reporte.tecnicoAsignado.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Sin asignar</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFecha(reporte.fechaReporte)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onVerDetalles(reporte)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    
                    {reporte.estadoReporte === 'pendiente' && (
                      <button
                        onClick={() => onAsignarTecnico(reporte)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Asignar técnico"
                      >
                        👨‍🔧
                      </button>
                    )}
                    
                    {reporte.estadoReporte === 'procesado' && (
                      <button
                        onClick={() => onActualizarEstado(reporte.id, { estado: 'resuelto' })}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Marcar como resuelto"
                      >
                        ✅
                      </button>
                    )}
                    
                    <button
                      onClick={() => onEliminar(reporte.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}