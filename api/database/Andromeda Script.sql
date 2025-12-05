CREATE DATABASE IF NOT EXISTS Andromeda;
USE Andromeda;

CREATE TABLE Rol(
	Id INT Primary Key,
    Nombre Varchar(100) not Null
);

CREATE TABLE Usuario(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) NOT NULL,
    PasswordHash VARCHAR(100) NOT NULL,
    Ultima_Sesion DATETIME,
    Rol INT Not Null,
    Estado BOOLEAN Not Null,
    CargaTrabajo Int,
    FOREIGN KEY (Rol) REFERENCES Rol(Id)
);

CREATE TABLE Especialidad (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(250)
);

CREATE TABLE Tecnico (
    Id_Usuario INT,
    Id_Especialidad INT,
    PRIMARY KEY (Id_Usuario, Id_Especialidad),
    FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id),
    FOREIGN KEY (Id_Especialidad) REFERENCES Especialidad(Id)
);

CREATE TABLE SLA(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Tiempo_Respuesta INT NOT NULL, -- Horas
    Tiempo_Resolucion INT NOT NULL, -- Horas
    Descripcion VARCHAR(250)
);

Create Table Etiqueta(
	Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre Varchar(50)
);

CREATE TABLE Categoria(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Id_SLA INT NOT NULL,
    FOREIGN KEY (Id_SLA) REFERENCES SLA(Id)
);

Create Table Categoria_Etiqueta(
	Id_Categoria Int Not Null,
    Id_Etiqueta Int Not Null,
    PRIMARY KEY (Id_Categoria, Id_Etiqueta),
    FOREIGN KEY (Id_Etiqueta) REFERENCES Etiqueta(Id),
    FOREIGN KEY (Id_Categoria) REFERENCES Categoria(Id)
);

CREATE TABLE Categoria_Especialidad (
    Id_Categoria INT NOT NULL,
    Id_Especialidad INT NOT NULL,
    PRIMARY KEY (Id_Categoria, Id_Especialidad),
    FOREIGN KEY (Id_Categoria) REFERENCES Categoria(Id),
    FOREIGN KEY (Id_Especialidad) REFERENCES Especialidad(Id)
);

Create Table Estado_Ticket(
	Id Int Not Null Primary Key,
    Nombre Varchar(50) Not null
);

Create Table Prioridad(
	Id INT Primary Key,
    Nombre varchar(50)
);

CREATE TABLE Ticket (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Usuario INT,
    Titulo VARCHAR(150) NOT NULL,
    Descripcion TEXT NOT NULL,
    Fecha_Creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Fecha_Limite_Respuesta DATETIME NULL,      -- SLA de Respuesta
    Fecha_Limite_Resolucion DATETIME NULL,     -- SLA de Resolución
    Prioridad INT NOT NULL,
    Estado Int Not null,
    Id_Categoria INT NOT NULL,
    Fecha_Cierre DATETIME NULL,
    Puntaje double Null,
    cumplimiento_respuesta BOOLEAN DEFAULT FALSE,
    cumplimiento_resolucion BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Id_Categoria) REFERENCES Categoria(Id),
    FOREIGN KEY (Estado) REFERENCES Estado_Ticket(Id),
    FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id),
    FOREIGN KEY (Prioridad) REFERENCES Prioridad(Id)
);

CREATE TABLE Historial_Estado (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Ticket INT NOT NULL,
    Fecha_Cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado_Anterior Int Not Null,
    Estado_Nuevo Int Not Null,
    Observaciones VARCHAR(250),
    Id_Usuario_Responsable INT Null,
    FOREIGN KEY (Id_Ticket) REFERENCES Ticket(Id),
    FOREIGN KEY (Estado_Anterior) REFERENCES Estado_Ticket(Id),
    FOREIGN KEY (Estado_Nuevo) REFERENCES Estado_Ticket(Id),
    FOREIGN KEY (Id_Usuario_Responsable) REFERENCES Usuario(Id)
);

CREATE TABLE Imagen (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Imagen varchar(100) NOT NULL, -- Array de Bits para guardar la imagen
    Id_Historial INT NOT NULL,
    FOREIGN KEY (Id_Historial) REFERENCES Historial_Estado(Id)
);

CREATE TABLE Regla_Autotriage (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Horas_Faltantes int Not null,
    Peso_Prioridad_Ticket INT Not null,
    Peso_Carga_Trabajo INT Not null,
    Estado Int DEFAULT TRUE
);

Create Table Metodo_Asignacion(
	Id Int Not null Primary Key,
    Nombre Varchar(100) Not null
);

