import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('tecnicos')
export class Tecnico {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;

    @Column({ nullable: true })
    especialidad!: string;

    @Column({ nullable: true })
    disponibilidad!: string;

    @Column({ nullable: true })
    vehiculo_asignado!: string;

    @Column({ nullable: true })
    herramienta_asignada!: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    calificacion_promedio!: number;

    @Column({ nullable: true })
    fecha_contratacion!: Date;

    @Column({ nullable: true })
    ubicacion_actual!: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    ultima_ubicacion_lat!: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    ultima_ubicacion_lon!: number;

    @Column({ type: 'datetime', nullable: true })
    ultima_actualizacion_ubicacion!: Date;
}