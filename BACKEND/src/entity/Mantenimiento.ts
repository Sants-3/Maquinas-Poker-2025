import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrdenTrabajo } from './OrdenesTrabajo';
import { Tecnico } from './Tecnico';

@Entity('mantenimientos')
export class Mantenimiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrdenTrabajo)
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo!: OrdenTrabajo;

  @Column({nullable: false})
  tipo!: string;

  @Column({nullable: false})
  descripcion!: string;

  @Column({nullable: true})
  acciones_realizadas?: string;

  @Column({nullable: true})
  repuestos_utilizados?: string;

  @Column({type: 'decimal', precision: 10, scale: 2, nullable: true})
  costo_estimado?: number;

  @Column({type: 'decimal', precision: 10, scale: 2, nullable: true})
  costo_real?: number;

  @Column({type: 'datetime', nullable: true})
  fecha_programada?: Date;

  @Column({type: 'datetime', nullable: true})
  fecha_realizacion?: Date;

  @ManyToOne(() => Tecnico)
  @JoinColumn({ name: 'tecnico_id' })
  tecnico?: Tecnico;

  @Column({nullable: true})
  resultado?: string;

  @Column({nullable: true})
  observaciones?: string;
}