CREATE TABLE Asignacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Ticket INT NOT NULL,
    Id_Tecnico INT NOT NULL,
    Id_ReglaAutobriage INT NULL,
    Fecha_Asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Metodo_Asignacion Int Not Null,
    Prioridad INT NOT NULL,
    FOREIGN KEY (Id_Ticket) REFERENCES Ticket(Id),
    FOREIGN KEY (Id_Tecnico) REFERENCES Usuario(Id),
    FOREIGN KEY (Id_ReglaAutobriage) REFERENCES Regla_Autotriage(Id),
    FOREIGN KEY (Metodo_Asignacion) REFERENCES Metodo_Asignacion(Id)
);

Create Table Tipo_Notificacion(
	Id INT Not null Primary Key,
    Nombre Varchar(100) Not Null -- 'Pendiente', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado'
);

CREATE TABLE Notificacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Usuario_Destino INT NOT NULL,
    Tipo_Notificacion Int Not Null,
    Mensaje TEXT NULL,
    Fecha_Envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado TinyInt Not null,
    FOREIGN KEY (Id_Usuario_Destino) REFERENCES Usuario(Id),
	FOREIGN KEY (Tipo_Notificacion) REFERENCES Tipo_Notificacion(Id)
);

CREATE TABLE Valoracion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Ticket INT NOT NULL UNIQUE,
    Id_Usuario INT NOT NULL,
    Puntaje INT,
    Comentario VARCHAR(250) NULL,
    Fecha_Valoracion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_Ticket) REFERENCES Ticket(Id),
    FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id),
    CHECK (Puntaje BETWEEN 1 AND 5)
);



-- =============================================
-- INSERTS PARA BASE DE DATOS ANDROMEDA
-- Sistema de Gestión de Personal para Eventos
-- Fecha: 2025-10-17
-- Usuario: TheNeytan17
-- =============================================

-- =============================================
-- 1. ROLES
-- =============================================
INSERT INTO Rol (Id, Nombre) VALUES
(1, 'Administrador'),
(2, 'Técnico'),
(3, 'Cliente');

-- =============================================
-- 2. ESPECIALIDADES - PRODUCCIÓN DE EVENTOS
-- =============================================
INSERT INTO Especialidad (Nombre, Descripcion) VALUES
-- Área de Audio
('Técnico de audio en vivo', 'Operación y configuración de sistemas de sonido durante eventos en vivo'),
('Ingeniería de sonido', 'Diseño, mezcla y optimización de audio para producciones en vivo'),
('Mantenimiento de equipos electrónicos', 'Reparación y mantenimiento preventivo de equipos de audio, video e iluminación'),

-- Área de Iluminación y Visual
('Técnico en iluminación de espectáculos', 'Operación y programación de sistemas de iluminación para eventos'),
('Electricista especializado en eventos', 'Instalación y mantenimiento eléctrico para montajes de eventos'),
('Operador de efectos visuales', 'Manejo de pantallas LED, proyecciones y efectos especiales visuales'),

-- Área de Seguridad
('Seguridad privada', 'Vigilancia y protección de instalaciones, equipos y asistentes'),
('Control de multitudes', 'Gestión y organización del flujo de personas en eventos masivos'),
('Coordinador de accesos', 'Control de entradas, acreditaciones y zonas restringidas'),

-- Área Médica
('Paramédico', 'Atención de emergencias médicas durante eventos'),
('Personal de primeros auxilios', 'Asistencia básica de salud y primeros auxilios'),
('Médico de guardia', 'Atención médica profesional y coordinación de emergencias sanitarias');

-- =============================================
-- 3. USUARIOS
-- =============================================
-- Nota: Los PasswordHash son ejemplos (en producción usar bcrypt o similar)
INSERT INTO Usuario (Nombre, Correo, PasswordHash, Ultima_Sesion, Rol, Estado, CargaTrabajo) VALUES
-- Administradores
('Neitan Morales', 'nmorales@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 00:15:00', 1, TRUE, 0),
('Naomy Díaz', 'Ndias@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 23:30:00', 1, TRUE, 0),

-- Técnicos de Audio
('Miguel Ángel Torres', 'miguel.torres@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 01:20:00', 2, TRUE, 5),
('Laura Martínez', 'laura.martinez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 01:10:00', 2, TRUE, 3),

-- Técnicos de Iluminación y Electricidad
('Diego Ramírez', 'diego.ramirez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 00:55:00', 2, TRUE, 7),
('Patricia Gómez', 'patricia.gomez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 23:40:00', 2, TRUE, 4),
('Fernando Castro', 'fernando.castro@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 01:05:00', 2, TRUE, 6),

-- Personal de Seguridad
('Sofía Herrera', 'sofia.herrera@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 22:50:00', 2, TRUE, 6),
('Javier Morales', 'javier.morales@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 00:30:00', 2, TRUE, 4),
('Ricardo Vega', 'ricardo.vega@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 01:15:00', 2, TRUE, 5),

