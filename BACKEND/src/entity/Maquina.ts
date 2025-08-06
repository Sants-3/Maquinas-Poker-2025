import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Ubicacion } from './Ubicacion';
import { Proveedor } from './Proveedor';
import { User } from './User';

@Entity('maquinas')
export class Maquina {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column({ nullable: false })
    numero_serie!: string;

    @Column({ nullable: false })
    nombre!: string;

    @Column({ nullable: false })
    modelo!: string;

    @Column({ type: 'datetime', nullable: false })
    fecha_adquisicion!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_instalacion!: Date;

    @Column({ nullable: false })
    estado!: string;

    @ManyToOne(() => Ubicacion)
    @JoinColumn({ name: 'ultima_ubicacion_id' })
    ubicacion!: Ubicacion;

    @ManyToOne(() => Proveedor, { nullable: true })
    @JoinColumn({ name: 'proveedor_id' })
    proveedor!: Proveedor;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;

    @Column({ type: 'datetime', nullable: true })
    ultimo_mantenimiento!: Date;

    @Column({ type: 'datetime', nullable: true })
    proximo_mantenimiento!: Date;

    @Column({ nullable: true })
    notas!: string;

    @Column({ type: 'datetime', nullable: true })
    creado_en!: Date;

    @Column({ type: 'datetime', nullable: true })
    actualizado_en!: Date;
}