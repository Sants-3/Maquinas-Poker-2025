import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('proveedores')
export class Proveedor {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    nombre!: string;

    @Column({ nullable: true })
    contacto!: string;

    @Column({ nullable: true })
    telefono!: string;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    rtn!: string;

    @Column({ nullable: true })
    tipo_servicio!: string;

    @Column({ nullable: true })
    calificacion!: number;

    @Column({ nullable: true })
    activo!: boolean;
}   