-- Personal Médico
('Carmen Ruiz', 'carmen.ruiz@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 01:00:00', 2, TRUE, 2),
('Dr. Alberto Méndez', 'alberto.mendez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-17 00:45:00', 2, TRUE, 3),
('Elena Campos', 'elena.campos@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 23:55:00', 2, TRUE, 4),

-- Usuarios Finales (Productores/Coordinadores de Eventos)
('Juan Pérez', 'juan.perez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 18:20:00', 3, TRUE, NULL),
('María González', 'maria.gonzalez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 20:15:00', 3, TRUE, NULL),
('Pedro Jiménez', 'pedro.jimenez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 17:45:00', 3, TRUE, NULL),
('Lucía Fernández', 'lucia.fernandez@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 19:30:00', 3, TRUE, NULL),
('Valentina Ortiz', 'valentina.ortiz@andromeda.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqa', '2025-10-16 16:50:00', 3, TRUE, NULL);

-- =============================================
-- 4. TÉCNICOS CON SUS ESPECIALIDADES
-- =============================================
-- Nota: Los Id de Usuario son según el AUTO_INCREMENT (3-13 son técnicos)

-- ÁREA DE AUDIO
-- Miguel Ángel Torres - Especialista en Audio en Vivo y Mantenimiento
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(3, 1), -- Técnico de audio en vivo
(3, 3); -- Mantenimiento de equipos electrónicos

-- Laura Martínez - Ingeniera de Sonido
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(4, 2), -- Ingeniería de sonido
(4, 1); -- Técnico de audio en vivo

-- ÁREA DE ILUMINACIÓN Y ELECTRICIDAD
-- Diego Ramírez - Técnico en Iluminación
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(5, 4), -- Técnico en iluminación de espectáculos
(5, 6); -- Operador de efectos visuales

-- Patricia Gómez - Electricista Especializada
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(6, 5), -- Electricista especializado en eventos
(6, 3); -- Mantenimiento de equipos electrónicos

-- Fernando Castro - Operador de Efectos Visuales
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(7, 6), -- Operador de efectos visuales
(7, 4); -- Técnico en iluminación de espectáculos

-- ÁREA DE SEGURIDAD
-- Sofía Herrera - Seguridad Privada y Control de Multitudes
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(8, 7), -- Seguridad privada
(8, 8); -- Control de multitudes

-- Javier Morales - Control de Multitudes
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(9, 8), -- Control de multitudes
(9, 9); -- Coordinador de accesos

-- Ricardo Vega - Coordinador de Accesos y Seguridad
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(10, 9), -- Coordinador de accesos
(10, 7); -- Seguridad privada

-- ÁREA MÉDICA
-- Carmen Ruiz - Paramédico
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(11, 10), -- Paramédico
(11, 11); -- Personal de primeros auxilios

-- Dr. Alberto Méndez - Médico de Guardia
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(12, 12), -- Médico de guardia
(12, 10); -- Paramédico

-- Elena Campos - Primeros Auxilios
INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) VALUES
(13, 11), -- Personal de primeros auxilios
(13, 10); -- Paramédico




-- =============================================
-- ESTADOS DE TICKET
-- =============================================
INSERT INTO Estado_Ticket (Id, Nombre) VALUES
(1, 'Pendiente'),
(2, 'Asignado'),
(3, 'En Proceso'),
(4, 'Resuelto'),
(5, 'Cerrado');

-- =============================================
-- SLA - ACUERDOS DE NIVEL DE SERVICIO
-- =============================================
INSERT INTO SLA (Tiempo_Respuesta, Tiempo_Resolucion, Descripcion) VALUES
-- SLA Crítico
(1, 4, 'Emergencias que afectan la operación del evento en curso'),

-- SLA Alto
(2, 8, 'Problemas importantes que afectan funcionalidades principales'),

-- SLA Medio
(4, 24, 'Problemas moderados que requieren atención'),

-- SLA Bajo
(8, 48, 'Problemas menores o consultas generales');

-- =============================================
-- ETIQUETAS
-- =============================================

-- SONIDO
INSERT INTO Etiqueta (Nombre) VALUES
('Consola de audio'),
('Micrófonos'),
('Bocinas / monitores de escenario'),
('Cables de conexión'),

-- ILUMINACIÓN Y EFECTOS
('Lámparas LED'),
('Pantallas / proyectores'),
('Máquinas de humo / efectos visuales'),
('Controladores de luces'),

-- SEGURIDAD / CONTROL DE ACCESO
('Entradas principales'),
('Zonas VIP'),
('Barreras y controles de ingreso'),
('Objetos prohibidos / incidentes con asistentes'),

-- EMERGENCIAS MÉDICAS
('Desmayos / golpes de calor'),
('Caídas / lesiones'),
('Reacciones alérgicas'),
('Intoxicaciones por alcohol / sustancias'),

-- ETIQUETAS GENERALES
('Urgente'),
('Evento en Vivo'),
('Mantenimiento'),
('Instalación');

