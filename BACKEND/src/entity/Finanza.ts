import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Maquina } from './Maquina';
import { User } from './User';
import { Transaccion } from './Transaccion';
import { OrdenTrabajo } from './OrdenesTrabajo';

@Entity('finanzas')
export class Finanza {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  tipo_movimiento!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  monto!: number;

  @Column({ nullable: false })
  moneda!: string;

  @Column({ type: 'datetime', nullable: false })
  fecha_movimiento!: Date;

  @ManyToOne(() => Maquina, { eager: true })
  @JoinColumn({ name: 'maquina_id' })
  maquina!: Maquina;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @ManyToOne(() => Transaccion, { eager: true })
  @JoinColumn({ name: 'transaccion_id' })
  transaccion!: Transaccion;

  @ManyToOne(() => OrdenTrabajo, { eager: true })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo!: OrdenTrabajo;

  @Column({ nullable: true })
  referencia_externa!: string;

  @Column({ nullable: true })
  notas!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creado_en!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizado_en!: Date;
}