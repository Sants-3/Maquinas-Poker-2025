import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Maquina } from './Maquina';
import { User } from './User';

@Entity('reportes_cliente')
export class ReporteCliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'maquina_id' })
  maquinaId!: number;

  @Column({ name: 'cliente_id' })
  clienteId!: number;

  @Column({ type: 'nvarchar', length: 'max' })
  descripcion!: string;

  @Column({ type: 'nvarchar', length: 50 })
  gravedad!: string;



  @Column({ name: 'estado_anterior', type: 'nvarchar', length: 50 })
  estadoAnterior!: string;

  @Column({ name: 'estado_nuevo', type: 'nvarchar', length: 50 })
  estadoNuevo!: string;

  @Column({ name: 'estado_reporte', type: 'nvarchar', length: 50, default: 'pendiente' })
  estadoReporte!: string;

  @Column({ name: 'fecha_reporte', type: 'datetime' })
  fechaReporte!: Date;

  @Column({ name: 'fecha_asignacion', type: 'datetime', nullable: true })
  fechaAsignacion?: Date;

  @Column({ name: 'tecnico_asignado_id', nullable: true })
  tecnicoAsignadoId?: number;

  @Column({ name: 'orden_trabajo_id', nullable: true })
  ordenTrabajoId?: number;

  @Column({ name: 'notas_admin', type: 'nvarchar', length: 'max', nullable: true })
  notasAdmin?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;

  // Relaciones
  @ManyToOne(() => Maquina)
  @JoinColumn({ name: 'maquina_id' })
  maquina!: Maquina;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: User;
}