-- =============================================
-- CATEGORÍAS
-- =============================================

-- CATEGORÍA 1: SONIDO
INSERT INTO Categoria (Nombre, Id_SLA) VALUES
('Problema con Consola de Audio', 1),           -- SLA Crítico
('Falla en Micrófonos', 1),                     -- SLA Crítico
('Problema con Bocinas/Monitores', 1),          -- SLA Crítico
('Cables de Conexión Dañados', 2),              -- SLA Alto
('Interferencia de Audio', 2),                  -- SLA Alto
('Mantenimiento de Equipo de Sonido', 3);       -- SLA Medio

-- CATEGORÍA 2: ILUMINACIÓN Y EFECTOS
INSERT INTO Categoria (Nombre, Id_SLA) VALUES
('Falla en Lámparas LED', 1),                   -- SLA Crítico
('Problema con Pantallas/Proyectores', 1),      -- SLA Crítico
('Falla en Máquinas de Humo/Efectos', 2),       -- SLA Alto
('Problema con Controladores de Luces', 1),     -- SLA Crítico
('Programación de Iluminación', 3),             -- SLA Medio
('Instalación de Equipo Visual', 3);            -- SLA Medio

-- CATEGORÍA 3: SEGURIDAD / CONTROL DE ACCESO
INSERT INTO Categoria (Nombre, Id_SLA) VALUES
('Problema en Entradas Principales', 1),        -- SLA Crítico
('Incidente en Zonas VIP', 1),                  -- SLA Crítico
('Falla en Barreras y Controles', 2),           -- SLA Alto
('Incidente con Asistentes', 1),                -- SLA Crítico
('Objetos Prohibidos Detectados', 2),           -- SLA Alto
('Control de Aforo', 2);                        -- SLA Alto

-- CATEGORÍA 4: EMERGENCIAS MÉDICAS
INSERT INTO Categoria (Nombre, Id_SLA) VALUES
('Desmayo / Golpe de Calor', 1),                -- SLA Crítico
('Caída / Lesión', 1),                          -- SLA Crítico
('Reacción Alérgica', 1),                       -- SLA Crítico
('Intoxicación por Alcohol/Sustancias', 1),     -- SLA Crítico
('Atención Médica General', 2),                 -- SLA Alto
('Consulta Médica Preventiva', 3);              -- SLA Medio

-- =============================================
-- CATEGORIA_ETIQUETA
-- =============================================

-- CATEGORÍAS DE SONIDO (1-6)
-- Problema con Consola de Audio
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(1, 1),  -- Consola de audio
(1, 17), -- Urgente
(1, 18); -- Evento en Vivo

-- Falla en Micrófonos
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(2, 2),  -- Micrófonos
(2, 17), -- Urgente
(2, 18); -- Evento en Vivo

-- Problema con Bocinas/Monitores
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(3, 3),  -- Bocinas / monitores
(3, 17), -- Urgente
(3, 18); -- Evento en Vivo

-- Cables de Conexión Dañados
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(4, 4),  -- Cables de conexión
(4, 19); -- Mantenimiento

-- Interferencia de Audio
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(5, 1),  -- Consola de audio
(5, 2);  -- Micrófonos

-- Mantenimiento de Equipo de Sonido
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(6, 1),  -- Consola de audio
(6, 19); -- Mantenimiento

-- CATEGORÍAS DE ILUMINACIÓN Y EFECTOS (7-12)
-- Falla en Lámparas LED
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(7, 5),  -- Lámparas LED
(7, 17), -- Urgente
(7, 18); -- Evento en Vivo

-- Problema con Pantallas/Proyectores
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(8, 6),  -- Pantallas / proyectores
(8, 17), -- Urgente
(8, 18); -- Evento en Vivo

-- Falla en Máquinas de Humo/Efectos
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(9, 7),  -- Máquinas de humo / efectos visuales
(9, 18); -- Evento en Vivo

-- Problema con Controladores de Luces
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(10, 8),  -- Controladores de luces
(10, 17), -- Urgente
(10, 18); -- Evento en Vivo

-- Programación de Iluminación
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(11, 5),  -- Lámparas LED
(11, 8);  -- Controladores de luces

-- Instalación de Equipo Visual
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(12, 6),  -- Pantallas / proyectores
(12, 20); -- Instalación

-- CATEGORÍAS DE SEGURIDAD (13-18)
-- Problema en Entradas Principales
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(13, 9),  -- Entradas principales
(13, 17); -- Urgente

-- Incidente en Zonas VIP
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(14, 10), -- Zonas VIP
(14, 17); -- Urgente

-- Falla en Barreras y Controles
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(15, 11); -- Barreras y controles de ingreso

-- Incidente con Asistentes
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(16, 12), -- Objetos prohibidos / incidentes
(16, 17); -- Urgente

