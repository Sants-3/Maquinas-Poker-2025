import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Maquina } from './Maquina';
import { User } from './User';

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    codigo?: string;

    @Column({ name: 'maquina_id', nullable: true })
    maquinaId?: number;

    @Column({ name: 'tecnico_id', nullable: true })
    tecnicoId?: number;

    @Column({ name: 'reporte_cliente_id', nullable: true })
    reporteClienteId?: number;

    @Column({ nullable: true })
    tipo?: string;

    @Column({ nullable: true })
    prioridad?: string;

    @Column({ nullable: true, default: 'pendiente' })
    estado?: string;

    @Column({ type: 'nvarchar', length: 'max', nullable: true })
    descripcion?: string;

    @Column({ type: 'datetime', nullable: true, name: 'fecha_creacion' })
    fechaCreacion?: Date;

    @Column({ type: 'datetime', nullable: true, name: 'fecha_asignacion' })
    fechaAsignacion?: Date;

    @Column({ type: 'datetime', nullable: true, name: 'fecha_inicio' })
    fechaInicio?: Date;

    @Column({ type: 'datetime', nullable: true, name: 'fecha_finalizacion' })
    fechaFinalizacion?: Date;

    @Column({ nullable: true, name: 'tiempo_estimado' })
    tiempoEstimado?: number;

    @Column({ nullable: true, name: 'tiempo_real' })
    tiempoReal?: number;

    @Column({ nullable: true, name: 'cliente_notificado' })
    clienteNotificado?: boolean;

    @Column({ nullable: true, name: 'firma_cliente' })
    firmaCliente?: string;

    @Column({ nullable: true, name: 'foto_finalizacion' })
    fotoFinalizacion?: string;

    @Column({ nullable: true, name: 'calificacion_servicio' })
    calificacionServicio?: number;

    @Column({ nullable: true, name: 'comentarios_cliente' })
    comentariosCliente?: string;

    @Column({ type: 'nvarchar', length: 'max', nullable: true, name: 'notas_tecnico' })
    notasTecnico?: string;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn!: Date;

    @UpdateDateColumn({ name: 'actualizado_en' })
    actualizadoEn!: Date;

    // Relaciones
    @ManyToOne(() => Maquina)
    @JoinColumn({ name: 'maquina_id' })
    maquina!: Maquina;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'tecnico_id' })
    tecnico!: User;
}