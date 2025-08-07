import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'gestion_maquinas_poker',
  user: 'sa',
  password: 'admin123',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function runMigration() {
  try {
    console.log('Conectando a la base de datos...');
    await sql.connect(config);
    
    console.log('Ejecutando migración...');
    const result = await sql.query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'reportes_cliente' AND COLUMN_NAME = 'tipo')
      BEGIN
        ALTER TABLE reportes_cliente 
        ADD tipo nvarchar(50) NOT NULL DEFAULT 'reporte_problema'
        PRINT 'Columna tipo agregada exitosamente'
      END
      ELSE
      BEGIN
        PRINT 'La columna tipo ya existe'
      END
    `);
    
    console.log('Migración completada exitosamente');
    console.log('Resultado:', result);
    
  } catch (error) {
    console.error('Error ejecutando migración:', error);
  } finally {
    await sql.close();
  }
}

runMigration();