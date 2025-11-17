-- =============================================
-- INSERTAR DATOS DE SLA SI NO EXISTEN
-- =============================================

-- Verificar y agregar SLAs
INSERT INTO SLA (Tiempo_Respuesta, Tiempo_Resolucion, Descripcion) 
SELECT 1, 4, 'Emergencias que afectan la operación del evento en curso'
WHERE NOT EXISTS (SELECT 1 FROM SLA WHERE Descripcion = 'Emergencias que afectan la operación del evento en curso');

INSERT INTO SLA (Tiempo_Respuesta, Tiempo_Resolucion, Descripcion) 
SELECT 2, 8, 'Problemas importantes que afectan funcionalidades principales'
WHERE NOT EXISTS (SELECT 1 FROM SLA WHERE Descripcion = 'Problemas importantes que afectan funcionalidades principales');

INSERT INTO SLA (Tiempo_Respuesta, Tiempo_Resolucion, Descripcion) 
SELECT 4, 24, 'Problemas moderados que requieren atención'
WHERE NOT EXISTS (SELECT 1 FROM SLA WHERE Descripcion = 'Problemas moderados que requieren atención');

INSERT INTO SLA (Tiempo_Respuesta, Tiempo_Resolucion, Descripcion) 
SELECT 8, 48, 'Problemas menores o consultas generales'
WHERE NOT EXISTS (SELECT 1 FROM SLA WHERE Descripcion = 'Problemas menores o consultas generales');

-- Verificar los datos insertados
SELECT * FROM SLA;
