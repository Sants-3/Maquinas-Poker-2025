import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Maquina } from './Maquina';
import { Tecnico } from './Tecnico';

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    codigo!: string;

    @ManyToOne(() => Maquina)
    @JoinColumn({ name: 'maquina_id' })
    maquina!: Maquina;

    @Column({ nullable: true })
    tipo!: string;

    @Column({ nullable: true })
    prioridad!: string;

    @Column({ nullable: true })
    estado!: string;

    @Column({ nullable: false })
    descripcion!: string;

    @ManyToOne(() => Tecnico)
    @JoinColumn({ name: 'tecnico_id' })
    tecnico!: Tecnico;

    @Column({ type: 'datetime', nullable: true })
    fecha_creacion!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_asignacion!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_inicio!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_finalizacion!: Date;

    @Column({ nullable: true })
    tiempo_estimado!: number;

    @Column({ nullable: true })
    tiempo_real!: number;

    @Column({ nullable: true })
    cliente_notificado!: boolean;

    @Column({ nullable: true })
    firma_cliente!: string;

    @Column({ nullable: true })
    foto_finalizacion!: string;

    @Column({ nullable: true })
    calificacion_servicio!: number;

    @Column({ nullable: true })
    comentarios_cliente!: string;
}