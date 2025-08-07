USE gestion_maquinas_poker;
GO

-- Tabla reportes_cliente
CREATE TABLE dbo.reportes_cliente (
    id INT IDENTITY(1,1) PRIMARY KEY,
    maquina_id INT NOT NULL,
    usuario_id INT NOT NULL,
    descripcion NVARCHAR(MAX) NOT NULL,
    gravedad NVARCHAR(20) NOT NULL CHECK (gravedad IN ('Baja', 'Media', 'Alta', 'Crítica')),
    tipo NVARCHAR(30) NOT NULL CHECK (tipo IN ('reporte_problema', 'confirmacion_operativa')),
    estado NVARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesado', 'resuelto')),
    estado_anterior NVARCHAR(50) NULL,
    nuevo_estado_sugerido NVARCHAR(50) NULL,
    fecha_reporte DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_procesado DATETIME NULL,
    observaciones_admin NVARCHAR(MAX) NULL,
    CONSTRAINT FK_reportes_cliente_maquina FOREIGN KEY (maquina_id) REFERENCES dbo.maquinas(id),
    CONSTRAINT FK_reportes_cliente_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
)
GO

-- Índices para mejorar el rendimiento
CREATE INDEX IX_reportes_cliente_maquina_id ON dbo.reportes_cliente(maquina_id);
CREATE INDEX IX_reportes_cliente_usuario_id ON dbo.reportes_cliente(usuario_id);
CREATE INDEX IX_reportes_cliente_estado ON dbo.reportes_cliente(estado);
CREATE INDEX IX_reportes_cliente_fecha_reporte ON dbo.reportes_cliente(fecha_reporte);
GO

PRINT 'Tabla reportes_cliente creada exitosamente';
GO