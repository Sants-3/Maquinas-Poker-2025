-- Agregar columnas faltantes a la tabla ordenes_trabajo
USE [gestion_maquinas_poker];

-- Agregar columna reporte_cliente_id
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'reporte_cliente_id')
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ADD [reporte_cliente_id] INT NULL;
    PRINT 'Columna reporte_cliente_id agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna reporte_cliente_id ya existe';
END

-- Agregar columna notas_tecnico
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'notas_tecnico')
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ADD [notas_tecnico] NVARCHAR(MAX) NULL;
    PRINT 'Columna notas_tecnico agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna notas_tecnico ya existe';
END

-- Agregar columna creado_en
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'creado_en')
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ADD [creado_en] DATETIME2 DEFAULT GETDATE();
    PRINT 'Columna creado_en agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna creado_en ya existe';
END

-- Agregar columna actualizado_en
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'actualizado_en')
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ADD [actualizado_en] DATETIME2 DEFAULT GETDATE();
    PRINT 'Columna actualizado_en agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna actualizado_en ya existe';
END

-- Crear trigger para actualizar automaticamente actualizado_en
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_ordenes_trabajo_updated')
BEGIN
    EXEC('
    CREATE TRIGGER tr_ordenes_trabajo_updated
    ON [dbo].[ordenes_trabajo]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[ordenes_trabajo]
        SET [actualizado_en] = GETDATE()
        FROM [dbo].[ordenes_trabajo] ot
        INNER JOIN inserted i ON ot.id = i.id;
    END
    ');
    PRINT 'Trigger tr_ordenes_trabajo_updated creado exitosamente';
END
ELSE
BEGIN
    PRINT 'Trigger tr_ordenes_trabajo_updated ya existe';
END

-- Actualizar registros existentes con fechas por defecto
UPDATE [dbo].[ordenes_trabajo] 
SET [creado_en] = ISNULL([fecha_creacion], GETDATE()),
    [actualizado_en] = ISNULL([fecha_creacion], GETDATE())
WHERE [creado_en] IS NULL OR [actualizado_en] IS NULL;

PRINT 'Script completado exitosamente';