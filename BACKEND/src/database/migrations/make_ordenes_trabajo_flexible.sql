-- Hacer las columnas de ordenes_trabajo más flexibles (nullable)
USE [gestion_maquinas_poker];

-- Hacer codigo nullable
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'codigo' AND is_nullable = 0)
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ALTER COLUMN [codigo] NVARCHAR(255) NULL;
    PRINT 'Columna codigo ahora es nullable';
END

-- Hacer maquina_id nullable
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'maquina_id' AND is_nullable = 0)
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ALTER COLUMN [maquina_id] INT NULL;
    PRINT 'Columna maquina_id ahora es nullable';
END

-- Hacer descripcion nullable
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'descripcion' AND is_nullable = 0)
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ALTER COLUMN [descripcion] NVARCHAR(MAX) NULL;
    PRINT 'Columna descripcion ahora es nullable';
END

-- Hacer estado nullable
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ordenes_trabajo]') AND name = 'estado' AND is_nullable = 0)
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    ALTER COLUMN [estado] NVARCHAR(255) NULL;
    PRINT 'Columna estado ahora es nullable';
END

PRINT 'Script completado - Columnas ahora son más flexibles';