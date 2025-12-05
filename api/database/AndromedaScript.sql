-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: andromeda
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB
CREATE DATABASE andromeda;
USE andromeda;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asignacion`
--

DROP TABLE IF EXISTS `asignacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Ticket` int(11) NOT NULL,
  `Id_Tecnico` int(11) NOT NULL,
  `Id_ReglaAutobriage` int(11) DEFAULT NULL,
  `Fecha_Asignacion` datetime DEFAULT current_timestamp(),
  `Metodo_Asignacion` int(11) NOT NULL,
  `Prioridad` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Ticket` (`Id_Ticket`),
  KEY `Id_Tecnico` (`Id_Tecnico`),
  KEY `Id_ReglaAutobriage` (`Id_ReglaAutobriage`),
  KEY `Metodo_Asignacion` (`Metodo_Asignacion`),
  CONSTRAINT `asignacion_ibfk_1` FOREIGN KEY (`Id_Ticket`) REFERENCES `ticket` (`Id`),
  CONSTRAINT `asignacion_ibfk_2` FOREIGN KEY (`Id_Tecnico`) REFERENCES `usuario` (`Id`),
  CONSTRAINT `asignacion_ibfk_3` FOREIGN KEY (`Id_ReglaAutobriage`) REFERENCES `regla_autotriage` (`Id`),
  CONSTRAINT `asignacion_ibfk_4` FOREIGN KEY (`Metodo_Asignacion`) REFERENCES `metodo_asignacion` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion`
--

LOCK TABLES `asignacion` WRITE;
/*!40000 ALTER TABLE `asignacion` DISABLE KEYS */;
INSERT INTO `asignacion` VALUES (1,1,3,NULL,'2025-10-18 20:32:00',2,5),(2,2,5,NULL,'2025-10-18 21:02:00',2,5),(3,3,11,NULL,'2025-10-19 01:06:00',2,5),(4,4,8,NULL,'2025-10-18 22:51:00',1,5),(5,5,5,NULL,'2025-10-18 11:00:00',1,3);
/*!40000 ALTER TABLE `asignacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Id_SLA` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_SLA` (`Id_SLA`),
  CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`Id_SLA`) REFERENCES `sla` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Problema con Consola de Audio',1),(2,'Falla en Micrófonos',1),(3,'Problema con Bocinas/Monitores',1),(4,'Cables de Conexión Dañados',2),(5,'Interferencia de Audio',2),(6,'Mantenimiento de Equipo de Sonido',3),(7,'Falla en Lámparas LED',1),(8,'Problema con Pantallas/Proyectores',1),(9,'Falla en Máquinas de Humo/Efectos',2),(10,'Problema con Controladores de Luces',1),(11,'Programación de Iluminación',3),(12,'Instalación de Equipo Visual',3),(13,'Problema en Entradas Principales',1),(14,'Incidente en Zonas VIP',1),(15,'Falla en Barreras y Controles',2),(16,'Incidente con Asistentes',1),(17,'Objetos Prohibidos Detectados',2),(18,'Control de Aforo',2),(19,'Desmayo / Golpe de Calor',1),(20,'Caída / Lesión',1),(21,'Reacción Alérgica',1),(22,'Intoxicación por Alcohol/Sustancias',1),(23,'Atención Médica General',2),(24,'Consulta Médica Preventiva',3);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_especialidad`
--

