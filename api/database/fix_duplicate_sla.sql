-- =============================================
-- SCRIPT PARA ELIMINAR SLAs DUPLICADOS
-- =============================================

-- Crear una tabla temporal con los SLAs únicos que queremos mantener
CREATE TEMPORARY TABLE temp_sla_unique AS
SELECT 
    MIN(Id) as Id,
    Tiempo_Respuesta,
    Tiempo_Resolucion,
    Descripcion
FROM SLA
GROUP BY Tiempo_Respuesta, Tiempo_Resolucion, Descripcion;

-- Actualizar las referencias en la tabla Categoria para que apunten a los IDs únicos
UPDATE Categoria c
INNER JOIN SLA s ON c.Id_SLA = s.Id
INNER JOIN temp_sla_unique t ON s.Tiempo_Respuesta = t.Tiempo_Respuesta 
    AND s.Tiempo_Resolucion = t.Tiempo_Resolucion 
    AND s.Descripcion = t.Descripcion
SET c.Id_SLA = t.Id
WHERE c.Id_SLA != t.Id;

-- Eliminar los SLAs duplicados (conservar solo el de menor ID de cada grupo)
DELETE s FROM SLA s
LEFT JOIN temp_sla_unique t ON s.Id = t.Id
WHERE t.Id IS NULL;

-- Limpiar la tabla temporal
DROP TEMPORARY TABLE temp_sla_unique;

-- Verificar los SLAs restantes
SELECT * FROM SLA ORDER BY Id;
