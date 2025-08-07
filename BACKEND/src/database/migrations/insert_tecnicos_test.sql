-- Insertar usuarios técnicos de prueba
INSERT INTO usuarios (nombre, email, password_hash, rol, telefono, activo, fecha_creacion, fecha_actualizacion)
VALUES 
('Juan Pérez', 'juan.perez@maquinaspoker.com', '$2b$10$WkJlVvjYampHYKxH9Jaa3uduJHtHHpqRRqh5MRC3I4MKQV6CQ.24O', 'tecnico', '555-0001', 1, GETDATE(), GETDATE()),
('María García', 'maria.garcia@maquinaspoker.com', '$2b$10$WkJlVvjYampHYKxH9Jaa3uduJHtHHpqRRqh5MRC3I4MKQV6CQ.24O', 'tecnico', '555-0002', 1, GETDATE(), GETDATE()),
('Carlos López', 'carlos.lopez@maquinaspoker.com', '$2b$10$WkJlVvjYampHYKxH9Jaa3uduJHtHHpqRRqh5MRC3I4MKQV6CQ.24O', 'tecnico', '555-0003', 1, GETDATE(), GETDATE());

-- Insertar técnicos asociados a los usuarios
INSERT INTO tecnicos (usuario_id, especialidad, disponibilidad, vehiculo_asignado, herramienta_asignada, calificacion_promedio, fecha_contratacion, ubicacion_actual)
VALUES 
((SELECT id FROM usuarios WHERE email = 'juan.perez@maquinaspoker.com'), 'Electrónica', 'disponible', 'Camioneta #001', 'Kit Básico', 4.5, '2024-01-15', 'Zona Norte'),
((SELECT id FROM usuarios WHERE email = 'maria.garcia@maquinaspoker.com'), 'Mecánica', 'disponible', 'Camioneta #002', 'Kit Avanzado', 4.8, '2024-02-01', 'Zona Centro'),
((SELECT id FROM usuarios WHERE email = 'carlos.lopez@maquinaspoker.com'), 'Software', 'disponible', 'Auto #003', 'Kit Software', 4.2, '2024-03-10', 'Zona Sur');