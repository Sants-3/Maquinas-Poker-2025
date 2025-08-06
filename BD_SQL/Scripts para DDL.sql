USE gestion_maquinas_poker;
GO


-- Tabla tipos_transaccion
CREATE TABLE dbo.tipo_transaccion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL UNIQUE,
    tipo NVARCHAR(10) NULL,
    descripcion NVARCHAR(MAX) NULL,
    padre_id INT NULL,
    activa BIT NOT NULL DEFAULT 1,
	FOREIGN KEY (padre_id) REFERENCES dbo.tipo_transaccion(id)
)
GO

-- Tabla ubicaciones
CREATE TABLE dbo.ubicaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL UNIQUE,
    direccion NVARCHAR(255) NOT NULL,
    ciudad NVARCHAR(100) NOT NULL,
    codigo_postal NVARCHAR(20) NULL,
    telefono NVARCHAR(20) NULL,
    responsable NVARCHAR(100) NULL,
    latitud DECIMAL(9,6) NULL, 
    longitud DECIMAL(9,6) NULL,
    activa BIT NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Tabla proveedores
CREATE TABLE dbo.proveedores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(255) NOT NULL UNIQUE,
    contacto NVARCHAR(100) NULL,
    telefono NVARCHAR(20) NULL,
    email NVARCHAR(255) NULL,
    direccion NVARCHAR(255) NULL,
    rtn NVARCHAR(50) NULL,
    tipo_servicio NVARCHAR(50) NULL,
    calificacion INT NULL,
    activo BIT NOT NULL DEFAULT 1
)
GO

-- Tabla usuarios
CREATE TABLE dbo.usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    rol NVARCHAR(50) NOT NULL DEFAULT 'admin',
	telefono NVARCHAR(20) NULL,
    activo BIT NOT NULL DEFAULT 1,
	ultimo_login DATETIME NULL,
    mfa_secret NVARCHAR(255) NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME NULL
)
GO

-- Tabla maquinas
CREATE TABLE maquinas (
    id INT PRIMARY KEY IDENTITY(1,1),
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    modelo VARCHAR(100),
    fecha_adquisicion DATE,
    fecha_instalacion DATE,
    proveedor_id INT,
    usuario_id INT NULL,
    estado VARCHAR(50),
    ultima_ubicacion_id INT,
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    notas TEXT,
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_maquinas_ubicacion FOREIGN KEY (ultima_ubicacion_id) REFERENCES dbo.ubicaciones(id),
	CONSTRAINT FK_maquinas_proveedor FOREIGN KEY (proveedor_id) REFERENCES dbo.proveedores(id),
	CONSTRAINT FK_maquinas_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
);

-- Tabla repuestos
CREATE TABLE dbo.repuestos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    codigo NVARCHAR(50) UNIQUE,
    descripcion NVARCHAR(MAX) NULL,
    proveedor_id INT NULL,
    precio_unitario DECIMAL(18,2) NULL,
    ubicacion_almacen INT NULL,
	compatible_con NVARCHAR(255) NULL,
    fecha_ultimo_reabastecimiento DATE NULL,
    CONSTRAINT FK_repuestos_proveedor FOREIGN KEY (proveedor_id) REFERENCES dbo.proveedores(id),
	CONSTRAINT FK_repuestos_ubicacion FOREIGN KEY (ubicacion_almacen) REFERENCES dbo.ubicaciones(id)
)
GO

-- Tabla ordenes_trabajo
CREATE TABLE dbo.ordenes_trabajo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo NVARCHAR(50) NOT NULL UNIQUE,
    maquina_id INT NOT NULL,
    tipo NVARCHAR(50) NULL,
    prioridad NVARCHAR(50) NULL DEFAULT 'Media',
    estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    descripcion NVARCHAR(MAX) NULL,
	tecnico_id INT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_asignacion DATETIME NULL,
    fecha_inicio DATETIME NULL,
    fecha_finalizacion DATETIME NULL,
    tiempo_estimado INT NULL,
    tiempo_real INT NULL,
    cliente_notificado BIT NULL DEFAULT 0,
    firma_cliente NVARCHAR(255) NULL,
    calificacion_servicio INT NULL,
    comentarios_cliente NVARCHAR(MAX) NULL,
    foto_finalizacion NVARCHAR(MAX) NULL,
    CONSTRAINT FK_ordenes_trabajo_maquina FOREIGN KEY (maquina_id) REFERENCES dbo.maquinas(id),
    CONSTRAINT FK_ordenes_trabajo_tecnico FOREIGN KEY (tecnico_id) REFERENCES dbo.tecnicos(id)
)
GO

