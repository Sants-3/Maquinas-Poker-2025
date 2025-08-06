import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Repuesto } from './Repuesto';
import { Ubicacion } from './Ubicacion';

@Entity('inventarios')
export class Inventario {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Repuesto)
    @JoinColumn({ name: 'repuesto_id' })
  repuesto!: Repuesto;

  @Column({ nullable: false })
  cantidad!: number;

  @ManyToOne(() => Ubicacion)
    @JoinColumn({ name: 'ubicacion_id' })
  ubicacion!: Ubicacion;

  @Column({ type: 'datetime', nullable: true })
  ultima_entrada_fecha!: Date;

  @Column({ nullable: true })
  ultima_entrada_cantidad!: number;

  @Column({ type: 'datetime', nullable: true })
  ultima_salida_fecha!: Date;

  @Column({ nullable: true })
  ultima_salida_cantidad!: number;

  @Column({ nullable: true })
  stock_minimo!: number;

  @Column({ nullable: true })
  notas!: string;

  @Column({ type: 'datetime', nullable: false })
  creado_en!: Date;

  @Column({ type: 'datetime', nullable: false })
  actualizado_en!: Date;
}