-- Objetos Prohibidos Detectados
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(17, 12); -- Objetos prohibidos / incidentes

-- Control de Aforo
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(18, 9),  -- Entradas principales
(18, 11); -- Barreras y controles

-- CATEGORÍAS MÉDICAS (19-24)
-- Desmayo / Golpe de Calor
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(19, 13), -- Desmayos / golpes de calor
(19, 17); -- Urgente

-- Caída / Lesión
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(20, 14), -- Caídas / lesiones
(20, 17); -- Urgente

-- Reacción Alérgica
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(21, 15), -- Reacciones alérgicas
(21, 17); -- Urgente

-- Intoxicación
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(22, 16), -- Intoxicaciones
(22, 17); -- Urgente

-- Atención Médica General
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(23, 13), -- Desmayos / golpes de calor
(23, 14); -- Caídas / lesiones

-- Consulta Médica Preventiva
INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) VALUES
(24, 13), -- Desmayos / golpes de calor
(24, 15); -- Reacciones alérgicas

-- =============================================
-- CATEGORIA_ESPECIALIDAD
-- =============================================

-- CATEGORÍAS DE SONIDO (1-6)
-- Especialidades: Técnico de audio en vivo (1), Ingeniería de sonido (2), Mantenimiento de equipos (3)

INSERT INTO Categoria_Especialidad (Id_Categoria, Id_Especialidad) VALUES
-- Problema con Consola de Audio
(1, 1), (1, 2),
-- Falla en Micrófonos
(2, 1), (2, 2),
-- Problema con Bocinas/Monitores
(3, 1), (3, 2),
-- Cables de Conexión Dañados
(4, 1), (4, 3),
-- Interferencia de Audio
(5, 2),
-- Mantenimiento de Equipo de Sonido
(6, 3), (6, 1);

-- CATEGORÍAS DE ILUMINACIÓN Y EFECTOS (7-12)
-- Especialidades: Técnico en iluminación (4), Electricista (5), Operador de efectos visuales (6)

INSERT INTO Categoria_Especialidad (Id_Categoria, Id_Especialidad) VALUES
-- Falla en Lámparas LED
(7, 4), (7, 5),
-- Problema con Pantallas/Proyectores
(8, 6), (8, 3),
-- Falla en Máquinas de Humo/Efectos
(9, 6),
-- Problema con Controladores de Luces
(10, 4),
-- Programación de Iluminación
(11, 4),
-- Instalación de Equipo Visual
(12, 6), (12, 5);

-- CATEGORÍAS DE SEGURIDAD (13-18)
-- Especialidades: Seguridad privada (7), Control de multitudes (8), Coordinador de accesos (9)

INSERT INTO Categoria_Especialidad (Id_Categoria, Id_Especialidad) VALUES
-- Problema en Entradas Principales
(13, 9), (13, 7),
-- Incidente en Zonas VIP
(14, 7), (14, 9),
-- Falla en Barreras y Controles
(15, 8), (15, 7),
-- Incidente con Asistentes
(16, 7), (16, 8),
-- Objetos Prohibidos Detectados
(17, 7), (17, 9),
-- Control de Aforo
(18, 8), (18, 9);

-- CATEGORÍAS MÉDICAS (19-24)
-- Especialidades: Paramédico (10), Personal de primeros auxilios (11), Médico de guardia (12)

INSERT INTO Categoria_Especialidad (Id_Categoria, Id_Especialidad) VALUES
-- Desmayo / Golpe de Calor
(19, 10), (19, 11), (19, 12),
-- Caída / Lesión
(20, 10), (20, 11), (20, 12),
-- Reacción Alérgica
(21, 12), (21, 10),
-- Intoxicación
(22, 12), (22, 10),
-- Atención Médica General
(23, 11), (23, 10),
-- Consulta Médica Preventiva
(24, 12);

-- =============================================
-- METODOS DE ASIGNACION
-- =============================================
INSERT INTO Metodo_Asignacion (Id, Nombre) VALUES
(1, 'Manual'),
(2, 'Automático');

-- =============================================
-- TIPOS DE NOTIFICACION
-- =============================================
INSERT INTO Tipo_Notificacion (Id, Nombre) VALUES
(1, 'Asignación de ticket'),
(2, 'Cambio de estado'),
(3, 'Nueva observación'),
(4, 'Inicio de sesión');

-- =============================================
-- Prioridades
-- =============================================
INSERT INTO Prioridad (Id, Nombre) VALUES
(1, 'Muy baja'),
(2, 'Baja'),
(3, 'Media'),
(4, 'Alta'),
(5, 'Crítica');

-- =============================================
-- TICKETS 
-- =============================================