DROP TABLE IF EXISTS `categoria_especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_especialidad` (
  `Id_Categoria` int(11) NOT NULL,
  `Id_Especialidad` int(11) NOT NULL,
  PRIMARY KEY (`Id_Categoria`,`Id_Especialidad`),
  KEY `Id_Especialidad` (`Id_Especialidad`),
  CONSTRAINT `categoria_especialidad_ibfk_1` FOREIGN KEY (`Id_Categoria`) REFERENCES `categoria` (`Id`),
  CONSTRAINT `categoria_especialidad_ibfk_2` FOREIGN KEY (`Id_Especialidad`) REFERENCES `especialidad` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_especialidad`
--

LOCK TABLES `categoria_especialidad` WRITE;
/*!40000 ALTER TABLE `categoria_especialidad` DISABLE KEYS */;
INSERT INTO `categoria_especialidad` VALUES (1,1),(1,2),(2,1),(2,2),(3,1),(3,2),(4,1),(4,3),(5,2),(6,1),(6,3),(7,4),(7,5),(8,3),(8,6),(9,6),(10,4),(11,4),(12,5),(12,6),(13,7),(13,9),(14,7),(14,9),(15,7),(15,8),(16,7),(16,8),(17,7),(17,9),(18,8),(18,9),(19,10),(19,11),(19,12),(20,10),(20,11),(20,12),(21,10),(21,12),(22,10),(22,12),(23,10),(23,11),(24,12);
/*!40000 ALTER TABLE `categoria_especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_etiqueta`
--

DROP TABLE IF EXISTS `categoria_etiqueta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_etiqueta` (
  `Id_Categoria` int(11) NOT NULL,
  `Id_Etiqueta` int(11) NOT NULL,
  PRIMARY KEY (`Id_Categoria`,`Id_Etiqueta`),
  KEY `Id_Etiqueta` (`Id_Etiqueta`),
  CONSTRAINT `categoria_etiqueta_ibfk_1` FOREIGN KEY (`Id_Etiqueta`) REFERENCES `etiqueta` (`Id`),
  CONSTRAINT `categoria_etiqueta_ibfk_2` FOREIGN KEY (`Id_Categoria`) REFERENCES `categoria` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_etiqueta`
--

LOCK TABLES `categoria_etiqueta` WRITE;
/*!40000 ALTER TABLE `categoria_etiqueta` DISABLE KEYS */;
INSERT INTO `categoria_etiqueta` VALUES (1,1),(1,17),(1,18),(2,2),(2,17),(2,18),(3,3),(3,17),(3,18),(4,4),(4,19),(5,1),(5,2),(6,1),(6,19),(7,5),(7,17),(7,18),(8,6),(8,17),(8,18),(9,7),(9,18),(10,8),(10,17),(10,18),(11,5),(11,8),(12,6),(12,20),(13,9),(13,17),(14,10),(14,17),(15,11),(16,12),(16,17),(17,12),(18,9),(18,11),(19,13),(19,17),(20,14),(20,17),(21,15),(21,17),(22,16),(22,17),(23,13),(23,14),(24,13),(24,15);
/*!40000 ALTER TABLE `categoria_etiqueta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidad`
--

DROP TABLE IF EXISTS `especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidad` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Descripcion` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidad`
--

LOCK TABLES `especialidad` WRITE;
/*!40000 ALTER TABLE `especialidad` DISABLE KEYS */;
INSERT INTO `especialidad` VALUES (1,'Técnico de audio en vivo','Operación y configuración de sistemas de sonido durante eventos en vivo'),(2,'Ingeniería de sonido','Diseño, mezcla y optimización de audio para producciones en vivo'),(3,'Mantenimiento de equipos electrónicos','Reparación y mantenimiento preventivo de equipos de audio, video e iluminación'),(4,'Técnico en iluminación de espectáculos','Operación y programación de sistemas de iluminación para eventos'),(5,'Electricista especializado en eventos','Instalación y mantenimiento eléctrico para montajes de eventos'),(6,'Operador de efectos visuales','Manejo de pantallas LED, proyecciones y efectos especiales visuales'),(7,'Seguridad privada','Vigilancia y protección de instalaciones, equipos y asistentes'),(8,'Control de multitudes','Gestión y organización del flujo de personas en eventos masivos'),(9,'Coordinador de accesos','Control de entradas, acreditaciones y zonas restringidas'),(10,'Paramédico','Atención de emergencias médicas durante eventos'),(11,'Personal de primeros auxilios','Asistencia básica de salud y primeros auxilios'),(12,'Médico de guardia','Atención médica profesional y coordinación de emergencias sanitarias');
/*!40000 ALTER TABLE `especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_ticket`
--

DROP TABLE IF EXISTS `estado_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_ticket` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_ticket`
--

LOCK TABLES `estado_ticket` WRITE;
/*!40000 ALTER TABLE `estado_ticket` DISABLE KEYS */;
INSERT INTO `estado_ticket` VALUES (1,'Pendiente'),(2,'Asignado'),(3,'En Proceso'),(4,'Resuelto'),(5,'Cerrado');
/*!40000 ALTER TABLE `estado_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etiqueta`
--

DROP TABLE IF EXISTS `etiqueta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etiqueta` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etiqueta`
--

LOCK TABLES `etiqueta` WRITE;
/*!40000 ALTER TABLE `etiqueta` DISABLE KEYS */;
INSERT INTO `etiqueta` VALUES (1,'Consola de audio'),(2,'Micrófonos'),(3,'Bocinas / monitores de escenario'),(4,'Cables de conexión'),(5,'Lámparas LED'),(6,'Pantallas / proyectores'),(7,'Máquinas de humo / efectos visuales'),(8,'Controladores de luces'),(9,'Entradas principales'),(10,'Zonas VIP'),(11,'Barreras y controles de ingreso'),(12,'Objetos prohibidos / incidentes con asistentes'),(13,'Desmayos / golpes de calor'),(14,'Caídas / lesiones'),(15,'Reacciones alérgicas'),(16,'Intoxicaciones por alcohol / sustancias'),(17,'Urgente'),(18,'Evento en Vivo'),(19,'Mantenimiento'),(20,'Instalación');
/*!40000 ALTER TABLE `etiqueta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estado`
--

DROP TABLE IF EXISTS `historial_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estado` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Ticket` int(11) NOT NULL,
  `Fecha_Cambio` datetime DEFAULT current_timestamp(),
  `Estado_Anterior` int(11) NOT NULL,
  `Estado_Nuevo` int(11) NOT NULL,
  `Observaciones` varchar(250) DEFAULT NULL,
  `Id_Usuario_Responsable` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Ticket` (`Id_Ticket`),
  KEY `Estado_Anterior` (`Estado_Anterior`),
  KEY `Estado_Nuevo` (`Estado_Nuevo`),
  KEY `Id_Usuario_Responsable` (`Id_Usuario_Responsable`),
  CONSTRAINT `historial_estado_ibfk_1` FOREIGN KEY (`Id_Ticket`) REFERENCES `ticket` (`Id`),
  CONSTRAINT `historial_estado_ibfk_2` FOREIGN KEY (`Estado_Anterior`) REFERENCES `estado_ticket` (`Id`),
  CONSTRAINT `historial_estado_ibfk_3` FOREIGN KEY (`Estado_Nuevo`) REFERENCES `estado_ticket` (`Id`),
  CONSTRAINT `historial_estado_ibfk_4` FOREIGN KEY (`Id_Usuario_Responsable`) REFERENCES `usuario` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estado`
--

LOCK TABLES `historial_estado` WRITE;
/*!40000 ALTER TABLE `historial_estado` DISABLE KEYS */;
INSERT INTO `historial_estado` VALUES (1,1,'2025-10-18 20:30:00',1,1,'Ticket creado por usuario',14),(2,1,'2025-10-18 20:32:00',1,2,'Asignado automáticamente a técnico de audio con menor carga',1),(3,1,'2025-10-18 20:35:00',2,3,'Técnico en camino al escenario principal',3),(4,1,'2025-10-18 23:45:00',3,4,'Consola reiniciada. Problema de firmware resuelto. Audio funcionando correctamente.',3),(5,1,'2025-10-19 00:15:00',4,5,'Usuario confirma que todo está funcionando. Evento culminó exitosamente.',14),(6,2,'2025-10-18 21:00:00',1,1,'Ticket creado por usuario',15),(7,2,'2025-10-18 21:02:00',1,2,'Asignado a técnico de iluminación',1),(8,2,'2025-10-18 21:05:00',2,3,'Verificando dimmer principal. Fusible quemado detectado.',5),(9,2,'2025-10-18 23:50:00',3,4,'Fusible reemplazado. 18 de 20 luces funcionando. 2 LED requieren cambio de módulo.',5),(10,3,'2025-10-19 01:05:00',1,1,'Ticket creado - EMERGENCIA MÉDICA',16),(11,3,'2025-10-19 01:06:00',1,2,'Paramédico despachado inmediatamente',1),(12,3,'2025-10-19 01:08:00',2,3,'Paciente atendida. Signos vitales estables. Hidratando y enfriando.',11),(13,4,'2025-10-18 22:50:00',1,1,'Ticket creado - EMERGENCIA',17),(14,4,'2025-10-18 22:51:00',1,2,'Equipo de seguridad en camino',1),(15,4,'2025-10-18 22:53:00',2,3,'Separando a los involucrados. Situación bajo control.',8),(16,4,'2025-10-18 23:05:00',3,4,'4 personas expulsadas del evento. Área despejada.',8),(17,4,'2025-10-18 23:10:00',4,5,'Situación resuelta rápidamente. Gracias!',17),(18,5,'2025-10-18 10:30:00',1,1,'Ticket creado',18),(19,5,'2025-10-18 11:00:00',1,2,'Asignado manualmente a técnico especialista',1),(20,6,'2025-10-19 01:30:00',1,1,'Ticket creado - Pendiente de asignación',14);
/*!40000 ALTER TABLE `historial_estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagen`
--

DROP TABLE IF EXISTS `imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagen` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Imagen` varchar(100) NOT NULL,
  `Id_Historial` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Historial` (`Id_Historial`),
  CONSTRAINT `imagen_ibfk_1` FOREIGN KEY (`Id_Historial`) REFERENCES `historial_estado` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagen`
--

LOCK TABLES `imagen` WRITE;
/*!40000 ALTER TABLE `imagen` DISABLE KEYS */;
INSERT INTO `imagen` VALUES (1,'extintor.jpg',20),(2,'desmayo.jpg',12),(3,'OIP.png',5),(4,'documento.png',18),(5,'pelea1.jpg',13),(6,'pelea2.jpg',13),(7,'lampara.png',6);
/*!40000 ALTER TABLE `imagen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_asignacion`
--

DROP TABLE IF EXISTS `metodo_asignacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_asignacion` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_asignacion`
--

LOCK TABLES `metodo_asignacion` WRITE;
/*!40000 ALTER TABLE `metodo_asignacion` DISABLE KEYS */;
INSERT INTO `metodo_asignacion` VALUES (1,'Manual'),(2,'Automático');
/*!40000 ALTER TABLE `metodo_asignacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Usuario_Destino` int(11) NOT NULL,
  `Tipo_Notificacion` int(11) NOT NULL,
  `Mensaje` text DEFAULT NULL,
  `Fecha_Envio` datetime DEFAULT current_timestamp(),
  `Estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Usuario_Destino` (`Id_Usuario_Destino`),
  KEY `Tipo_Notificacion` (`Tipo_Notificacion`),
  CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`Id_Usuario_Destino`) REFERENCES `usuario` (`Id`),
  CONSTRAINT `notificacion_ibfk_2` FOREIGN KEY (`Tipo_Notificacion`) REFERENCES `tipo_notificacion` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
INSERT INTO `notificacion` VALUES (1,3,1,'Se te ha asignado el ticket #1: Consola de audio no responde en escenario principal','2025-01-18 20:32:00',1),(2,14,2,'Tu ticket #1 ha cambiado a estado: Asignado','2025-10-18 20:32:00',1),(3,14,2,'Tu ticket #1 ha cambiado a estado: En Proceso','2025-10-18 20:35:00',1),(4,14,2,'Tu ticket #1 ha cambiado a estado: Resuelto','2025-10-18 23:45:00',1),(5,14,3,'Nuevo comentario en ticket #1: Consola reiniciada. Problema de firmware resuelto.','2025-01-18 23:45:00',1),(6,5,1,'Se te ha asignado el ticket #2: Falla masiva en lámparas LED del escenario','2025-01-18 21:02:00',1),(7,15,2,'Tu ticket #2 ha cambiado a estado: Asignado','2025-10-18 21:02:00',1),(8,15,2,'Tu ticket #2 ha cambiado a estado: En Proceso','2025-10-18 21:05:00',1),(9,15,2,'Tu ticket #2 ha cambiado a estado: Resuelto','2025-10-18 23:50:00',1),(10,15,3,'Nuevo comentario en ticket #2: Fusible reemplazado. 18 de 20 luces funcionando.','2025-01-18 23:50:00',1),(11,11,1,'Se te ha asignado el ticket #3: Desmayo en zona de pit - EMERGENCIA','2025-01-19 01:06:00',1),(12,16,2,'Tu ticket #3 ha cambiado a estado: Asignado','2025-10-19 01:06:00',1),(13,16,2,'Tu ticket #3 ha cambiado a estado: En Proceso','2025-10-19 01:08:00',1),(14,16,3,'Nuevo comentario en ticket #3: Paciente atendida. Signos vitales estables.','2025-10-19 01:08:00',1),(15,8,1,'Se te ha asignado el ticket #4: Pelea entre asistentes - EMERGENCIA','2025-01-18 22:51:00',1),(16,17,2,'Tu ticket #4 ha cambiado a estado: Asignado','2025-10-18 22:51:00',1),(17,17,2,'Tu ticket #4 ha cambiado a estado: En Proceso','2025-10-18 22:53:00',1),(18,17,2,'Tu ticket #4 ha cambiado a estado: Resuelto','2025-10-18 23:05:00',1),(19,17,3,'Nuevo comentario en ticket #4: 4 personas expulsadas del evento. Área despejada.','2025-10-18 23:05:00',1),(20,5,1,'Se te ha asignado el ticket #5: Ajuste de programación de luces para banda','2025-10-18 11:00:00',1),(21,18,2,'Tu ticket #5 ha cambiado a estado: Asignado','2025-10-18 11:00:00',1),(22,3,4,'Inicio de sesión exitoso desde 192.168.1.100','2025-10-18 20:30:00',1),(23,5,4,'Inicio de sesión exitoso desde 192.168.1.101','2025-10-18 21:00:00',1),(24,11,4,'Inicio de sesión exitoso desde 192.168.1.102','2025-10-19 01:05:00',1),(25,8,4,'Inicio de sesión exitoso desde 192.168.1.103','2025-10-18 22:50:00',1),(26,14,1,'Se te ha asignado el ticket #5: Problema con impresora de red','2025-12-03 13:19:21',0),(27,14,2,'Tu ticket #3 ha cambiado de estado: Abierto → En Proceso','2025-12-03 13:19:21',0),(28,14,3,'Nuevo comentario en ticket #2: Hemos identificado el problema y estamos trabajando en la solución','2025-12-03 13:19:21',0),(29,14,4,'Inicio de sesión exitoso desde 192.168.1.100','2025-12-03 13:19:21',1),(30,14,4,'Inicio de sesión exitoso desde ::1','2025-12-03 13:58:57',1),(31,14,4,'Inicio de sesión exitoso desde ::1','2025-12-03 14:00:55',1),(32,14,4,'Inicio de sesión exitoso desde ::1','2025-12-03 18:25:14',1),(33,14,4,'Inicio de sesión exitoso desde ::1','2025-12-03 18:30:28',1),(34,14,4,'Inicio de sesión exitoso desde ::1','2025-12-03 18:34:44',1),(35,14,4,'Inicio de sesión exitoso desde ::1','2025-12-03 22:20:54',1),(36,14,4,'Inicio de sesión exitoso el 04/12/2025 a las 06:35:26 desde la IP ::1','2025-12-03 23:35:26',0),(37,14,4,'Inicio de sesión exitoso el 05/12/2025 a las 00:51:51 desde la IP ::1','2025-12-04 17:51:51',0),(38,1,4,'Inicio de sesión exitoso el 05/12/2025 a las 01:07:08 desde la IP ::1','2025-12-04 18:07:08',1),(39,14,4,'Inicio de sesión exitoso el 05/12/2025 a las 01:17:18 desde la IP ::1','2025-12-04 18:17:18',0),(40,1,4,'Inicio de sesión exitoso el 05/12/2025 a las 01:18:13 desde la IP ::1','2025-12-04 18:18:13',0),(41,1,4,'Inicio de sesión exitoso el 05/12/2025 a las 03:15:47 desde la IP ::1','2025-12-04 20:15:47',0);
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prioridad`
--

DROP TABLE IF EXISTS `prioridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prioridad` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prioridad`
--

LOCK TABLES `prioridad` WRITE;
/*!40000 ALTER TABLE `prioridad` DISABLE KEYS */;
INSERT INTO `prioridad` VALUES (1,'Muy baja'),(2,'Baja'),(3,'Media'),(4,'Alta'),(5,'Crítica');
/*!40000 ALTER TABLE `prioridad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regla_autotriage`
--

DROP TABLE IF EXISTS `regla_autotriage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regla_autotriage` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Horas_Faltantes` int(11) NOT NULL,
  `Peso_Prioridad_Ticket` int(11) NOT NULL,
  `Peso_Carga_Trabajo` int(11) NOT NULL,
  `Estado` int(11) DEFAULT 1,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regla_autotriage`
--

LOCK TABLES `regla_autotriage` WRITE;
/*!40000 ALTER TABLE `regla_autotriage` DISABLE KEYS */;
INSERT INTO `regla_autotriage` VALUES (1,2,4000,10,1),(2,4,3000,8,1),(3,8,2000,6,1),(4,24,1000,4,1),(5,48,500,2,1);
/*!40000 ALTER TABLE `regla_autotriage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador'),(2,'Técnico'),(3,'Cliente');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sla`
--

DROP TABLE IF EXISTS `sla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Tiempo_Respuesta` int(11) NOT NULL,
  `Tiempo_Resolucion` int(11) NOT NULL,
  `Descripcion` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla`
--

LOCK TABLES `sla` WRITE;
/*!40000 ALTER TABLE `sla` DISABLE KEYS */;
INSERT INTO `sla` VALUES (1,1,4,'Emergencias que afectan la operación del evento en curso'),(2,2,8,'Problemas importantes que afectan funcionalidades principales'),(3,4,24,'Problemas moderados que requieren atención'),(4,8,48,'Problemas menores o consultas generales');
/*!40000 ALTER TABLE `sla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnico`
--

DROP TABLE IF EXISTS `tecnico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tecnico` (
  `Id_Usuario` int(11) NOT NULL,
  `Id_Especialidad` int(11) NOT NULL,
  PRIMARY KEY (`Id_Usuario`,`Id_Especialidad`),
  KEY `Id_Especialidad` (`Id_Especialidad`),
  CONSTRAINT `tecnico_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id`),
  CONSTRAINT `tecnico_ibfk_2` FOREIGN KEY (`Id_Especialidad`) REFERENCES `especialidad` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnico`
--

LOCK TABLES `tecnico` WRITE;
/*!40000 ALTER TABLE `tecnico` DISABLE KEYS */;
INSERT INTO `tecnico` VALUES (3,1),(3,3),(4,1),(4,2),(5,4),(5,6),(6,3),(6,5),(7,4),(7,6),(8,7),(8,8),(9,8),(9,9),(10,7),(10,9),(11,10),(11,11),(12,10),(12,12),(13,10),(13,11);
/*!40000 ALTER TABLE `tecnico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Titulo` varchar(150) NOT NULL,
  `Descripcion` text NOT NULL,
  `Fecha_Creacion` datetime DEFAULT current_timestamp(),
  `Fecha_Limite_Respuesta` datetime DEFAULT NULL,
  `Fecha_Limite_Resolucion` datetime DEFAULT NULL,
  `Prioridad` int(11) NOT NULL,
  `Estado` int(11) NOT NULL,
  `Id_Categoria` int(11) NOT NULL,
  `Fecha_Cierre` datetime DEFAULT NULL,
  `Puntaje` double DEFAULT NULL,
  `cumplimiento_respuesta` tinyint(1) DEFAULT 0,
  `cumplimiento_resolucion` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`Id`),
  KEY `Id_Categoria` (`Id_Categoria`),
  KEY `Estado` (`Estado`),
  KEY `Id_Usuario` (`Id_Usuario`),
  KEY `Prioridad` (`Prioridad`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`Id_Categoria`) REFERENCES `categoria` (`Id`),
  CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`Estado`) REFERENCES `estado_ticket` (`Id`),
  CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id`),
  CONSTRAINT `ticket_ibfk_4` FOREIGN KEY (`Prioridad`) REFERENCES `prioridad` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (1,14,'Consola de audio no responde en escenario principal','La consola digital Behringer X32 del escenario principal dejó de responder. No hay salida de audio y el evento comienza en 30 minutos. Pantalla táctil congelada.','2025-10-18 20:30:00',NULL,NULL,5,5,1,'2025-01-19 00:15:00',NULL,1,1),(2,15,'Falla masiva en lámparas LED del escenario','15 de las 20 lámparas LED del escenario principal no encienden. El show comienza en 45 minutos. Posible problema en el dimmer.','2025-10-18 21:00:00',NULL,NULL,5,4,7,NULL,NULL,1,0),(3,16,'Desmayo en zona de pit - posible golpe de calor','Mujer de aproximadamente 25 años se desmayó en el pit. Está consciente pero desorientada. Temperatura corporal elevada. Coordenadas: sector A, fila 5.','2025-10-19 01:05:00',NULL,NULL,5,3,19,NULL,NULL,1,0),(4,17,'Pelea entre asistentes en zona de tarima','Pelea entre 4 personas cerca del escenario. Situación escalando. Requiero equipo de seguridad inmediatamente.','2025-10-18 22:50:00',NULL,NULL,5,5,16,'2025-01-18 23:10:00',NULL,1,1),(5,18,'Ajuste de programación de luces para banda de rock','Necesito que se ajuste la programación de luces según el rider técnico de la banda que se presenta mañana. Adjunto archivo con especificaciones.','2025-10-18 10:30:00',NULL,NULL,3,2,11,NULL,NULL,1,0),(6,14,'Revisión de extintores en backstage','Solicito revisión de los extintores del área de backstage. Algunos tienen el precinto roto y no sé si están en buen estado.','2025-10-19 01:30:00',NULL,NULL,2,1,13,NULL,NULL,0,0);
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_notificacion`
--

DROP TABLE IF EXISTS `tipo_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_notificacion` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_notificacion`
--

LOCK TABLES `tipo_notificacion` WRITE;
/*!40000 ALTER TABLE `tipo_notificacion` DISABLE KEYS */;
INSERT INTO `tipo_notificacion` VALUES (1,'Asignación de ticket'),(2,'Cambio de estado'),(3,'Nueva observación'),(4,'Inicio de sesión');
/*!40000 ALTER TABLE `tipo_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `PasswordHash` varchar(100) NOT NULL,
  `Ultima_Sesion` datetime DEFAULT NULL,
  `Rol` int(11) NOT NULL,
  `Estado` tinyint(1) NOT NULL,
  `CargaTrabajo` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Rol` (`Rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`Rol`) REFERENCES `rol` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Neitan Morales','nmorales@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-12-05 03:15:47',1,1,0),(2,'Naomy Díaz','Ndias@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 23:30:00',1,1,0),(3,'Miguel Ángel Torres','miguel.torres@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 01:20:00',2,1,5),(4,'Laura Martínez','laura.martinez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 01:10:00',2,1,3),(5,'Diego Ramírez','diego.ramirez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 00:55:00',2,1,7),(6,'Patricia Gómez','patricia.gomez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 23:40:00',2,1,4),(7,'Fernando Castro','fernando.castro@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 01:05:00',2,1,6),(8,'Sofía Herrera','sofia.herrera@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 22:50:00',2,1,6),(9,'Javier Morales','javier.morales@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 00:30:00',2,1,4),(10,'Ricardo Vega','ricardo.vega@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 01:15:00',2,1,5),(11,'Carmen Ruiz','carmen.ruiz@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 01:00:00',2,1,2),(12,'Dr. Alberto Méndez','alberto.mendez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-17 00:45:00',2,1,3),(13,'Elena Campos','elena.campos@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 23:55:00',2,1,4),(14,'Juan Pérez','juan.perez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-12-05 01:17:18',3,1,NULL),(15,'María González','maria.gonzalez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 20:15:00',3,1,NULL),(16,'Pedro Jiménez','pedro.jimenez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 17:45:00',3,1,NULL),(17,'Lucía Fernández','lucia.fernandez@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 19:30:00',3,1,NULL),(18,'Valentina Ortiz','valentina.ortiz@andromeda.com','$2y$10$y/x1fRMKYAGIh/LkHIa2nuLa6nwJLjqgDO9nSR5rNJ4Y52czydvJu','2025-10-16 16:50:00',3,1,NULL);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valoracion`
--

DROP TABLE IF EXISTS `valoracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valoracion` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Ticket` int(11) NOT NULL,
  `Id_Usuario` int(11) NOT NULL,
  `Puntaje` int(11) DEFAULT NULL,
  `Comentario` varchar(250) DEFAULT NULL,
  `Fecha_Valoracion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_Ticket` (`Id_Ticket`),
  KEY `Id_Usuario` (`Id_Usuario`),
  CONSTRAINT `valoracion_ibfk_1` FOREIGN KEY (`Id_Ticket`) REFERENCES `ticket` (`Id`),
  CONSTRAINT `valoracion_ibfk_2` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`Puntaje` between 1 and 5)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoracion`
--

LOCK TABLES `valoracion` WRITE;
/*!40000 ALTER TABLE `valoracion` DISABLE KEYS */;
INSERT INTO `valoracion` VALUES (1,1,14,5,'Excelente trabajo bajo presión. Resolvieron el problema justo a tiempo para el evento.','2025-01-19 00:20:00'),(2,4,17,5,'Respuesta inmediata. Evitaron que la situación empeorara. Muy profesionales.','2025-01-18 23:15:00');
/*!40000 ALTER TABLE `valoracion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 20:26:34
