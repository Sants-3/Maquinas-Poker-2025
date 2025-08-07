// types/reportes.ts
export interface ReporteCliente {
  id: number;
  descripcion: string;
  gravedad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estadoAnterior: string;
  estadoNuevo: string;
  estadoReporte: 'pendiente' | 'procesado' | 'resuelto';
  fechaReporte: string;
  fechaAsignacion?: string;
  notasAdmin?: string;
  maquinaId: number;
  clienteId: number;
  tecnicoAsignadoId?: number;
  ordenTrabajoId?: number;
  
  // Relaciones
  maquina?: {
    id: number;
    codigo: string;
    modelo: string;
    ubicacion?: {
      nombre: string;
    };
  };
  cliente?: {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
  };
  ordenTrabajo?: {
    id: number;
  };
}

export interface Tecnico {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  activo: boolean;
}

export interface OrdenTrabajo {
  id: number;
  codigo: string;
  estado: string;
  fechaCreacion: string;
}