-- Ticket 1: CRÍTICO - Problema con Consola de Audio - CERRADO
INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Prioridad, Estado, Id_Categoria, Fecha_Cierre, cumplimiento_respuesta, cumplimiento_resolucion) VALUES
(14, 'Consola de audio no responde en escenario principal', 
'La consola digital Behringer X32 del escenario principal dejó de responder. No hay salida de audio y el evento comienza en 30 minutos. Pantalla táctil congelada.', 
'2025-10-18 20:30:00', 5, 5, 1, '2025-01-19 00:15:00', TRUE, TRUE);

-- Ticket 2: CRÍTICO - Falla en Lámparas LED - RESUELTO
INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Prioridad, Estado, Id_Categoria, Fecha_Cierre, cumplimiento_respuesta, cumplimiento_resolucion) VALUES
(15, 'Falla masiva en lámparas LED del escenario', 
'15 de las 20 lámparas LED del escenario principal no encienden. El show comienza en 45 minutos. Posible problema en el dimmer.', 
'2025-10-18 21:00:00', 5, 4, 7, NULL, TRUE, FALSE);

-- Ticket 3: CRÍTICO - Desmayo - EN PROCESO
INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Prioridad, Estado, Id_Categoria, Fecha_Cierre, cumplimiento_respuesta, cumplimiento_resolucion) VALUES
(16, 'Desmayo en zona de pit - posible golpe de calor', 
'Mujer de aproximadamente 25 años se desmayó en el pit. Está consciente pero desorientada. Temperatura corporal elevada. Coordenadas: sector A, fila 5.', 
'2025-10-19 01:05:00', 5, 3, 19, NULL, TRUE, FALSE);

-- Ticket 4: ALTO - Pelea entre asistentes - CERRADO
INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Prioridad, Estado, Id_Categoria, Fecha_Cierre, cumplimiento_respuesta, cumplimiento_resolucion) VALUES
(17, 'Pelea entre asistentes en zona de tarima', 
'Pelea entre 4 personas cerca del escenario. Situación escalando. Requiero equipo de seguridad inmediatamente.', 
'2025-10-18 22:50:00', 5, 5, 16, '2025-01-18 23:10:00', TRUE, TRUE);

-- Ticket 5: MEDIO - Programación de luces - ASIGNADO
INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Prioridad, Estado, Id_Categoria, Fecha_Cierre, cumplimiento_respuesta, cumplimiento_resolucion) VALUES
(18, 'Ajuste de programación de luces para banda de rock', 
'Necesito que se ajuste la programación de luces según el rider técnico de la banda que se presenta mañana. Adjunto archivo con especificaciones.', 
'2025-10-18 10:30:00', 3, 2, 11, NULL, TRUE, FALSE);

-- Ticket 6: BAJO - Revisión de extintores - PENDIENTE
INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Prioridad, Estado, Id_Categoria, Fecha_Cierre, cumplimiento_respuesta, cumplimiento_resolucion) VALUES
(14, 'Revisión de extintores en backstage', 
'Solicito revisión de los extintores del área de backstage. Algunos tienen el precinto roto y no sé si están en buen estado.', 
'2025-10-19 01:30:00', 2, 1, 13, NULL, FALSE, FALSE);

-- =============================================
-- HISTORIAL DE ESTADOS
-- =============================================

-- Ticket 1: Consola de audio (Pendiente → Asignado → En Proceso → Resuelto → Cerrado)
INSERT INTO Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) VALUES
(1, '2025-10-18 20:30:00', 1, 1, 'Ticket creado por usuario', 14),
(1, '2025-10-18 20:32:00', 1, 2, 'Asignado automáticamente a técnico de audio con menor carga', 1),
(1, '2025-10-18 20:35:00', 2, 3, 'Técnico en camino al escenario principal', 3),
(1, '2025-10-18 23:45:00', 3, 4, 'Consola reiniciada. Problema de firmware resuelto. Audio funcionando correctamente.', 3),
(1, '2025-10-19 00:15:00', 4, 5, 'Usuario confirma que todo está funcionando. Evento culminó exitosamente.', 14);

-- Ticket 2: Lámparas LED (Pendiente → Asignado → En Proceso → Resuelto)
INSERT INTO Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) VALUES
(2, '2025-10-18 21:00:00', 1, 1, 'Ticket creado por usuario', 15),
(2, '2025-10-18 21:02:00', 1, 2, 'Asignado a técnico de iluminación', 1),
(2, '2025-10-18 21:05:00', 2, 3, 'Verificando dimmer principal. Fusible quemado detectado.', 5),
(2, '2025-10-18 23:50:00', 3, 4, 'Fusible reemplazado. 18 de 20 luces funcionando. 2 LED requieren cambio de módulo.', 5);

-- Ticket 3: Desmayo (Pendiente → Asignado → En Proceso)
INSERT INTO Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) VALUES
(3, '2025-10-19 01:05:00', 1, 1, 'Ticket creado - EMERGENCIA MÉDICA', 16),
(3, '2025-10-19 01:06:00', 1, 2, 'Paramédico despachado inmediatamente', 1),
(3, '2025-10-19 01:08:00', 2, 3, 'Paciente atendida. Signos vitales estables. Hidratando y enfriando.', 11);

