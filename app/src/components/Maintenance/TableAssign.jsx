// ========================================
// IMPORTS
// ========================================
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Tag, Clock, MessageCircle, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Edit, Filter } from "lucide-react";
import AssignmentService from "../../services/AssignmentService";
import TicketService from "../../services/TicketService";
import UserService from "../../services/UserService";
import TechnicianService from "../../services/TechnicianService";

// ========================================
// CONSTANTES
// ========================================
// Estados del tablero Kanban - Las claves se usarán para traducción
const STATUS_KEYS = {
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'inProgress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    PENDING: 'pending'
};

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
    const { t } = useI18n(); // Hook de internacionalización

    // Estado para almacenar todas las asignaciones desde la API
    const [assignments, setAssignments] = useState([]);

    // Estados de UI
    const [loading, setLoading] = useState(true);      // Indica si está cargando datos
    const [error, setError] = useState("");            // Mensaje de error si falla la carga

    // Estados de usuario y permisos
    const [_user, setUser] = useState(null);            // Usuario actual (guardado para uso futuro)
    const [userRole, setUserRole] = useState(null);    // Rol del usuario (1=Admin, 2=Técnico, 3=Cliente)
    const [accessDenied, setAccessDenied] = useState(false); // Control de acceso

    // Estados para control de vistas
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' o 'week'
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date())); // Inicio de semana para vista semanal
    
    // Estados para filtros
    const [selectedTechnician, setSelectedTechnician] = useState('all'); // Filtro por técnico
    const [availableTechnicians, setAvailableTechnicians] = useState([]); // Lista de técnicos para filtro

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
            return days > 1 ? `Vencido hace ${days} días` : `Vencido hace ${days} día`;
        } else if (hours > 0) {
            return hours > 1 ? `Vencido hace ${hours} horas` : `Vencido hace ${hours} hora`;
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
            Id: row.Id ?? row.id ?? row.ID ?? row.Id_Asignacion ?? row.id_asignacion,
            Id_Ticket: row.Id_Ticket ?? row.id_ticket ?? null,
            Titulo: row.Titulo ?? row.title ?? row.Titulo_Ticket ?? `Ticket #${row.Id_Ticket ?? row.id_ticket ?? ""}`,
            Categoria: row.Categoria ?? row.Category ?? row.Categoria_Ticket ?? (row.CategoriaId ? String(row.CategoriaId) : "General"),
            Estado: mapTicketEstadoToColumn(rawEstado) ?? "pending",
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
     * @returns {string} Estado normalizado (clave constante)
     */
    function normalizeStatus(s) {
        const v = String(s || "").toLowerCase();
        // Buscar coincidencias parciales para soportar variaciones del backend
        // Retornar claves constantes que luego se traducirán al renderizar
        if (v.includes("pen")) return "pending";
        if (v.includes("asign") || v.includes("esper")) return "assigned";
        if (v.includes("progre") || v.includes("proce")) return "inProgress";
        if (v.includes("resuel") || v.includes("resolv")) return "resolved";
        if (v.includes("cerr") || v.includes("clos")) return "closed";
        return s; // Retornar original si no coincide
    }

    /**
     * Mapea estados desde diferentes formatos a columnas Kanban
     * Soporta: números (1-5), strings numéricos, nombres descriptivos, objetos
     * @param {number|string|object} estado - Estado en cualquier formato
     * @returns {string} Nombre de columna normalizado
     */
    function mapTicketEstadoToColumn(estado) {
        if (estado === null || estado === undefined) return "pending";

        // Caso 1: Viene como objeto (ej: {Id: 2, Nombre: "En Progreso"})
        if (typeof estado === "object") {
            const maybe = estado.Id ?? estado.Id_Estado ?? estado.id ?? estado.estado ?? estado.Nombre ?? estado.name;
            if (typeof maybe === "number") return mapTicketEstadoToColumn(maybe);
            if (typeof maybe === "string") return mapTicketEstadoToColumn(maybe);
            return "pending";

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
                case 1: return "pending";
                case 2: return "assigned";
                case 3: return "inProgress";
                case 4: return "resolved";
                case 5: return "closed";
                default: return "pending";
            }
        }

        return "pending"; // Fallback por defecto
    }

    // ========================================
    // EFECTO: CARGA INICIAL DE DATOS
    // ========================================
    /**
     * Hook que se ejecuta al montar el componente
     * 1. Verifica usuario y permisos
     * 2. Obtiene todas las asignaciones desde la API
     * 3. Enriquece cada asignación con datos del ticket asociado
     * 4. Calcula porcentajes SLA actualizados
     */
    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                // Paso 0: Verificar si hay sesión activa
                const userSession = localStorage.getItem('user');
                if (!userSession) {
                    if (mounted) {
                        setAccessDenied(true);
                        setLoading(false);
                        toast.error('Sesión No Iniciada');
                    }
                    return;
                }

                // Obtener ID del usuario desde localStorage
                let userId;
                try {
                    const parsedUser = JSON.parse(userSession);
                    userId = parsedUser?.Id || parsedUser?.id || parsedUser?.ID;
                } catch (e) {
                    console.error('Error al parsear usuario:', e);
                    userId = 1; // Fallback temporal
                }

                if (!userId) {
                    throw new Error('La sesión es inválida o ha expirado');
                }

                // Verificar usuario y permisos
                const userData = await UserService.getUserById(userId);
                
                if (!userData?.data?.success) {
                    throw new Error('No se pudo cargar la información del usuario');
                }
                
                const currentUser = userData.data.data;
                const role = parseInt(currentUser.Rol) || parseInt(currentUser.rol) || currentUser.Rol;
                
                if (mounted) {
                    setUser(currentUser);
                    setUserRole(role);
                }

                // Verificar permisos: Solo Admin (rol 1) y Técnico (rol 2) pueden ver asignaciones
                // Cliente (rol 3) no tiene acceso
                if (role !== 1 && role !== 2) {
                    if (mounted) {
                        setAccessDenied(true);
                        setLoading(false);
                        if (role === 3) {
                            toast.error('Los clientes no tienen acceso al tablero de asignaciones');
                        } else {
                            toast.error('Acceso Denegado: Permisos insuficientes');
                        }
                    }
                    return;
                }

                // Paso 1: Obtener asignaciones base
                const res = await AssignmentService.getAssignments();
                const rows = res?.data?.data ?? res?.data ?? [];
                let base = (Array.isArray(rows) ? rows : []).map(mapAssignment);
                
                // Eliminar duplicados - mantener solo la asignación más reciente por ticket
                const ticketMap = new Map();
                base.forEach(a => {
                    const existing = ticketMap.get(a.Id_Ticket);
                    if (!existing || new Date(a.Fecha_AsignacionRaw) > new Date(existing.Fecha_AsignacionRaw)) {
                        ticketMap.set(a.Id_Ticket, a);
                    }
                });
                base = Array.from(ticketMap.values());
                
                // Filtrar asignaciones según el rol
                if (role === 2) {
                    // Técnico: solo ver sus propias asignaciones
                    base = base.filter(a => a.Id_Tecnico === currentUser.Id);
                }
                // Admin (role === 1): ve todas las asignaciones

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
                        const puntaje = tData?.Puntaje ?? tData?.puntaje ?? null;
                        ticketStateMap.set(tid, { estado: estadoVal, slaStart: fechaCreacion, slaEnd: fechaLimite, puntaje });
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
                    const puntaje = (info && info.puntaje) ? info.puntaje : null;
                    const percent = computeSlaPercent(slaStart, slaEnd);

                    return {
                        ...a,
                        // Actualizar estado desde ticket si está disponible
                        Estado: estadoTicket !== undefined ? mapTicketEstadoToColumn(estadoTicket) : a.Estado,
                        slaStart,
                        slaEnd,
                        Puntaje: puntaje,
                        // Recalcular porcentaje SLA con fechas reales
                        PercentSLA: Number.isFinite(percent) ? percent : a.PercentSLA,
                    };
                });

                // Actualizar estado solo si el componente sigue montado
                if (mounted) setAssignments(enriched);
                if (mounted && (!enriched || !enriched.length)) {
                    setError('No hay asignaciones disponibles');
                    toast.info('No hay asignaciones disponibles');
                }

                // Paso 5: Obtener técnicos disponibles para filtros (solo para admin)
                if (role === 1) {
                    try {
                        const techRes = await TechnicianService.getTechnicians();
                        const techs = techRes?.data?.data ?? [];
                        if (mounted) setAvailableTechnicians(Array.isArray(techs) ? techs : []);
                    } catch {
                        // Si falla, continuar sin filtros
                        if (mounted) setAvailableTechnicians([]);
                    }
                } else {
                    if (mounted) toast.success('Asignaciones cargadas correctamente');
                }
            } catch (e) {
                if (mounted) {
                    const errorMsg = e?.message ?? String(e);
                    setError(errorMsg);
                    setAssignments([]);
                    toast.error('Error al cargar las asignaciones: ' + errorMsg);
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

    // Obtener la fecha para un día específico de la semana actual
    function getDateForWeekDay(weekStartDate, dayIndex) {
        const s = startOfWeek(weekStartDate);
        const date = new Date(s.getFullYear(), s.getMonth(), s.getDate() + dayIndex);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }

    // Función auxiliar para obtener nombre de estado en español
    const translateStatus = (statusKey) => {
        const statusMap = {
            'pending': 'Pendiente',
            'assigned': 'Asignado',
            'inProgress': 'En Proceso',
            'resolved': 'Resuelto',
            'closed': 'Cerrado'
        };
        return statusMap[statusKey] || statusKey;
    };

    // Filtrar asignaciones según el técnico seleccionado
    const filteredAssignments = selectedTechnician === 'all' 
        ? assignments 
        : assignments.filter(a => {
            const techId = parseInt(a.Id_Tecnico);
            const selectedId = parseInt(selectedTechnician);
            return techId === selectedId;
        });

    // Agrupar por estado (para Kanban) - usar claves constantes
    const statusKeys = ['assigned', 'inProgress', 'resolved', 'closed'];

    const grouped = {};
    statusKeys.forEach((key) => (grouped[key] = []));
    filteredAssignments.forEach((a) => {
        const st = a.Estado || 'pending'; // Estado ya está en formato de clave
        if (!grouped[st]) grouped[st] = [];
        grouped[st].push(a);
    });

    // Asignaciones filtradas para la semana seleccionada
    const weekAssignments = assignmentsInWeek(weekStart).filter(a => 
        selectedTechnician === 'all' || a.Id_Tecnico === parseInt(selectedTechnician)
    );
    const weekGroupedByDay = groupByWeekDay(weekAssignments, weekStart);


    // ========================================
    // RENDERIZADO - CONTROL DE ACCESO
    // ========================================
    if (accessDenied) {
        // Verificar si es por falta de sesión o por permisos
        const userSession = localStorage.getItem('user');
        const isNoSession = !userSession;

        return (
            <div className="container mx-auto py-8 px-4 text-white">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertTriangle className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-red-400">
                        {isNoSession ? 'Sesión No Iniciada' : 'Acceso Denegado'}
                    </h2>
                    <p className="text-zinc-400 text-center max-w-md">
                        {isNoSession 
                            ? 'Debes iniciar sesión para acceder al tablero de asignaciones. Por favor, inicia sesión con tu cuenta de Andromeda.'
                            : userRole === 3
                                ? 'Los clientes no tienen acceso al tablero de asignaciones. Esta sección está disponible solo para administradores y técnicos.'
                                : 'No tienes permisos para acceder al tablero de asignaciones. Esta sección está disponible solo para administradores y técnicos.'
                        }
                    </p>
                    <div className="flex gap-3">
                        {isNoSession ? (
                            <Button 
                                onClick={() => navigate('/login')}
                                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                                Ir a Iniciar Sesión
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => navigate('/')}
                                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                                Volver al Inicio
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDERIZADO - ESTADO DE CARGA
    // ========================================
    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 text-white">
                <div className="text-sm text-zinc-300">Cargando asignaciones...</div>
            </div>
        );
    }

    // ========================================
    // RENDERIZADO PRINCIPAL
    // ========================================
    return (
        <div className="container mx-auto py-8 px-4 text-white">
            {/* Toast Container para notificaciones */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* CABECERA CON CONTROLES */}
            <div className="flex flex-col gap-6 mb-6">
                {/* Fila 1: Título y Badge en la misma línea */}
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">Tablero de Asignaciones</h2>
                    {/* Badge de rol */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        userRole === 1 
                            ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                            : 'bg-blue-500/20 border border-blue-400/50 text-blue-300'
                    }`}>
                        {userRole === 1 ? 'Administrador' : 'Técnico'}
                    </span>
                </div>

                {/* Fila 2: Controles de filtro y vista */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                    {/* Filtro por técnico (solo visible para admin) */}
                    {userRole === 1 && availableTechnicians.length > 0 && (
                        <>
                            <label className="text-sm text-zinc-300">Filtrar por:</label>
                            <Select value={selectedTechnician} onValueChange={(val) => {
                                setSelectedTechnician(val);
                                if (val === 'all') {
                                    toast.info('Mostrando asignaciones de todos los técnicos');
                                } else {
                                    const tech = availableTechnicians.find(t => String(t.Id) === val);
                                    toast.info(`Filtrando asignaciones de ${tech?.Nombre || 'técnico seleccionado'}`);
                                }
                            }}>
                                <SelectTrigger className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md focus-visible:ring-[#6f3c82]/50 focus-visible:border-[#6f3c82] selection:bg-[#6f3c82] selection:text-[#f7f4f3] w-[220px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3] focus-visible:ring-0 selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
                                    <SelectItem value="all" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">
                                        Todos los técnicos
                                    </SelectItem>
                                    {availableTechnicians.map(tech => (
                                        <SelectItem 
                                            key={tech.Id} 
                                            value={String(tech.Id)}
                                            className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]"
                                        >
                                            {tech.Nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}

                    <label className="text-sm text-zinc-300">Vista:</label>

                    {/* Select personalizado con estilo glassmorphism */}
                    <Select value={viewMode} onValueChange={(val) => {
                        setViewMode(val);
                        toast.success(val === 'kanban' ? 'Vista Kanban activada' : 'Vista Semanal activada');
                    }}>
                        <SelectTrigger className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md focus-visible:ring-[#6f3c82]/50 focus-visible:border-[#6f3c82] selection:bg-[#6f3c82] selection:text-[#f7f4f3] w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3] focus-visible:ring-0 selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
                            <SelectItem value="kanban" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">
                                Kanban
                            </SelectItem>
                            <SelectItem value="week" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">
                                Semanal
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Controles de navegación semanal (solo visible en vista semanal) */}
                    {viewMode === 'week' && (
                        <div className="flex items-center gap-2">
                            {/* Botón: Semana anterior */}
                            <Button
                                size="sm"
                                onClick={() => {
                                    setWeekStart(prev => startOfWeek(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7)));
                                    toast.info('Navegando a la semana anterior');
                                }}
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
                                onClick={() => {
                                    setWeekStart(prev => startOfWeek(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7)));
                                    toast.info('Navegando a la semana siguiente');
                                }}
                                aria-label="Semana siguiente"
                                className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-2 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md hover:bg-[rgba(111,60,130,0.25)] focus-visible:ring-[#6f3c82]/50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>

                            {/* Botón: Volver a semana actual */}
                            <Button
                                size="sm"
                                onClick={() => {
                                    setWeekStart(startOfWeek(new Date()));
                                    toast.success('Mostrando semana actual');
                                }}
                                className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md hover:bg-[rgba(111,60,130,0.25)] focus-visible:ring-[#6f3c82]/50"
                            >
                                Hoy
                            </Button>
                        </div>
                    )}
                    </div>
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
                    {statusKeys.map((statusKey) => (
                        <div
                            key={statusKey}
                            className="min-w-[260px] rounded border-2 border-[#6f3c82] p-3 flex-shrink-0"
                            style={{
                                background: 'rgba(111, 60, 130, 0.1)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)'
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-[#f7f4f3]">{translateStatus(statusKey)}</h3>
                                <span className="text-xs text-[#f7f4f3]/70">{grouped[statusKey].length}</span>
                            </div>

                            <div className="space-y-3">
                                {grouped[statusKey].length === 0 && <div className="text-xs text-zinc-500">No hay asignaciones disponibles</div>}

                                {/* Mapear cada asignación a una tarjeta */}
                                {grouped[statusKey].map((ticket) => (
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
                                                    <div className="text-xs text-zinc-400">
                                                        #{ticket.Id} · {ticket.Categoria}{ticket.Dia ? ` · ${ticket.Dia}` : ""}
                                                        {ticket.Puntaje && <span className="ml-1.5 px-2 py-0.5 bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded text-[10px] font-semibold">★ {Math.round(ticket.Puntaje)}</span>}
                                                    </div>
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
                                                {ticket.Estado === 'resolved' || ticket.Estado === 'closed' ? (
                                                    <span className="text-emerald-400">✓ Completado</span>
                                                ) : ticket.PercentSLA >= 100 && ticket.slaEnd ? (
                                                    <span className="text-red-400 font-medium">⚠️ {getOverdueMessage(ticket.slaEnd)}</span>
                                                ) : (
                                                    <span className="text-zinc-400">{ticket.PercentSLA}% consumido</span>
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
                                                            <Button size="sm" variant="ghost" onClick={() => {
                                                                toast.info(`Abriendo detalles del ticket #${ticket.Id_Ticket}`);
                                                                navigate(`/Assignment/${ticket.Id_Ticket}`);
                                                            }} aria-label={`Ver detalle ${ticket.Id_Ticket}`}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ver detalle</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Badge de Estado Mejorado */}
                                                <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border transition-all duration-200 ${ticket.Estado === 'assigned'
                                                        ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                                                        : ticket.Estado === 'inProgress'
                                                            ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                                                            : ticket.Estado === 'resolved'
                                                                ? 'bg-green-500/20 border-green-400/50 text-green-300'
                                                                : ticket.Estado === 'closed'
                                                                    ? 'bg-gray-500/20 border-gray-400/50 text-gray-300'
                                                                    : 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                                                    }`}>
                                                    {translateStatus(ticket.Estado)}
                                                </div>
                                            </div>

                                            {/* Botones adicionales */}
                                            <div className="flex items-center gap-2">
                                                {/* Botón para modificar estado */}
                                                {/* Técnico: puede cambiar de Asignado -> En Proceso -> Resuelto */}
                                                {/* Admin: solo puede cerrar tickets resueltos */}
                                                {(
                                                    (userRole === 2 && ticket.Estado !== 'closed' && ticket.Estado !== 'resolved') ||
                                                    (userRole === 1 && ticket.Estado === 'resolved')
                                                ) && (
                                                    <Tooltip Tooltip >
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    toast.info(`Preparando cambio de estado para ticket #${ticket.Id_Ticket}`);
                                                                    navigate(`/ChangeState/${ticket.Id_Ticket}`);
                                                                }}
                                                                aria-label={`Cambiar Estado ${ticket.Id_Ticket}`}
                                                            >
                                                                <Edit className="h-4 w-4" style={{ color: '#fc52af' }} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('Cambiar Estado')}</TooltipContent>
                                                    </Tooltip>
                                                )}  
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
                    {weekAssignments.length === 0 && <div className="text-xs text-zinc-500">No hay asignaciones en esta semana</div>}

                    {/* Iterar por cada día de la semana */}
                    {Object.entries(weekGroupedByDay).map(([dayName, dayAssignments], index) => {
                        // Ocultar días sin asignaciones
                        if (dayAssignments.length === 0) return null;

                        return (
                            <div key={dayName} className="space-y-3">
                                {/* Encabezado del día */}
                                <h3 className="text-lg font-semibold text-[#f7f4f3] border-b border-[#6f3c82]/40 pb-2">
                                    {dayName} <span className="text-sm text-zinc-400 font-normal">({getDateForWeekDay(weekStart, index)})</span>
                                </h3>

                                {/* Tarjetas de asignaciones del día */}
                                <div className="space-y-2">
                                    {dayAssignments.map((ticket) => (
                                        <div key={ticket.Id} className="p-3 rounded border-2 border-[#ff95b5]/50 bg-[rgba(255,255,255,0.02)]">
                                            <div className="grid grid-cols-2 gap-4 items-start">
                                                {/* Columna izquierda: Info principal */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {/* Icono relacionado con la categoría */}
                                                        <span className="p-2 rounded-full bg-purple-500/20 border border-purple-400/50">
                                                            {categoryIcon(ticket.Categoria)}
                                                        </span>
                                                        <span className="text-sm font-medium text-zinc-100">{ticket.Titulo}</span>
                                                    </div>
                                                    <div className="text-xs text-zinc-400">
                                                        <span>#{ticket.Id}</span> · <span>{ticket.Categoria}</span> · {ticket.Dia ? <span>{ticket.Dia} · </span> : null}{ticket.Tecnico ? <span>{ticket.Tecnico}</span> : null}
                                                        {ticket.Puntaje && <span className="ml-1.5 px-2 py-0.5 bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded text-[10px] font-semibold">★ {Math.round(ticket.Puntaje)}</span>}
                                                    </div>
                                                    <div className="text-xs text-zinc-400 mt-1">Fecha: {formatDateShort(ticket.slaStart || ticket.Fecha_AsignacionRaw)}</div>
                                                </div>

                                                {/* Columna derecha: Estado, SLA, tiempo límite, botones */}
                                                <div className="flex flex-col items-end gap-2">
                                                    {/* Estado */}
                                                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border shadow-sm transition-all duration-200 ${ticket.Estado === 'assigned'
                                                            ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                                                            : ticket.Estado === 'inProgress'
                                                                ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                                                                : ticket.Estado === 'resolved'
                                                                    ? 'bg-green-500/20 border-green-400/50 text-green-300'
                                                                    : ticket.Estado === 'closed'
                                                                        ? 'bg-gray-500/20 border-gray-400/50 text-gray-300'
                                                                        : 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                                                        }`}>
                                                        {translateStatus(ticket.Estado)}
                                                    </div>
                                                    {/* SLA barra y porcentaje */}
                                                    <div className="w-40">
                                                        <div className="w-full h-2 bg-black/20 rounded">
                                                            <div className={`h-2 rounded ${ticket.Estado === 'resolved' || ticket.Estado === 'closed' ? 'bg-emerald-500' : ticket.PercentSLA >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-red-400'}`} style={{ width: `${ticket.PercentSLA}%` }} />
                                                        </div>
                                                        <div className="text-xs text-zinc-400 mt-1">{ticket.PercentSLA}% consumido</div>
                                                    </div>
                                                    {/* Tiempo límite */}
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <span className="inline-flex items-center gap-1">
                                                            {/* Icono de reloj */}
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
                                                            <span>Tiempo límite:</span>
                                                        </span>
                                                        <span className="font-semibold text-pink-300">
                                                            {ticket.slaEnd && ticket.slaEnd !== 'N/D' ? formatDateShort(ticket.slaEnd) : 'Sin límite'}
                                                        </span>
                                                    </div>
                                                    {/* Botones de acción */}
                                                    <div className="flex flex-row items-end gap-2">
                                                        {(
                                                            (userRole === 2 && ticket.Estado !== 'closed' && ticket.Estado !== 'resolved') ||
                                                            (userRole === 1 && ticket.Estado === 'resolved')
                                                        ) && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                toast.info(`Preparando cambio de estado para ticket #${ticket.Id_Ticket}`);
                                                                                navigate(`/ChangeState/${ticket.Id_Ticket}`);
                                                                            }}
                                                                            aria-label={`Cambiar Estado ${ticket.Id_Ticket}`}
                                                                        >
                                                                            <Edit className="h-4 w-4" style={{ color: '#fc52af' }} />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Cambiar Estado</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                        {/* Botón para ver detalles */}
                                                        <Button size="sm" variant="ghost" onClick={() => {
                                                            toast.info(`Abriendo detalles del ticket #${ticket.Id_Ticket}`);
                                                            navigate(`/Assignment/${ticket.Id_Ticket}`);
                                                        }}>
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
            )
            }
        </div >
    );
}
