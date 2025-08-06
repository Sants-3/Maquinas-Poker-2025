import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Maquina } from './Maquina';
import { User } from './User';
import { TipoTransaccion } from './TipoTransaccion';


@Entity('transacciones')
export class Transaccion {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Maquina)
        @JoinColumn({ name: 'maquina_id' })
    maquina!: Maquina;

    // @Column({ nullable: true})
    // tipo!: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
    monto!: number;

    @Column({ nullable: true })
    moneda!: string;

    @Column({ type: 'datetime', nullable: false })
    fecha_transaccion!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_registro!: Date;

    @Column({ nullable: true })
    descripcion!: string;

    // @OneToMany(() => TipoTransaccion, tipoTransaccion => tipoTransaccion.id)
    // @JoinColumn({ name: 'tipo_transaccion_id' })
    // tipoTransaccion!: TipoTransaccion[];
    @ManyToOne(() => TipoTransaccion)
        @JoinColumn({ name: 'tipo_transaccion_id' })
    tipoTransaccion!: TipoTransaccion;

    @Column({ nullable: true })
    metodo_pago!: string;

    @ManyToOne(() => User)
        @JoinColumn({ name: 'usuario_id' })
    usuario!: User;

    @Column({ nullable: true })
    sincronizado_quickbooks!: boolean;
}