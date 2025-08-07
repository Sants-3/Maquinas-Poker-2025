-- Corregir la Foreign Key constraint para que apunte a usuarios en lugar de tecnicos
USE [gestion_maquinas_poker];

-- Paso 1: Eliminar la constraint existente si existe
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ordenes_trabajo_tecnico')
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo] 
    DROP CONSTRAINT [FK_ordenes_trabajo_tecnico];
    PRINT 'Constraint FK_ordenes_trabajo_tecnico eliminada';
END
ELSE
BEGIN
    PRINT 'Constraint FK_ordenes_trabajo_tecnico no existe';
END

-- Paso 2: Crear la nueva constraint que apunte a usuarios
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ordenes_trabajo_usuario_tecnico')
BEGIN
    ALTER TABLE [dbo].[ordenes_trabajo]
    ADD CONSTRAINT [FK_ordenes_trabajo_usuario_tecnico]
    FOREIGN KEY ([tecnico_id]) REFERENCES [dbo].[usuarios]([id]);
    PRINT 'Nueva constraint FK_ordenes_trabajo_usuario_tecnico creada apuntando a usuarios';
END
ELSE
BEGIN
    PRINT 'Constraint FK_ordenes_trabajo_usuario_tecnico ya existe';
END

-- Paso 3: Verificar que la constraint se creó correctamente
SELECT 
    fk.name AS constraint_name,
    tp.name AS parent_table,
    cp.name AS parent_column,
    tr.name AS referenced_table,
    cr.name AS referenced_column
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
INNER JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
WHERE tp.name = 'ordenes_trabajo' AND cp.name = 'tecnico_id';

PRINT 'Script completado - Foreign Key corregida';