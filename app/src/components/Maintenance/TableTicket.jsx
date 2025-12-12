// ========================================
// IMPORTS
// ========================================
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Componentes UI
import { useState } from "react";
import { useEffect } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";


// Shadcn UI Components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, ArrowLeft, UserPlus, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

// Servicio a llamar
import TicketService from "../../services/TicketService";
import UserService from "../../services/UserService";
import CategoryService from "@/services/CategoryService";
import TechnicianService from "@/services/TechnicianService";
import AutoTriageService from "@/services/AutoTriageService";
import AssignmentService from "@/services/AssignmentService";
import ValoracionService from "@/services/ValoracionService";

// ========================================
// CONFIGURACIÓN DE TABLA
// ========================================
function useColumns(t) {
    return [
        { key: "Usuario", label: t('tables.tickets.columns.user') },
        { key: "Titulo", label: t('tables.tickets.columns.title') },
        { key: "Estado", label: t('tables.tickets.columns.status') },
        { key: "actions", label: t('tables.common.actions') },
    ];
}


// ========================================
// COMPONENTE: Tabla de Tickets
// ========================================
export default function TableTickets() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const columns = useColumns(t);

    //#region API
    // Resultado de consumo del API, respuesta
    const [data, setData] = useState(null);
    // Error del API
    const [error, setError] = useState('');
    // Booleano para establecer si se ha recibido respuesta
    const [loaded, setLoaded] = useState(true);
    const [user, setUser] = useState({});
    const [autoTriage, setAutoTriage] = useState(null);
    const [valoraciones, setValoraciones] = useState({});

    // Estado de datos y UI
    let dataToSend = {};

    // Función para recargar valoraciones
    const recargarValoraciones = async () => {
        try {
            const valResponse = await ValoracionService.getAllValoraciones();
            if (valResponse.data.success && valResponse.data.data) {
                const valMap = {};
                valResponse.data.data.forEach(val => {
                    valMap[val.Id_Ticket] = true;
                });
                setValoraciones(valMap);
            }
        } catch (valErr) {
            console.log('No se pudieron cargar valoraciones:', valErr);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener usuario actual desde localStorage
                const userSession = localStorage.getItem('user');
                if (!userSession) {
                    toast.error('Sesión no iniciada');
                    navigate('/login');
                    return;
                }

                const currentUser = JSON.parse(userSession);
                const id = currentUser.Id || currentUser.id;
                let rol = null;
                
                const [userData] = await Promise.all([
                    UserService.getUserById(id),
                ]);
                if (userData.data.success) {
                    setUser(userData.data.data) || [];
                    rol = userData.data.data.Rol || null;
                };
                if (rol == 1) {
                    const response = await TicketService.getTickets();
                    setData(response.data)
                    if (!response.data.success) {
                        setError(response.data.message)
                    }
                } else {
                    if (rol == 2) {
                        const response = await TicketService.getTicketTechnician(userData.data.data.Id);
                        console.log(response.data)
                        setData(response.data)
                    } else {
                        const response = await TicketService.getTicketClient(userData.data.data.Id);
                        console.log(response.data)
                        setData(response.data)
                    }
                }
                const autoTriageResponse = await AutoTriageService.getAutoTriage();
                if (autoTriageResponse.data.success) {
                    setAutoTriage(autoTriageResponse.data.data);
                }

                // Cargar valoraciones
                await recargarValoraciones();
            } catch (err) {
                // Si el error no es por cancelación, se registra 
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                // Independientemente del resultado, se actualiza el loading 
                setLoaded(false);
            }
        };
        fetchData()
    }, [navigate]);

    // Efecto para recargar cuando el componente se vuelve visible (navegación)
    useEffect(() => {
        const handleFocus = () => {
            // Recargar valoraciones cuando la ventana vuelve a tener foco
            recargarValoraciones();
        };

        window.addEventListener('focus', handleFocus);
        
        // Listener para cuando se vuelve a esta página
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                recargarValoraciones();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    //Asignar Auto
    function AsignarAuto() {
        if (!data || !data.data) {
            toast.error(t('No se encontró información de tickets.'));
            return;
        }
        // Filter tickets that are "Pendiente"
        const pendingTickets = data.data.filter(ticket => ticket.Estado === 'Pendiente');
        if (pendingTickets.length === 0) {
            toast.error(t('No hay tickets pendientes para asignar.'));
            return;
        } else {
            pendingTickets.forEach(async ticket => {
                console.log('Ticket', ticket);
                //Categoría del Ticket
                const Category = await CategoryService.getCategoryById(ticket.Id_Categoria);
                console.log('Categoría', Category.data.data);
                //Especialidades
                console.log('Especialidad', Category.data.data);
                //#region Tecnico
                //Tencnicos Disponibles
                // Obtener técnicos por especialidad evitando duplicados
                const techPromises = Category.data.data.Especialidades.map((Especialidad) =>
                    TechnicianService.getTechniciansByEtiqueta(Especialidad.Id)
                );
                const techResults = await Promise.all(techPromises);
                const allTechnicians = techResults.flatMap(techData =>
                    techData.data.success ? techData.data.data : []
                );
                // Eliminar duplicados basándose en el Id del técnico
                const uniqueTechnicians = Array.from(
                    new Map(allTechnicians.map(tech => [tech.Id, tech])).values()
                );
                console.log('Técnicos Disponibles', uniqueTechnicians);

                //#endregion Tecnico
                //Calcular Horas Faltantes
                // Convertir fecha actual a zona horaria de Costa Rica
                const fechaActual = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
                const fechaLimite = new Date(ticket.Fecha_Limite_Resolucion);
                // Calcular diferencia en milisegundos y convertir a horas
                const diferenciaMs = fechaLimite.getTime() - fechaActual.getTime();
                const horasFaltantes = diferenciaMs / (1000 * 60 * 60);
                console.log('Fecha Actual (Costa Rica):', fechaActual);
                console.log('Fecha Límite:', fechaLimite);
                console.log('Horas Faltantes:', horasFaltantes.toFixed(2));
                const Puntaje = (ticket.Prioridad * 1000) - horasFaltantes;
                console.log('Puntaje Calculado:', Puntaje.toFixed(0));
                //AutoTriage
                let TriageAsignadom = null;
                let mejorMatch = null;
                
                autoTriage.forEach(item => {
                    
                    // Buscar el auto-triage
                    if (Number(item.Horas_Faltantes) >= horasFaltantes && 
                        Number(item.Peso_Prioridad_Ticket) <= Puntaje) {
                        // Si no hay mejor match o este tiene menos horas faltantes (más específico)
                        if (!mejorMatch || Number(item.Horas_Faltantes) < Number(mejorMatch.Horas_Faltantes)) {
                            mejorMatch = item;
                        }
                    }
                });
                
                TriageAsignadom = mejorMatch || {};
                if (!mejorMatch) {
                    TriageAsignadom.Peso_Prioridad_Ticket = Puntaje.toFixed(0);
                }
                console.log('Triage Asignado:', TriageAsignadom);
                //Asignar Tecnico
                let technicianOficial = uniqueTechnicians[0]; // Placeholder para el técnico seleccionado
                uniqueTechnicians.map(async technician => {
                    if (technicianOficial.CargaTrabajo > technician.CargaTrabajo) {
                        technicianOficial = technician;
                    }
                });
                uniqueTechnicians.map(async technician => {
                    if (TriageAsignadom) {
                        if (technician.CargaTrabajo <= TriageAsignadom.Max_Carga_Trabajo) {
                            technicianOficial = technician;
                        }
                    }
                });
                console.log('Técnico Asignado:', technicianOficial);
                
                //Asignar Ticket
                // Formatear fecha para MySQL (YYYY-MM-DD HH:MM:SS)
                const formatToMySQL = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                };
                console.log(Puntaje.toFixed(0));
                dataToSend = {
                    Id_Ticket: Number(ticket.Id),
                    Observaciones: 'Ticket Asignado Automáticamente',
                    Estado_Anterior: 1,
                    Estado_Nuevo: 2,
                    Fecha_Cambio: formatToMySQL(fechaActual),
                    Id_Usuario_Responsable: null, //ERROR Temporalmente Admin
                    Id_Tecnico: Number(technicianOficial.Id),
                    Id_Usuario_Ticket: Number(ticket.Id_Usuario),
                    Metodo_Asignacion: 2,
                    Id_ReglaAutobriage: Number(TriageAsignadom.Id) || null,
                    Puntaje: Number(Puntaje.toFixed(0)),
                    Prioridad: Number(ticket.Prioridad)
                };
                handleSubmit();
            });
        }
    }

    const handleSubmit = async () => {
        try {
            console.log('Datos a enviar:', dataToSend);

            let response;
            response = await AssignmentService.createAssignment(dataToSend);

            console.log('Respuesta del servidor:', response.data);

            if (response.data.success) {
                toast.success('Se ha asignado el ticket correctamente.');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error('Error al asignar el ticket.');
            }
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Respuesta del error:', err.response?.data);
            toast.error('Error al asignar el ticket.');
        }
    };

    if (loaded) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title={t('tables.tickets.loadError')} message={error} />;
    if (!data || data.data.length === 0)
        return <EmptyState message={t('tables.tickets.empty')} />;
    //#endregion API

    // Interfaz
    return (
        <div className="py-12 px-6 md:px-10 lg:px-16">
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
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-shrikhand tracking-wider" style={{ fontFamily: "Shrikhand" }}>{t('tables.tickets.title')}</h1>

                <div className="flex items-center gap-3">
                    {/* Botón de Asignación Automática solo para rol 1 */}
                    {user.Rol == 1 || user.Rol == '1' ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="default"
                                        onClick={() => { AsignarAuto() }}
                                        className="cursor-pointer gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 relative overflow-hidden"
                                        style={{
                                            border: '2px solid transparent',
                                            backgroundImage: 'linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)), linear-gradient(90deg, #a855f7, #3b82f6, #a855f7)',
                                            backgroundOrigin: 'border-box',
                                            backgroundClip: 'padding-box, border-box',
                                            animation: 'border-spin 3s linear infinite',
                                        }}
                                    >
                                        <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                                        <span className="font-semibold">
                                            {t('Asignación Automática')}
                                        </span>
                                        <style>{`
                                            @keyframes border-spin {
                                                0% {
                                                    background-image: linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)), linear-gradient(0deg, #a855f7, #3b82f6, #a855f7);
                                                }
                                                25% {
                                                    background-image: linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)), linear-gradient(90deg, #a855f7, #3b82f6, #a855f7);
                                                }
                                                50% {
                                                    background-image: linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)), linear-gradient(180deg, #a855f7, #3b82f6, #a855f7);
                                                }
                                                75% {
                                                    background-image: linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)), linear-gradient(270deg, #a855f7, #3b82f6, #a855f7);
                                                }
                                                100% {
                                                    background-image: linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)), linear-gradient(360deg, #a855f7, #3b82f6, #a855f7);
                                                }
                                            }
                                        `}</style>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('Asignar automáticamente tickets')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : null}

                    {/* Botón Ver Valoraciones - Todos los roles */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() => navigate('/Review')}
                                    className="cursor-pointer gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border-yellow-500/50 hover:border-yellow-500 transition-all duration-200"
                                >
                                    <Star className="h-5 w-5 text-yellow-400" />
                                    <span className="font-semibold">
                                        {user.Rol == '1' ? t('Dashboard de Valoraciones') : 
                                         user.Rol == '2' ? t('Mis Valoraciones') : 
                                         t('Ver Valoraciones')}
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {user.Rol == '1' ? t('Ver todas las valoraciones de servicio') : 
                                     user.Rol == '2' ? t('Ver valoraciones de tus tickets') : 
                                     t('Ver tus valoraciones de servicio')}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Botón de Crear Ticket */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="flex flex-row gap-4 items-center">
                                <Button asChild variant="outline" size="icon" className="text-primary">
                                    <Link to="/CreateTicket/new">
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('tables.tickets.create')}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="rounded-lg border-2 border-[#fc52af] overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#352c50]">
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className="text-primary font-semibold"
                                >
                                    {column.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.data.map((row) => (
                            <TableRow key={row.Id}>
                                <TableCell className="font-medium">
                                    {row.Usuario}
                                </TableCell>
                                <TableCell>
                                    {row.Titulo}
                                </TableCell>
                                <TableCell>
                                    {row.Estado}
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/Ticket/${row.Id}`)}
                                                    className={"cursor-pointer"}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('tables.common.viewDetails')}</p>
                                            </TooltipContent>
                                        </Tooltip >
                                        {row.Estado == 'Pendiente' && user.Rol == '1' && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/AssignTicket/${row.Id}`)}
                                                        aria-label={`Asignar Ticket ${row.Id}`}
                                                        className="cursor-pointer gap-2 bg-gradient-to-r from-[#5334A0]/10 to-purple-500/10 border-[#fc52af]/50 hover:bg-[#fc52af]/20 hover:border-[#fc52af] transition-all duration-200"
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                        <span className="text-xs font-semibold">
                                                            {t('Asignar')}
                                                        </span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>{t('Asignar Ticket a Técnico')}</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {row.Estado == 'Resuelto' && (user.Rol == '1' || user.Rol == '3') && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            toast.info(`Cerrando ticket #${row.Id}`);
                                                            navigate(`/ChangeState/${row.Id}`);
                                                        }}
                  ñ                                      aria-label={`Cerrar Ticket ${row.Id}`}
                                                        className="cursor-pointer gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50 hover:bg-green-500/20 hover:border-green-500 transition-all duration-200"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs font-semibold">
                                                            {t('Cerrar')}
                                                        </span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>{t('Cerrar Ticket')}</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {(() => {
                                            // Verificar condiciones para mostrar botón de valorar
                                            const estaCerrado = row.Estado === 'Cerrado' || row.Estado === 'cerrado';
                                            const esCliente = user.Rol == 3 || user.Rol == '3';
                                            const esDueno = String(row.Id_Usuario) === String(user.Id);
                                            const yaValorado = valoraciones[row.Id] === true;
                                            
                                            // Solo mostrar si: está cerrado, es cliente, es dueño, y NO ha sido valorado
                                            return estaCerrado && esCliente && esDueno && !yaValorado && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                toast.info(`Valorando ticket #${row.Id}`);
                                                                navigate(`/Ticket/${row.Id}`);
                                                            }}
                                                            aria-label={`Valorar Ticket ${row.Id}`}
                                                            className="cursor-pointer gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50 hover:bg-yellow-500/20 hover:border-yellow-500 transition-all duration-200"
                                                        >
                                                            <Star className="h-4 w-4" />
                                                            <span className="text-xs font-semibold">
                                                                {t('Valorar')}
                                                            </span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('Valorar Servicio')}</TooltipContent>
                                                </Tooltip>
                                            );
                                        })()}
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