-- Ticket 4: Pelea (Pendiente → Asignado → En Proceso → Resuelto → Cerrado)
INSERT INTO Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) VALUES
(4, '2025-10-18 22:50:00', 1, 1, 'Ticket creado - EMERGENCIA', 17),
(4, '2025-10-18 22:51:00', 1, 2, 'Equipo de seguridad en camino', 1),
(4, '2025-10-18 22:53:00', 2, 3, 'Separando a los involucrados. Situación bajo control.', 8),
(4, '2025-10-18 23:05:00', 3, 4, '4 personas expulsadas del evento. Área despejada.', 8),
(4, '2025-10-18 23:10:00', 4, 5, 'Situación resuelta rápidamente. Gracias!', 17);

-- Ticket 5: Programación de luces (Pendiente → Asignado)
INSERT INTO Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) VALUES
(5, '2025-10-18 10:30:00', 1, 1, 'Ticket creado', 18),
(5, '2025-10-18 11:00:00', 1, 2, 'Asignado manualmente a técnico especialista', 1);

-- Ticket 6: Extintores (Pendiente)
INSERT INTO Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) VALUES
(6, '2025-10-19 01:30:00', 1, 1, 'Ticket creado - Pendiente de asignación', 14);

-- =============================================
-- ASIGNACIONES
-- =============================================

-- Asignaciones Automáticas (Método 2)
INSERT INTO Asignacion (Id_Ticket, Id_Tecnico, Id_ReglaAutobriage, Fecha_Asignacion, Metodo_Asignacion, Prioridad) VALUES
(1, 3, NULL, '2025-10-18 20:32:00', 2, 5),  -- Miguel Ángel Torres (Audio)
(2, 5, NULL, '2025-10-18 21:02:00', 2, 5),  -- Diego Ramírez (Iluminación)
(3, 11, NULL, '2025-10-19 01:06:00', 2, 5); -- Carmen Ruiz (Paramédico)

-- Asignaciones Manuales (Método 1)
INSERT INTO Asignacion (Id_Ticket, Id_Tecnico, Id_ReglaAutobriage, Fecha_Asignacion, Metodo_Asignacion, Prioridad) VALUES
(4, 8, NULL, '2025-10-18 22:51:00', 1, 5),  -- Sofía Herrera (Seguridad)
(5, 5, NULL, '2025-10-18 11:00:00', 1, 3);  -- Diego Ramírez (Iluminación)

-- =============================================
-- VALORACIONES (Solo tickets cerrados: 1 y 4)
-- =============================================

INSERT INTO Valoracion (Id_Ticket, Id_Usuario, Puntaje, Comentario, Fecha_Valoracion) VALUES
(1, 14, 5, 'Excelente trabajo bajo presión. Resolvieron el problema justo a tiempo para el evento.', '2025-01-19 00:20:00'),
(4, 17, 5, 'Respuesta inmediata. Evitaron que la situación empeorara. Muy profesionales.', '2025-01-18 23:15:00');

-- =============================================
-- NOTIFICACIONES
-- =============================================

-- Notificaciones Ticket 1: Consola de audio
INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Fecha_Envio, Estado) VALUES
-- Asignación
(3, 1, 'Se te ha asignado el ticket #1: Consola de audio no responde en escenario principal', '2025-01-18 20:32:00', 1),
-- Cambios de estado
(14, 2, 'Tu ticket #1 ha cambiado a estado: Asignado', '2025-10-18 20:32:00', 1),
(14, 2, 'Tu ticket #1 ha cambiado a estado: En Proceso', '2025-10-18 20:35:00', 1),
(14, 2, 'Tu ticket #1 ha cambiado a estado: Resuelto', '2025-10-18 23:45:00', 1),
-- Nueva observación
(14, 3, 'Nuevo comentario en ticket #1: Consola reiniciada. Problema de firmware resuelto.', '2025-01-18 23:45:00', 1);

-- Notificaciones Ticket 2: Lámparas LED
INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Fecha_Envio, Estado) VALUES
-- Asignación
(5, 1, 'Se te ha asignado el ticket #2: Falla masiva en lámparas LED del escenario', '2025-01-18 21:02:00', 1),
-- Cambios de estado
(15, 2, 'Tu ticket #2 ha cambiado a estado: Asignado', '2025-10-18 21:02:00', 1),
(15, 2, 'Tu ticket #2 ha cambiado a estado: En Proceso', '2025-10-18 21:05:00', 1),
(15, 2, 'Tu ticket #2 ha cambiado a estado: Resuelto', '2025-10-18 23:50:00', 1),
-- Nueva observación
(15, 3, 'Nuevo comentario en ticket #2: Fusible reemplazado. 18 de 20 luces funcionando.', '2025-01-18 23:50:00', 1);

