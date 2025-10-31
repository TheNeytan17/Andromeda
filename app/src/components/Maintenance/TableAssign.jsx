// ========================================
// IMPORTS
// ========================================
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Tag, Clock, MessageCircle, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import AssignmentService from "../../services/AssignmentService";
import TicketService from "../../services/TicketService";

// ========================================
// CONSTANTES
// ========================================
// Estados del tablero Kanban (4 columnas principales)
// No incluye "Pendiente" ya que ese estado es anterior a la asignación
const statuses = ["Asignado", "En Proceso", "Resuelto", "Cerrado"];

// ========================================
// FUNCIONES AUXILIARES DE ESTILO
// ========================================

/**
 * Retorna clases CSS para colorear tarjetas según la urgencia del ticket
 * @param {string} urgency - Nivel de urgencia (Alta/Media/Baja)
 * @returns {string} Clases Tailwind para fondo y borde
 */
function urgencyColor(urgency) {
    const u = (urgency || "").toLowerCase();
    if (u === "alta" || u === "high") return "bg-red-500/10 border-red-500/40";       // Rojo para urgencia alta
    if (u === "media" || u === "medium") return "bg-yellow-500/10 border-yellow-500/40"; // Amarillo para urgencia media
    return "bg-emerald-500/10 border-emerald-500/40";                                  // Verde para urgencia baja
}

/**
 * Retorna estilos especiales según el estado de la asignación
 * Estados iniciales (Pendiente, Asignado, En Proceso) tienen colores especiales
 * @param {string} status - Estado de la asignación
 * @returns {object|null} Objeto con estilos inline o null para usar colores de urgencia
 */
function getCardColorByStatus(status) {
    const normalizedStatus = (status || "").toLowerCase();
    // Rosa para estados iniciales (recién asignados)
    if (normalizedStatus === "pendiente" || normalizedStatus === "asignado") {
        return { background: 'rgba(252, 82, 175, 0.15)' }; // Rosa #fc52af
    }
    // Naranja para tickets en progreso activo
    if (normalizedStatus === "en proceso") {
        return { background: 'rgba(251, 178, 95, 0.15)' }; // Naranja #fbb25f
    }
    // Para Resuelto y Cerrado, retornar null para usar colores por urgencia
    return null;
}

/**
 * Retorna el icono apropiado según la categoría del ticket
 * @param {string} category - Categoría del ticket
 * @returns {JSX.Element} Componente de icono
 */
function categoryIcon(category) {
    const c = (category || "").toLowerCase();
    if (c.includes("hard") || c.includes("hardware")) return <AlertTriangle className="w-4 h-4" />; // Hardware
    if (c.includes("soft") || c.includes("software")) return <Tag className="w-4 h-4" />;           // Software
    if (c.includes("acceso") || c.includes("access"))                                              // Acceso
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        );
    if (c.includes("red")) return <Clock className="w-4 h-4" />;                                   // Red/Networking
    return <Tag className="w-4 h-4" />;                                                             // Categoría genérica
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
/**
 * TableAssignments - Componente principal para visualizar asignaciones de tickets
 * Ofrece dos vistas: Kanban (columnas por estado) y Semanal (agrupado por días)
 */
