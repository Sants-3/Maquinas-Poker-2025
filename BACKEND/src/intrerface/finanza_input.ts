export interface FinanzaDTO {
  tipo_movimiento: string;
  descripcion: string;
  monto: number;
  moneda: string;
  fecha_movimiento: string | Date;
  maquina_id: number;
  usuario_id: number;
  transaccion_id: number;
  proveedor_id: number;
  orden_trabajo_id: number;
  referencia_externa?: string;
  notas?: string;
}