-- Notificaciones Ticket 3: Desmayo
INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Fecha_Envio, Estado) VALUES
-- Asignación
(11, 1, 'Se te ha asignado el ticket #3: Desmayo en zona de pit - EMERGENCIA', '2025-01-19 01:06:00', 1),
-- Cambios de estado
(16, 2, 'Tu ticket #3 ha cambiado a estado: Asignado', '2025-10-19 01:06:00', 1),
(16, 2, 'Tu ticket #3 ha cambiado a estado: En Proceso', '2025-10-19 01:08:00', 1),
-- Nueva observación
(16, 3, 'Nuevo comentario en ticket #3: Paciente atendida. Signos vitales estables.', '2025-10-19 01:08:00', 1);

-- Notificaciones Ticket 4: Pelea
INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Fecha_Envio, Estado) VALUES
-- Asignación
(8, 1, 'Se te ha asignado el ticket #4: Pelea entre asistentes - EMERGENCIA', '2025-01-18 22:51:00', 1),
-- Cambios de estado
(17, 2, 'Tu ticket #4 ha cambiado a estado: Asignado', '2025-10-18 22:51:00', 1),
(17, 2, 'Tu ticket #4 ha cambiado a estado: En Proceso', '2025-10-18 22:53:00', 1),
(17, 2, 'Tu ticket #4 ha cambiado a estado: Resuelto', '2025-10-18 23:05:00', 1),
-- Nueva observación
(17, 3, 'Nuevo comentario en ticket #4: 4 personas expulsadas del evento. Área despejada.', '2025-10-18 23:05:00', 1);

-- Notificaciones Ticket 5: Programación
INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Fecha_Envio, Estado) VALUES
-- Asignación
(5, 1, 'Se te ha asignado el ticket #5: Ajuste de programación de luces para banda', '2025-10-18 11:00:00', 1),
-- Cambio de estado
(18, 2, 'Tu ticket #5 ha cambiado a estado: Asignado', '2025-10-18 11:00:00', 1);

-- Notificaciones de Inicio de Sesión (ejemplos)
INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Fecha_Envio, Estado) VALUES
(3, 4, 'Inicio de sesión exitoso desde 192.168.1.100', '2025-10-18 20:30:00', 1),
(5, 4, 'Inicio de sesión exitoso desde 192.168.1.101', '2025-10-18 21:00:00', 1),
(11, 4, 'Inicio de sesión exitoso desde 192.168.1.102', '2025-10-19 01:05:00', 1),
(8, 4, 'Inicio de sesión exitoso desde 192.168.1.103', '2025-10-18 22:50:00', 1);

-- Insertar Imagenes
INSERT INTO Imagen (Imagen, Id_Historial) VALUES 
('extintor.jpg', 20),
('desmayo.jpg', 12),
('OIP.png', 5),
('documento.png', 18),
('pelea1.jpg', 13),
('pelea2.jpg', 13),
('lampara.png', 6);

-- Inserts para tabla Regla_Autotriage
-- Reglas ordenadas por urgencia (menor tiempo restante = mayor penalización por carga)

-- Regla 1: CRÍTICO - Menos de 1 hora restante
-- Alta penalización por carga para forzar distribución
INSERT INTO Regla_Autotriage (Horas_Faltantes, Peso_Prioridad_Ticket, Peso_Carga_Trabajo, Estado) 
VALUES (2, 4000, 10, 1);

-- Regla 2: ALTA Prioridad - Entre 1 y 4 horas
-- Penalización alta para priorizar técnicos disponibles
INSERT INTO Regla_Autotriage (Horas_Faltantes, Peso_Prioridad_Ticket, Peso_Carga_Trabajo, Estado) 
VALUES (4, 3000, 8, 1);

-- Regla 3: MEDIA PRIORIDAD - Entre 4 y 8 horas
-- Penalización media-alta
INSERT INTO Regla_Autotriage (Horas_Faltantes, Peso_Prioridad_Ticket, Peso_Carga_Trabajo, Estado) 
VALUES (8, 2000, 6, 1);

-- Regla 4: BAJA PRIORIDAD - Entre 8 y 24 horas
-- Penalización media para balance
INSERT INTO Regla_Autotriage (Horas_Faltantes, Peso_Prioridad_Ticket, Peso_Carga_Trabajo, Estado) 
VALUES (24, 1000, 4, 1);

-- Regla 5: MUY BAJA PRIORIDAD - Más de 24 horas
-- Penalización baja, permite acumular tickets
INSERT INTO Regla_Autotriage (Horas_Faltantes, Peso_Prioridad_Ticket , Peso_Carga_Trabajo, Estado) 
VALUES (48, 500, 2, 1);