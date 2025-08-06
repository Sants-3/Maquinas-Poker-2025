import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ubicaciones')
export class Ubicacion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    nombre!: string;

    @Column({ nullable: false })
    direccion!: string;

    @Column( { nullable: false})
    ciudad!: string;

    @Column({ nullable: true})
    codigo_postal!: string;

    @Column({ nullable: true })
    telefono!: string;

    @Column({ nullable: true })
    responsable!: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitud!: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitud!: number;

    @Column({ nullable: true })
    activa!: boolean;

    @Column({ type: 'datetime', nullable: true })
    creado_en!: Date;
}   