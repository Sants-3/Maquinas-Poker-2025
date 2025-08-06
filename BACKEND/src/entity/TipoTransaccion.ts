import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('tipo_transaccion')
export class TipoTransaccion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column({ nullable: true }) // Puede ser nulo si es una categoría raíz
    descripcion!: string;

    // Definimos la relación recursiva para el padre
    @Column({ name: 'padre_id', nullable: true })
    padre_id!: number;

    @ManyToOne(() => TipoTransaccion, tipoTransaccion => tipoTransaccion.hijos)
    @JoinColumn({ name: 'padre_id' })
    padre!: TipoTransaccion; // La propiedad que contendrá el objeto padre (o null si es raíz)

    // --- Relación recursiva con los hijos ---
    // Un tipo de transacción puede tener MUCHOS hijos
    @OneToMany(() => TipoTransaccion, tipoTransaccion => tipoTransaccion.padre)
    hijos!: TipoTransaccion[]; // La propiedad que contendrá un array de objetos hijos

    @Column({ default: true, nullable: true })
    activa!: boolean;
}