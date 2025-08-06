import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Maquina } from './Maquina';
import { User } from './User';
import { Transaccion } from './Transaccion';
import { Proveedor } from './Proveedor';
import { OrdenTrabajo } from './OrdenesTrabajo';

@Entity('finanzas')
export class Finanza {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({nullable: false})
  tipo_movimiento!: string;

  @Column({ unique: true, nullable: true })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  monto!: number;

  @Column({ nullable: false })
  moneda!: string;

  @Column({ type: 'datetime', nullable: false })
  fecha_movimiento!: Date;

  @ManyToOne(() => Maquina)
      @JoinColumn({ name: 'maquina_id' })
  maquina_id!: Maquina;

  @ManyToOne(() => User)
      @JoinColumn({ name: 'usuario_id' })
  usuario_id!: User;

  @ManyToOne(() => Transaccion)
      @JoinColumn({ name: 'transaccion_id' })
  transaccion_id!: Transaccion;

  @ManyToOne(() => Proveedor)
      @JoinColumn({ name: 'proveedor_id' })
  proveedor_id!: Proveedor;

  @ManyToOne(() => OrdenTrabajo)
      @JoinColumn({ name: 'orden_trabajo_id' })
  orden_trabajo_id!: OrdenTrabajo;

  @Column({ nullable: true })
  referencia_externa!: string;

  @Column({ nullable: true })
  notas!: string;

  @Column({ type: 'datetime', nullable: false })
  creado_en!: Date;

  @Column({ type: 'datetime', nullable: false })
  actualizado_en!: Date;
}
