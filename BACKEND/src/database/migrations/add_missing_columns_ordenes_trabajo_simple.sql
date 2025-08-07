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

PRINT 'Script completado exitosamente - Columnas agregadas';