-- Tabla finanzas
CREATE TABLE dbo.finanzas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_movimiento NVARCHAR(10) NULL,
	descripcion NVARCHAR(255) NULL,
    monto DECIMAL(18,2) NOT NULL,
    moneda NVARCHAR(10) NOT NULL DEFAULT 'HNL',
    fecha_movimiento DATETIME NOT NULL DEFAULT GETDATE(),
    maquina_id INT NULL,
    usuario_id INT NOT NULL,
    transaccion_id INT NULL,
    proveedor_id INT NULL,
    orden_trabajo_id INT NULL,
    referencia_externa NVARCHAR(100) NULL,
    notas NVARCHAR(MAX) NULL,
    created_en DATETIME NOT NULL DEFAULT GETDATE(),
    actualizado_en DATETIME NULL,
    CONSTRAINT FK_finanzas_maquina FOREIGN KEY (maquina_id) REFERENCES dbo.maquinas(id),
    CONSTRAINT FK_finanzas_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id),
    CONSTRAINT FK_finanzas_transaccion FOREIGN KEY (transaccion_id) REFERENCES dbo.transacciones(id),
    CONSTRAINT FK_finanzas_proveedor FOREIGN KEY (proveedor_id) REFERENCES dbo.proveedores(id),
    CONSTRAINT FK_finanzas_orden_trabajo FOREIGN KEY (orden_trabajo_id) REFERENCES dbo.ordenes_trabajo(id)
)
GO

-- Tabla transacciones
CREATE TABLE dbo.transacciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    maquina_id INT NULL,
    monto DECIMAL(18,2) NOT NULL,
    moneda NVARCHAR(10) NOT NULL DEFAULT 'HNL',
	fecha_transaccion DATETIME NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    descripcion NVARCHAR(MAX) NULL,
    metodo_pago NVARCHAR(50) NULL,
    referencia NVARCHAR(100) NULL,
    usuario_id INT NOT NULL,
    sincronizado_quickbooks BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_transacciones_maquina FOREIGN KEY (maquina_id) REFERENCES dbo.maquinas(id),
    CONSTRAINT FK_transacciones_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
)
GO

-- Tabla inventarios
CREATE TABLE dbo.inventarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    repuesto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    ubicacion_id INT NULL,
    ultima_entrada_cantidad INT NULL,
    ultima_entrada_fecha DATETIME NULL,
    ultima_salida_cantidad INT NULL,
    ultima_salida_fecha DATETIME NULL,
    stock_minimo INT NULL,
    notas NVARCHAR(MAX) NULL,
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_inventarios_repuesto FOREIGN KEY (repuesto_id) REFERENCES dbo.repuestos(id)
);
GO

-- Tabla tecnicos
CREATE TABLE dbo.tecnicos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    especialidad NVARCHAR(100) NULL,
    disponibilidad NVARCHAR(50) NULL,
    vehiculo_asignado NVARCHAR(100) NULL,
    herramienta_asignada NVARCHAR(MAX) NULL,
    calificacion_promedio DECIMAL(3,2) NULL,
    fecha_contratacion DATETIME NOT NULL DEFAULT GETDATE(),
	ubicacion_actual NVARCHAR(100) NULL,
    ultima_ubicacion_lat DECIMAL(9,6) NULL,
    ultima_ubicacion_lon DECIMAL(9,6) NULL,
    ultima_actualizacion_ubicacion DATETIME NULL,
    CONSTRAINT FK_tecnicos_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
)
GO

-- Tabla mantenimientos
CREATE TABLE dbo.mantenimientos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orden_trabajo_id INT NOT NULL,
    tipo NVARCHAR(50) NULL,
    descripcion NVARCHAR(MAX) NULL,
    acciones_realizadas NVARCHAR(MAX) NULL,
    repuestos_utilizados NVARCHAR(MAX) NULL,
    costo_estimado DECIMAL(18,2) NULL,
    costo_real DECIMAL(18,2) NULL,
    fecha_programada DATETIME NULL,
    fecha_realizacion DATETIME NULL,
    tecnico_id INT NULL,
    resultado NVARCHAR(50) NULL,
    observaciones NVARCHAR(MAX) NULL,
    CONSTRAINT FK_mantenimientos_orden_trabajo FOREIGN KEY (orden_trabajo_id) REFERENCES dbo.ordenes_trabajo(id),
    CONSTRAINT FK_mantenimientos_tecnico FOREIGN KEY (tecnico_id) REFERENCES dbo.tecnicos(id)
)
GO

-- Tabla evidencia_mantenimiento
CREATE TABLE dbo.evidencia_mantenimiento (
    id INT IDENTITY(1,1) PRIMARY KEY,
    mantenimiento_id INT NOT NULL,
    url_foto NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_evidencia_mantenimiento_mantenimiento FOREIGN KEY (mantenimiento_id) REFERENCES dbo.mantenimientos(id)
)
GO