export default function TableAssignments() {
    // ========================================
    // HOOKS Y ESTADO
    // ========================================
    const navigate = useNavigate(); // Para navegación entre rutas
    
    // Estado para almacenar todas las asignaciones desde la API
    const [assignments, setAssignments] = useState([]);
    
    // Estados de UI
    const [loading, setLoading] = useState(true);      // Indica si está cargando datos
    const [error, setError] = useState("");            // Mensaje de error si falla la carga
    
    // Estados para control de vistas
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' o 'week'
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date())); // Inicio de semana para vista semanal

    // ========================================
    // FUNCIONES AUXILIARES DE FECHAS
    // ========================================
    
    /**
     * Convierte un valor a objeto Date válido o null
     * @param {*} val - Valor a convertir
     * @returns {Date|null}
     */
    function toDate(val) {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }

    /**
     * Calcula el inicio de la semana (lunes a las 00:00:00)
     * La semana comienza el lunes según estándar ISO
     * @param {Date} date - Fecha de referencia
     * @returns {Date|null} Fecha del lunes de esa semana
     */
    function startOfWeek(date) {
        if (!date) return null;
        const d = new Date(date);
        const day = d.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
        const diff = (day + 6) % 7; // Convertir para que lunes=0, domingo=6
        const res = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff, 0, 0, 0, 0);
        return res;
    }

    /**
     * Calcula el fin de la semana (domingo a las 23:59:59)
     * @param {Date} start - Inicio de la semana (lunes)
     * @returns {Date|null} Fecha del domingo de esa semana
     */
    function endOfWeek(start) {
        if (!start) return null;
        const s = new Date(start);
        const res = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6, 23, 59, 59, 999);
        return res;
    }

    /**
     * Formatea una fecha en formato corto (día mes)
     * Ejemplo: "28 oct"
     * @param {Date} d - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    function formatDateShort(d) {
        if (!d) return '';
        try {
            return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        } catch {
            return String(d);
        }
    }

    /**
     * Formatea el rango de una semana completa
     * Ejemplo: "28 oct 2025 — 03 nov 2025"
     * @param {Date} start - Inicio de la semana
     * @returns {string} Rango formateado
     */
    function formatWeekRange(start) {
        if (!start) return '';
        const s = startOfWeek(start);
        const e = endOfWeek(s);
        const sStr = s.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        const eStr = e.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${sStr} — ${eStr}`;
    }

    // ========================================
    // FUNCIONES DE CÁLCULO SLA
    // ========================================
    
    /**
     * Calcula el porcentaje de tiempo SLA consumido
     * SLA = Service Level Agreement (tiempo acordado para resolver)
     * @param {Date} startDate - Fecha de inicio del SLA (creación del ticket)
     * @param {Date} endDate - Fecha límite de resolución
     * @returns {number} Porcentaje entre 0-100
     */
    function computeSlaPercent(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const now = new Date();
        const total = endDate.getTime() - startDate.getTime();
        if (total <= 0) return 0; // Configuración inválida
        
        const elapsed = now.getTime() - startDate.getTime();
        // Limitar entre 0 y 100% (no exceder aunque esté vencido)
        const clampedElapsed = Math.max(0, Math.min(total, elapsed));
        return Math.round((clampedElapsed / total) * 100);
    }

    /**
     * Genera mensaje descriptivo para tickets vencidos
     * Calcula cuánto tiempo ha pasado desde el vencimiento
     * @param {Date} endDate - Fecha límite de resolución
     * @returns {string|null} Mensaje de vencimiento o null si no está vencido
     */
    function getOverdueMessage(endDate) {
        if (!endDate) return null;
        const now = new Date();
        const overdue = now.getTime() - endDate.getTime();
        if (overdue <= 0) return null; // Aún no vencido

        const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
        const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        // Priorizar días sobre horas para mensajes más significativos
        if (days > 0) {
            return `Vencido hace ${days} día${days !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `Vencido hace ${hours} hora${hours !== 1 ? 's' : ''}`;
        } else {
            return 'Vencido recientemente';
        }
    }

    // ========================================
    // FUNCIONES DE MAPEO Y NORMALIZACIÓN
    // ========================================
    
    /**
     * Mapea un objeto de asignación desde la API a formato uniforme
     * Soporta múltiples formatos de respuesta del backend (camelCase, snake_case, etc.)
     * @param {object} row - Fila de datos desde la API
     * @returns {object} Objeto normalizado con estructura consistente
     */
    function mapAssignment(row) {
        // Intentar extraer el estado desde múltiples posibles campos
        const rawEstado = row.Estado ?? row.Id_Estado ?? row.Estado_Ticket ?? row.estado_ticket ?? row.estado ?? row.status ?? row.state ?? row.EstadoNombre ?? row.NombreEstado;
        return {
            Id: row.Id ?? row.id ?? row.Id_Ticket ?? row.id_ticket,
            Id_Ticket: row.Id_Ticket ?? row.id_ticket ?? null,
            Titulo: row.Titulo ?? row.title ?? row.Titulo_Ticket ?? `Ticket #${row.Id ?? row.id ?? row.Id_Ticket ?? ""}`,
            Categoria: row.Categoria ?? row.Category ?? row.Categoria_Ticket ?? (row.CategoriaId ? String(row.CategoriaId) : "General"),
            Estado: mapTicketEstadoToColumn(rawEstado) ?? "Pendiente",
            OriginalEstadoRaw: rawEstado ?? null,
            Urgencia: row.Urgencia ?? row.urgency ?? row.Prioridad ?? "Baja",
            SLA_hours_left: row.SLA_hours_left ?? row.sla_hours_left ?? row.SLA ?? 0,
            PercentSLA: row.PercentSLA ?? row.percent_sla ?? row.sla_percent ?? 0,
            Dia: row.Dia ?? row.dia ?? row.day ?? "",
            Id_Tecnico: row.Id_Tecnico ?? row.id_tecnico ?? null,
            Tecnico: row.Tecnico ?? row.tecnico ?? null,
            Fecha_AsignacionRaw: row.Fecha_Asignacion ?? row.fecha_asignacion ?? row.FechaAsignacion ?? null,
            slaStart: toDate(row.Fecha_Asignacion ?? row.fecha_asignacion ?? row.FechaAsignacion),
            slaEnd: null, // Se enriquece después con datos del ticket
        };
    }

    /**
     * Normaliza nombres de estados en español/inglés a formato estándar
     * @param {string} s - Estado a normalizar
     * @returns {string} Estado normalizado
     */
    function normalizeStatus(s) {
        const v = String(s || "").toLowerCase();
        // Buscar coincidencias parciales para soportar variaciones del backend
        if (v.includes("pen")) return "Pendiente";
        if (v.includes("asign") || v.includes("esper")) return "Asignado";
        if (v.includes("progre") || v.includes("proce")) return "En Proceso";
        if (v.includes("resuel") || v.includes("resolv")) return "Resuelto";
        if (v.includes("cerr")) return "Cerrado";
        return s; // Retornar original si no coincide
    }

    /**
     * Mapea estados desde diferentes formatos a columnas Kanban
     * Soporta: números (1-5), strings numéricos, nombres descriptivos, objetos
     * @param {number|string|object} estado - Estado en cualquier formato
     * @returns {string} Nombre de columna normalizado
     */
    function mapTicketEstadoToColumn(estado) {
        if (estado === null || estado === undefined) return "Pendiente";

        // Caso 1: Viene como objeto (ej: {Id: 2, Nombre: "En Progreso"})
        if (typeof estado === "object") {
            const maybe = estado.Id ?? estado.Id_Estado ?? estado.id ?? estado.estado ?? estado.Nombre ?? estado.name;
            if (typeof maybe === "number") return mapTicketEstadoToColumn(maybe);
            if (typeof maybe === "string") return mapTicketEstadoToColumn(maybe);
            return "Pendiente";
    
        /**
         * Filtra asignaciones que pertenecen a una semana específica
         * Una asignación se incluye si:
         * - Su fecha de inicio (slaStart) cae en la semana
         * - Su fecha límite (slaEnd) cae en la semana
         * - Su rango SLA envuelve toda la semana
         * @param {Date} start - Inicio de la semana a filtrar
         * @returns {Array} Asignaciones dentro del rango semanal
         */
        }

        // Caso 2: String que puede ser número ("2") o nombre ("En Progreso")
        if (typeof estado === "string") {
            const str = estado.trim();
            // Si es string numérico, convertir a número
            if (/^\d+$/.test(str)) {
                const n = parseInt(str, 10);
                return mapTicketEstadoToColumn(n);
            }
            // Si es nombre descriptivo, normalizar
            return normalizeStatus(str);
        }

        // Caso 3: Número directo (IDs del backend)
        if (typeof estado === "number") {
            switch (estado) {
                case 1: return "Pendiente";
                case 2: return "Asignado";
                case 3: return "En proceso";
                case 4: return "Resuelto";
                case 5: return "Cerrado";
                default: return "Pendiente";
            }
        }
        
        return "Pendiente"; // Fallback por defecto
    }

    // ========================================
    // EFECTO: CARGA INICIAL DE DATOS
    // ========================================
    /**
     * Hook que se ejecuta al montar el componente
     * 1. Obtiene todas las asignaciones desde la API
     * 2. Enriquece cada asignación con datos del ticket asociado
     * 3. Calcula porcentajes SLA actualizados
     */
    useEffect(() => {
        let mounted = true;
        
        const fetchData = async () => {
            try {
                // Paso 1: Obtener asignaciones base
                const res = await AssignmentService.getAssignments();
                const rows = res?.data?.data ?? res?.data ?? [];
                const base = (Array.isArray(rows) ? rows : []).map(mapAssignment);

                // Paso 2: Obtener IDs únicos de tickets para consultas
                const uniqueTicketIds = Array.from(new Set(base.map(a => a.Id_Ticket).filter(Boolean)));
                const ticketStateMap = new Map();
                
                // Paso 3: Consultar cada ticket para obtener estado y fechas SLA
                await Promise.all(uniqueTicketIds.map(async (tid) => {
                    try {
                        const tRes = await TicketService.getTicketById(tid);
                        const tData = tRes?.data?.data ?? tRes?.data;
                        const estadoVal = tData?.Estado ?? tData?.estado ?? tData?.Id_Estado;
                        const fechaCreacion = tData?.Fecha_Creacion ?? tData?.fecha_creacion ?? tData?.FechaCreacion;
                        const fechaLimite = tData?.Fecha_Limite_Resolucion ?? tData?.fecha_limite_resolucion ?? tData?.FechaLimiteResolucion ?? tData?.Fecha_Limite;
                        ticketStateMap.set(tid, { estado: estadoVal, slaStart: fechaCreacion, slaEnd: fechaLimite });
                    } catch {
                        ticketStateMap.set(tid, null);
                    }
                }));

                // Paso 4: Enriquecer asignaciones con datos de tickets
                const enriched = base.map(a => {
                    const info = ticketStateMap.get(a.Id_Ticket);
                    const estadoTicket = (info && typeof info === 'object') ? info.estado : info;
                    const slaStart = (info && info.slaStart) ? toDate(info.slaStart) : (a.slaStart || null);
                    const slaEnd = (info && info.slaEnd) ? toDate(info.slaEnd) : null;
                    const percent = computeSlaPercent(slaStart, slaEnd);

                    return {
                        ...a,
                        // Actualizar estado desde ticket si está disponible
                        Estado: estadoTicket !== undefined ? mapTicketEstadoToColumn(estadoTicket) : a.Estado,
                        slaStart,
                        slaEnd,
                        // Recalcular porcentaje SLA con fechas reales
                        PercentSLA: Number.isFinite(percent) ? percent : a.PercentSLA,
                    };
                });

                // Actualizar estado solo si el componente sigue montado
                if (mounted) setAssignments(enriched);
                if (mounted && (!enriched || !enriched.length)) setError("No hay asignaciones disponibles");
            } catch (e) {
                if (mounted) {
                    setError(e?.message ?? String(e));
                    setAssignments([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        // Cleanup: prevenir actualizaciones de estado si el componente se desmonta
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================
    // EFECTO: ACTUALIZACIÓN AUTOMÁTICA DE SLA
    // ========================================
    /**
     * Hook que recalcula porcentajes SLA cada 60 segundos
     * Mantiene las barras de progreso actualizadas sin recargar la página
     */
    useEffect(() => {
        if (!assignments || assignments.length === 0) return;
        
        // Configurar intervalo de actualización
        const id = setInterval(() => {
            setAssignments(prev => prev.map(a => {
                // Solo recalcular si tiene fechas SLA definidas
                if (!a?.slaStart || !a?.slaEnd) return a;
                const p = computeSlaPercent(a.slaStart, a.slaEnd);
                return { ...a, PercentSLA: p };
            }));
        }, 60000); // 60000ms = 1 minuto
        
        // Cleanup: limpiar intervalo al desmontar
        return () => clearInterval(id);
    }, [assignments]);

    // Filtrar asignaciones que caen dentro del rango semanal
    function assignmentsInWeek(start) {
        const s = startOfWeek(start || weekStart);
        const e = endOfWeek(s);
        return assignments.filter(a => {
            const aStart = a.slaStart || toDate(a.Fecha_AsignacionRaw) || null;
            const aEnd = a.slaEnd || null;
            // Si no hay fechas, exclude
            if (!aStart && !aEnd) return false;
            // Si cualquiera cae dentro del rango
            if (aStart && aStart >= s && aStart <= e) return true;
            if (aEnd && aEnd >= s && aEnd <= e) return true;
            // Si el rango SLA envuelve la semana
            if (aStart && aEnd && aStart <= s && aEnd >= e) return true;
            return false;
        });
    }

    // Agrupar asignaciones por día de la semana (Lunes-Domingo)
    function groupByWeekDay(assignmentsArray, weekStartDate) {
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const grouped = {};
        days.forEach(day => grouped[day] = []);

        const s = startOfWeek(weekStartDate);
        
        assignmentsArray.forEach(a => {
            const aStart = a.slaStart || toDate(a.Fecha_AsignacionRaw) || null;
            if (!aStart) return;
            
            // Calcular el día de la semana relativo al inicio (lunes = 0, domingo = 6)
            const diffDays = Math.floor((aStart.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                const dayName = days[diffDays];
                grouped[dayName].push(a);
            }
        });

        return grouped;
    }

    // Agrupar por estado (para Kanban)
    const grouped = {};
    statuses.forEach((s) => (grouped[s] = []));
    assignments.forEach((a) => {
        const st = normalizeStatus(a.Estado || statuses[0]);
        if (!grouped[st]) grouped[st] = [];
        grouped[st].push(a);
    });

    // Asignaciones filtradas para la semana seleccionada
    const weekAssignments = assignmentsInWeek(weekStart);
    const weekGroupedByDay = groupByWeekDay(weekAssignments, weekStart);

    function changeState(id, newState) {
        setAssignments((prev) => prev.map((p) => (p.Id === id ? { ...p, Estado: newState } : p)));
    }

    // ========================================
    // RENDERIZADO - ESTADO DE CARGA
    // ========================================
    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 text-white">
                <div className="text-sm text-zinc-300">Cargando asignaciones…</div>
            </div>
        );
    }

    // ========================================
    // RENDERIZADO PRINCIPAL
    // ========================================
    return (
        <div className="container mx-auto py-8 px-4 text-white">
            {/* CABECERA CON CONTROLES */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Tablero — Asignaciones</h2>

                {/* Selector de vista y controles semanales */}
                <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-300">Vista:</label>
                    
                    {/* Select personalizado con estilo glassmorphism */}
                    <Select value={viewMode} onValueChange={(val) => setViewMode(val)}>
                        <SelectTrigger className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md focus-visible:ring-[#6f3c82]/50 focus-visible:border-[#6f3c82] selection:bg-[#6f3c82] selection:text-[#f7f4f3] w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3] focus-visible:ring-0 selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
                            <SelectItem value="kanban" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">
                                Kanban
                            </SelectItem>
                            <SelectItem value="week" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">
                                Semana
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Controles de navegación semanal (solo visible en vista semanal) */}
                    {viewMode === 'week' && (
                        <div className="flex items-center gap-2">
                            {/* Botón: Semana anterior */}
                            <Button 
                                size="sm" 
                                onClick={() => setWeekStart(prev => startOfWeek(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7)))} 
                                aria-label="Semana anterior"
                                className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-2 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md hover:bg-[rgba(111,60,130,0.25)] focus-visible:ring-[#6f3c82]/50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            {/* Mostrar rango semanal actual */}
                            <div className="text-sm text-zinc-200 min-w-[200px] text-center">{formatWeekRange(weekStart)}</div>
                            
                            {/* Botón: Semana siguiente */}
                            <Button 
                                size="sm" 
                                onClick={() => setWeekStart(prev => startOfWeek(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7)))} 
                                aria-label="Semana siguiente"
                                className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-2 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md hover:bg-[rgba(111,60,130,0.25)] focus-visible:ring-[#6f3c82]/50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            
                            {/* Botón: Volver a semana actual */}
                            <Button 
                                size="sm" 
                                onClick={() => setWeekStart(startOfWeek(new Date()))}
                                className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md hover:bg-[rgba(111,60,130,0.25)] focus-visible:ring-[#6f3c82]/50"
                            >
                                Hoy
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mensaje de error si hubo problemas cargando datos */}
            {error && (
                <div className="mb-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded">
                    {error}
                </div>
            )}

            {/* CONTENIDO PRINCIPAL: Renderizado condicional según vista */}
            {viewMode === 'kanban' ? (
                // ========================================
                // VISTA KANBAN (COLUMNAS POR ESTADO)
                // ========================================
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {statuses.map((status) => (
                        <div
                            key={status}
                            className="min-w-[260px] rounded border-2 border-[#6f3c82] p-3 flex-shrink-0"
                            style={{
                                background: 'rgba(111, 60, 130, 0.1)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)'
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-[#f7f4f3]">{status}</h3>
                                <span className="text-xs text-[#f7f4f3]/70">{grouped[status].length}</span>
                            </div>

                            <div className="space-y-3">
                                {grouped[status].length === 0 && <div className="text-xs text-zinc-500">No hay asignaciones</div>}

                                {/* Mapear cada asignación a una tarjeta */}
                                {grouped[status].map((ticket) => (
                                    <div
                                        key={ticket.Id}
                                        className={`p-3 rounded shadow-sm ${!getCardColorByStatus(ticket.Estado) ? urgencyColor(ticket.Urgencia) : ''}`}
                                        style={getCardColorByStatus(ticket.Estado) || {}}
                                    >
                                        {/* Cabecera: Icono, título y categoría */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2">
                                                <div className="p-1 bg-white/5 rounded-md">{categoryIcon(ticket.Categoria)}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-100">{ticket.Titulo}</div>
                                                    <div className="text-xs text-zinc-400">#{ticket.Id} · {ticket.Categoria}{ticket.Dia ? ` · ${ticket.Dia}` : ""}</div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Barra de progreso SLA */}
                                        <div className="mt-3">
                                            <div className="w-full h-2 bg-black/20 rounded">
                                                {/* Barra interior: verde si completado, rojo si vencido, gradiente si en progreso */}
                                                <div
                                                    className={`h-2 rounded ${ticket.Estado === 'Resuelto' || ticket.Estado === 'Cerrado'
                                                            ? 'bg-emerald-500'
                                                            : ticket.PercentSLA >= 100
                                                                ? 'bg-red-500'
                                                                : 'bg-gradient-to-r from-emerald-400 to-red-400'
                                                        }`}
                                                    style={{ width: `${ticket.PercentSLA}%` }}
                                                />
                                            </div>
                                            {/* Texto descriptivo del SLA */}
                                            <div className="text-xs mt-1">
                                                {ticket.Estado === 'Resuelto' || ticket.Estado === 'Cerrado' ? (
                                                    <span className="text-emerald-400">✓ Completado</span>
                                                ) : ticket.PercentSLA >= 100 && ticket.slaEnd ? (
                                                    <span className="text-red-400 font-medium">⚠️ {getOverdueMessage(ticket.slaEnd)}</span>
                                                ) : (
                                                    <span className="text-zinc-400">{ticket.PercentSLA}% SLA consumido</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Controles de la tarjeta */}
                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {/* Botón: Ver detalle */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button size="sm" variant="ghost" onClick={() => navigate(`/Assignment/${ticket.Id}`)} aria-label={`Ver detalle ${ticket.Id}`}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Abrir detalle</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Selector: Cambiar estado (solo local) */}
                                                <Select
                                                    value={normalizeStatus(ticket.Estado)}
                                                    onValueChange={(val) => changeState(ticket.Id, val)}
                                                >
                                                    <SelectTrigger className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md focus-visible:ring-[#6f3c82]/50 focus-visible:border-[#6f3c82] selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3] focus-visible:ring-0 selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
                                                        {statuses.map((s) => (
                                                            <SelectItem
                                                                key={s}
                                                                value={s}
                                                                className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]"
                                                            >
                                                                {s}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Botones adicionales (sin funcionalidad aún) */}
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="link" className="text-zinc-300" onClick={() => { /* UI-only: abrir cuadro de comentarios */ }}>
                                                    <MessageCircle className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => { /* UI-only */ }}>
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // ========================================
                // VISTA SEMANAL (AGRUPADA POR DÍAS)
                // ========================================
                <div className="space-y-6">
                    {/* Mensaje si no hay asignaciones en la semana */}
                    {weekAssignments.length === 0 && <div className="text-xs text-zinc-500">No hay asignaciones para la semana seleccionada</div>}
                    
                    {/* Iterar por cada día de la semana */}
                    {Object.entries(weekGroupedByDay).map(([dayName, dayAssignments]) => {
                        // Ocultar días sin asignaciones
                        if (dayAssignments.length === 0) return null;
                        
                        return (
                            <div key={dayName} className="space-y-3">
                                {/* Encabezado del día */}
                                <h3 className="text-lg font-semibold text-[#f7f4f3] border-b border-[#6f3c82]/40 pb-2">
                                    {dayName}
                                </h3>
                                
                                {/* Tarjetas de asignaciones del día */}
                                <div className="space-y-2">
                                    {dayAssignments.map((ticket) => (
                                        <div key={ticket.Id} className={`p-3 rounded border-2 border-[#ff95b5]/50 bg-[rgba(255,255,255,0.02)]`}> 
                                            <div className="flex items-start justify-between">
                                                {/* Información izquierda: Título, categoría, técnico */}
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-100">{ticket.Titulo}</div>
                                                    <div className="text-xs text-zinc-400">#{ticket.Id} · {ticket.Categoria} · {ticket.Dia ? ticket.Dia + ' · ' : ''}{ticket.Tecnico ? ticket.Tecnico : ''}</div>
                                                    <div className="text-xs text-zinc-400 mt-1">Fecha: {formatDateShort(ticket.slaStart || ticket.Fecha_AsignacionRaw)}</div>
                                                </div>
                                                
                                                {/* Información derecha: Estado, SLA, botón ver */}
                                                <div className="flex flex-col items-end">
                                                    <div className="text-xs text-zinc-300">{ticket.Estado}</div>
                                                    
                                                    {/* Barra de progreso SLA compacta */}
                                                    <div className="w-40 mt-2">
                                                        <div className="w-full h-2 bg-black/20 rounded">
                                                            <div className={`h-2 rounded ${ticket.Estado === 'Resuelto' || ticket.Estado === 'Cerrado' ? 'bg-emerald-500' : ticket.PercentSLA >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-red-400'}`} style={{ width: `${ticket.PercentSLA}%` }} />
                                                        </div>
                                                        <div className="text-xs text-zinc-400 mt-1">{ticket.PercentSLA}% SLA consumido</div>
                                                    </div>
                                                    
                                                    {/* Botón para ver detalles */}
                                                    <div className="mt-2">
                                                        <Button size="sm" variant="ghost" onClick={() => navigate(`/Assignment/${ticket.Id}`)}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
