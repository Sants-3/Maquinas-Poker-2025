import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTipoToReporteCliente1754591382784 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE reportes_cliente 
            ADD tipo nvarchar(50) NOT NULL DEFAULT 'reporte_problema'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE reportes_cliente 
            DROP COLUMN tipo
        `);
    }

}
