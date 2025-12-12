<?php
class IAModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    function callAI($prompt, $conversationHistory = [])
    {
        $url = 'http://localhost:11434/api/generate';
        
        // Si hay historial de conversación, construir un contexto completo
        $fullPrompt = $prompt;
        if (!empty($conversationHistory)) {
            $contextText = "Contexto de la conversación previa:\n";
            foreach ($conversationHistory as $msg) {
                $role = $msg['role'] === 'user' ? 'Usuario' : 'Asistente';
                $content = $msg['content'] ?? '';
                $contextText .= "$role: " . substr($content, 0, 500) . "\n";
            }
            $fullPrompt = $contextText . "\nNueva pregunta:\n" . $prompt;
        }
        
        $data = [
            'model' => 'llama3:8b-instruct-q6_K',
            'prompt' => $fullPrompt,
            'stream' => false,
            'options' => [
                'temperature' => 0.7,
                'top_p' => 0.9,
                'top_k' => 40,
                'num_predict' => 2048
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 120);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            error_log("Error Ollama: " . $error);
            return 'Error al conectar con la IA. Asegúrate de que Ollama esté ejecutándose.';
        }
        
        if ($httpCode !== 200) {
            error_log("HTTP Error Ollama: " . $httpCode . " - " . $response);
            return 'La IA no está disponible. Verifica que Ollama esté corriendo y el modelo instalado.';
        }

        $result = json_decode($response, true);
        
        if (!isset($result['response'])) {
            error_log("Respuesta Ollama sin campo 'response': " . print_r($result, true));
            return 'La IA no generó una respuesta válida.';
        }

        $aiResponse = $result['response'];
        
        // Limpiar y formatear la respuesta
        $aiResponse = trim($aiResponse);
        
        // Remover posibles bloques de código si solo queremos el SQL
        $aiResponse = preg_replace('/```sql\n?/i', '', $aiResponse);
        $aiResponse = preg_replace('/```\n?/', '', $aiResponse);
        
        return $aiResponse;
    }



    function generateSQL($userMessage, $conversationHistory = [])
    {
        $prompt = "You are an expert SQL generator for a ticket management system.
        
        Current user question: $userMessage

        Database schema:
        - Usuario (Id, Nombre, Correo, Ultima_Sesion, Rol, Estado, CargaTrabajo)
        - Ticket (Id, Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Estado, Prioridad, Puntaje)
        - Asignacion (Id, Id_Ticket, Id_Tecnico, Prioridad, Fecha_Asignacion)
        - Categoria (Id, Nombre, Descripcion)
        - Valoracion (Id, Id_Ticket, Id_Usuario, Puntaje, Comentario, Fecha_Valoracion)
        - Estado_Ticket (Id, Nombre)
        - Tecnico (Id_Usuario, Id_Especialidad)
        - Especialidad (Id, Nombre, Descripcion)

        Important rules:
        1. Use the conversation context to understand follow-up questions
        2. If the question refers to previous results (like 'cuántos son', 'de esos', 'ellos'), use the same base query
        3. Generate ONLY a valid SQL SELECT query
        4. No explanations, no markdown, no comments - just the SQL
        5. Use proper JOINs when needed
        
        Generate the SQL query:";

        $sql = $this->callAI($prompt, $conversationHistory);
        
        // Limpiar el SQL de posibles caracteres extras
        $sql = trim($sql);
        $sql = str_replace(["```sql", "```", "\n\n"], ["", "", " "], $sql);
        $sql = preg_replace('/\s+/', ' ', $sql);
        
        return $sql;
    }

    function executeSQLFromAI($userMessage, $conversationHistory = [])
    {

        $sql = $this->generateSQL($userMessage, $conversationHistory);

        $db = new MySqlConnect();
        $result = $db->ExecuteSQL($sql);

        return $result;
    }

    function summarizeSQLResult($result, $userMessage, $conversationHistory = [])
    {
        $totalCount = count($result);
        
        // Si hay 3 o más registros con múltiples columnas, formatear como tabla
        if ($totalCount >= 3 && is_object($result[0]) && count(get_object_vars($result[0])) >= 2) {
            return $this->formatAsTable($result, $userMessage, $totalCount);
        }
        
        // Para pocos registros o datos simples, usar resumen narrativo
        $limitedResult = array_slice($result, 0, 10);
        $dataText = json_encode($limitedResult, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        $prompt = "Eres un asistente que resume datos de base de datos de forma clara y natural en español.
        
Pregunta actual del usuario: $userMessage

Datos obtenidos ($totalCount resultados totales):
$dataText

Instrucciones:
1. Resume la información de forma concisa, clara y amigable
2. Si es una pregunta de seguimiento (como 'cuántos', 'de esos', 'ellos'), usa el contexto previo
3. Menciona el número total cuando sea relevante
4. No inventes información que no esté en los datos
5. Sé específico con nombres, números y detalles
6. Usa un tono conversacional y natural

Respuesta:";

        $answer = $this->callAI($prompt, $conversationHistory);
        
        if ($totalCount > 5) {
            $answer .= "\n\n(Mostrando 5 de $totalCount resultados)";
        }
        
        return $answer;
    }
    
    function formatAsTable($result, $userMessage, $totalCount)
    {
        // Limitar a 10 registros para mejor visualización en chat
        $limitedResult = array_slice($result, 0, 10);
        
        // Obtener las columnas del primer registro
        $firstRow = $limitedResult[0];
        $allColumns = array_keys(get_object_vars($firstRow));
        
        // Seleccionar solo las columnas más relevantes (máximo 5)
        $columns = $this->selectRelevantColumns($allColumns);
        
        // Crear encabezado con resumen breve
        $summary = "<p>Encontré <strong>$totalCount resultado(s)</strong>:</p>";
        
        // Construir tabla HTML
        $tableHtml = '<table>';
        
        // Encabezado de la tabla
        $tableHtml .= '<thead><tr>';
        foreach ($columns as $col) {
            $displayName = $this->formatColumnName($col);
            $tableHtml .= '<th>' . htmlspecialchars($displayName) . '</th>';
        }
        $tableHtml .= '</tr></thead>';
        
        // Cuerpo de la tabla
        $tableHtml .= '<tbody>';
        foreach ($limitedResult as $row) {
            $tableHtml .= '<tr>';
            
            foreach ($columns as $col) {
                $value = $row->$col ?? '';
                $formattedValue = $this->formatCellValue($value, $col);
                $tableHtml .= '<td>' . htmlspecialchars($formattedValue) . '</td>';
            }
            
            $tableHtml .= '</tr>';
        }
        $tableHtml .= '</tbody></table>';
        
        // Agregar nota si hay más resultados
        if ($totalCount > 10) {
            $tableHtml .= '<p class="text-xs">(Mostrando 10 de ' . $totalCount . ' resultados)</p>';
        }
        
        return $summary . $tableHtml;
    }
    
    function selectRelevantColumns($columns)
    {
        // Priorizar columnas importantes y limitar a 5
        $priorityColumns = ['Id', 'Nombre', 'Titulo', 'Correo', 'Estado', 'Prioridad', 'Puntaje', 'Fecha_Creacion', 'CargaTrabajo'];
        
        $selected = [];
        
        // Primero agregar columnas prioritarias que existan
        foreach ($priorityColumns as $priority) {
            if (in_array($priority, $columns)) {
                $selected[] = $priority;
                if (count($selected) >= 5) break;
            }
        }
        
        // Si no tenemos suficientes, agregar las demás
        if (count($selected) < 5) {
            foreach ($columns as $col) {
                if (!in_array($col, $selected)) {
                    $selected[] = $col;
                    if (count($selected) >= 5) break;
                }
            }
        }
        
        return $selected;
    }
    
    function formatColumnName($columnName)
    {
        // Convertir nombres de columnas a formato legible
        $replacements = [
            'Id' => 'ID',
            'Nombre' => 'Nombre',
            'Correo' => 'Email',
            'Ultima_Sesion' => 'Última Sesión',
            'CargaTrabajo' => 'Carga',
            'Fecha_Creacion' => 'Creado',
            'Fecha_Asignacion' => 'Asignado',
            'Id_Usuario' => 'Usuario ID',
            'Id_Tecnico' => 'Técnico ID',
            'Id_Ticket' => 'Ticket ID',
            'Titulo' => 'Título',
            'Descripcion' => 'Descripción',
            'Prioridad' => 'Prioridad',
            'Puntaje' => 'Puntaje'
        ];
        
        return $replacements[$columnName] ?? ucfirst(str_replace('_', ' ', $columnName));
    }
    
    function formatCellValue($value, $columnName)
    {
        if (is_null($value) || $value === '') {
            return '-';
        }
        
        // Formatear fechas
        if (strpos($columnName, 'Fecha') !== false || strpos($columnName, 'Sesion') !== false) {
            $timestamp = strtotime($value);
            if ($timestamp) {
                return date('d/m H:i', $timestamp);
            }
        }
        
        // Formatear estados booleanos
        if (strtolower($columnName) === 'estado' && is_numeric($value)) {
            return $value == 1 ? '✓' : '✗';
        }
        
        // Formatear roles
        if (strtolower($columnName) === 'rol' && is_numeric($value)) {
            $roles = [1 => 'Admin', 2 => 'Técnico', 3 => 'Cliente'];
            return $roles[$value] ?? $value;
        }
        
        // Limitar texto largo (más corto para chat)
        if (is_string($value) && strlen($value) > 30) {
            return substr($value, 0, 27) . '...';
        }
        
        return $value;
    }

    function handleUserMessage($userMessage, $conversationHistory = [])
    {
        try {
            // Determinar si la pregunta requiere consultar la base de datos
            $requiresDB = $this->requiresDatabaseQuery($userMessage, $conversationHistory);
            
            if (!$requiresDB) {
                // Respuesta directa sin consultar base de datos
                $prompt = "Eres Andromy, el asistente virtual inteligente de Andromeda, un sistema avanzado de gestión de tickets de soporte técnico para eventos en vivo.

INFORMACIÓN COMPLETA DEL SISTEMA:

TABLAS PRINCIPALES (20 tablas en total):
1. Usuario - Gestiona usuarios del sistema (Admins, Técnicos, Clientes)
   Campos: Id, Nombre, Correo, Rol (1=Admin, 2=Técnico, 3=Cliente), Estado, CargaTrabajo

2. Ticket - Tickets de soporte técnico
   Campos: Id, Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Estado, Prioridad, Id_Categoria, Puntaje

3. Asignacion - Asignaciones de tickets a técnicos
   Campos: Id, Id_Ticket, Id_Tecnico, Metodo_Asignacion (1=Manual, 2=Automático), Fecha_Asignacion

4. Categoria - 24 categorías (Audio, Luces, Seguridad, Médico, etc.)

5. Especialidad - 12 especialidades técnicas (Audio, Iluminación, Seguridad, Paramédico)

6-20. Otras tablas: Tecnico, Estado_Ticket, Prioridad, Etiqueta, Historial_Estado, Imagen, Notificacion, Valoracion, SLA, Regla_Autotriage, Rol, Metodo_Asignacion, Tipo_Notificacion, y tablas de relación

CAPACIDADES AVANZADAS DE CONSULTA:
✓ Consultas en lenguaje natural
✓ JOINs múltiples entre tablas relacionadas
✓ Preguntas de seguimiento con contexto conversacional
✓ Estadísticas y análisis
✓ Análisis de carga de trabajo de técnicos
✓ Tracking de cumplimiento de SLA
✓ Análisis de valoraciones

EJEMPLOS DE CONSULTAS:
- \"Dame el nombre del usuario del ticket 1\" (JOIN entre Ticket y Usuario)
- \"Técnicos con sus especialidades\" (JOIN triple)
- \"Tickets críticos con técnico asignado\"
- \"Historial completo del ticket 1\"
- \"Notificaciones no leídas\"
- \"Tickets con valoración mayor a 4 estrellas\"

FUNCIONALIDADES DEL SISTEMA:
1. Gestión completa de tickets para eventos
2. Asignación automática inteligente con IA
3. Sistema de prioridades y SLA
4. Notificaciones en tiempo real
5. Análisis de carga de trabajo
6. Sistema de valoraciones
7. Tracking completo de cambios

Responde en español de forma amigable y conversacional. Usa el contexto de la conversación para dar mejores respuestas.

Usuario: $userMessage

Asistente:";
                $response = $this->callAI($prompt, $conversationHistory);

                return [
                    'success' => true,
                    'status' => 200,
                    'message' => 'Respuesta directa',
                    'data' => $response
                ];
            }

            // Generar SQL a partir del mensaje del usuario usando el contexto
            $sql = $this->generateSQL($userMessage, $conversationHistory);

            // Validar que el SQL sea válido
            if (empty($sql) || stripos($sql, 'SELECT') === false) {
                // Intentar una respuesta contextual en caso de fallo
                $fallbackPrompt = "El usuario pregunta: $userMessage\n\nNo pude generar una consulta SQL válida. Intenta responder de forma útil basándote en el contexto de la conversación o pide aclaración de forma amigable.";
                $fallbackResponse = $this->callAI($fallbackPrompt, $conversationHistory);
                
                return [
                    'success' => true,
                    'status' => 200,
                    'message' => 'Respuesta contextual',
                    'data' => $fallbackResponse
                ];
            }

            // Ejecutar el SQL generado
            $dbResult = $this->enlace->ExecuteSQL($sql);

            if (empty($dbResult) || !is_array($dbResult)) {
                return [
                    'success' => true,
                    'status' => 200,
                    'message' => 'Sin resultados',
                    'data' => 'No encontré información que coincida con tu consulta.'
                ];
            }

            // Resumir el resultado para el usuario con contexto conversacional
            $summary = $this->summarizeSQLResult($dbResult, $userMessage, $conversationHistory);

            return [
                'success' => true,
                'status' => 200,
                'message' => 'Consulta exitosa',
                'data' => $summary
            ];
        } catch (Exception $e) {
            error_log("Error en handleUserMessage: " . $e->getMessage());
            return [
                'success' => false,
                'status' => 500,
                'message' => 'Error interno',
                'data' => 'Disculpa, ocurrió un error al procesar tu solicitud. Intenta nuevamente.'
            ];
        }
    }
    
    function requiresDatabaseQuery($userMessage, $conversationHistory = [])
    {
        $lowerMessage = strtolower($userMessage);
        
        // Palabras que indican pregunta sobre el sistema (NO requieren DB)
        $infoKeywords = ['qué puedes', 'que puedes', 'cómo funciona', 'como funciona', 'qué es', 'que es', 'ayuda', 'información', 'informacion', 'tablas disponibles', 'puedo consultar', 'puedo preguntar', 'hola', 'buenos dias', 'buenas tardes'];
        
        foreach ($infoKeywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return false;
            }
        }
        
        // Si hay contexto previo y la pregunta parece ser de seguimiento, probablemente necesita DB
        if (!empty($conversationHistory)) {
            $followUpKeywords = ['cuántos', 'cuantos', 'de esos', 'de ellos', 'de estas', 'de estos', 'y los', 'y las', 'también', 'tambien', 'además', 'ademas'];
            foreach ($followUpKeywords as $keyword) {
                if (strpos($lowerMessage, $keyword) !== false) {
                    return true;
                }
            }
        }
        
        // Palabras clave que indican necesidad de consultar la base de datos
        $dbKeywords = ['lista', 'cuántos', 'cuantos', 'mostrar', 'ver', 'buscar', 'encontrar', 'dame', 'obtener', 'consulta', 'usuarios', 'tickets', 'técnicos', 'tecnicos', 'asignaciones', 'estado', 'carga', 'prioridad', 'total', 'cantidad', 'número', 'numero', 'todos', 'todas'];
        
        foreach ($dbKeywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
}
