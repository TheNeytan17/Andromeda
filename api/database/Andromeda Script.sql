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

CREATE TABLE Ticket (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Usuario INT,
    Titulo VARCHAR(150) NOT NULL,
    Descripcion TEXT NOT NULL,
    Fecha_Creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Prioridad INT NOT NULL,
    Estado Int Not null,
    Id_Categoria INT NOT NULL,
    Fecha_Cierre DATETIME NULL,
    cumplimiento_respuesta BOOLEAN DEFAULT FALSE,
    cumplimiento_resolucion BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Id_Categoria) REFERENCES Categoria(Id),
    FOREIGN KEY (Estado) REFERENCES Estado_Ticket(Id),
    FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id)
);

CREATE TABLE Historial_Estado (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Ticket INT NOT NULL,
    Fecha_Cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado_Anterior Int Not Null,
    Estado_Nuevo Int Not Null,
    Observaciones VARCHAR(250),
    Id_Usuario_Responsable INT,
    FOREIGN KEY (Id_Ticket) REFERENCES Ticket(Id),
    FOREIGN KEY (Estado_Anterior) REFERENCES Estado_Ticket(Id),
    FOREIGN KEY (Estado_Nuevo) REFERENCES Estado_Ticket(Id),
    FOREIGN KEY (Id_Usuario_Responsable) REFERENCES Usuario(Id)
);

CREATE TABLE Imagen (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Imagen MEDIUMBLOB NOT NULL, -- Array de Bits para guardar la imagen
    Id_Historial INT NOT NULL,
    FOREIGN KEY (Id_Historial) REFERENCES Historial_Estado(Id)
);

CREATE TABLE Regla_Autotriage (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Prioridad_Ticket INT Not null,
    Prioridad_Sla Decimal Not null,
    Peso_Carga_Trabajo BOOLEAN DEFAULT TRUE,
    Criterio_especialidad BOOLEAN DEFAULT TRUE,
    Peso_Especialidad DECIMAL not null,
    Puntaje_Prioridad Decimal Not Null,
    Estado BOOLEAN DEFAULT TRUE
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
-- RESUMEN DE DATOS INSERTADOS
-- =============================================
-- Roles: 3 (Administrador, Técnico, Usuario Final)
-- Especialidades: 12 (3 Audio, 3 Visual, 3 Seguridad, 3 Médicas)
-- Usuarios: 17 (2 Admin, 11 Técnicos, 4 Usuarios Finales)
-- Técnicos con Especialidades: 11 técnicos con 22 asignaciones
-- 
-- Distribución por Área:
--   - Audio: 2 técnicos
--   - Iluminación/Visual: 3 técnicos
--   - Seguridad: 3 técnicos
--   - Médica: 3 técnicos
-- =============================================