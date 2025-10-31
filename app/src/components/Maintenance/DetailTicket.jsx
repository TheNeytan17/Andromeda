// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    AlertCircle,
    User,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Target,
    FolderOpen,
    ArrowLeft
} from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

// Servicio a llamar
import TicketService from "@/services/TicketService";

// ========================================
// MAPEOS / CONSTANTES
// ========================================
// Descripciones legibles para prioridad
const PRIORIDAD_DESC = {
    1: 'Muy Baja',
    2: 'Baja',
    3: 'Media',
    4: 'Alta',
    5: 'Crítica'
};

// Descripciones legibles para estado
const ESTADO_DESC = {
    1: 'Pendiente',
    2: 'Asignado',
    3: 'En Progreso',
    4: 'Resuelto',
    5: 'Cerrado',
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function DetailTicket() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ticketResp, setData] = useState(null); // Respuesta cruda del API
    const [error, setError] = useState(null);     // Error de carga
    const [loading, setLoading] = useState(true); // Flag de carga
    // Base URL para imágenes adjuntas al historial
    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    // ========================================
    // EFECTO: CARGA DE TICKET POR ID
    // ========================================
    useEffect(() => { 
        const fetchData = async () => { 
            try { 
                const response = await TicketService.getTicketById(id); 
                // Si la petición es exitosa, se guardan los datos 
                console.log(response.data) // Debug opcional
                setData(response.data) 
                if(!response.data.success){ 
                    setError(response.data.message) 
                } 
            } catch (err) { 
                // Si el error no es por cancelación, se registra 
                if (err.name !== "AbortError") setError(err.message); 
            } finally { 
                // Independientemente del resultado, se actualiza el loading 
                setLoading(false); 
            } 
        }; 
        fetchData() 
    }, [id]);

    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title="El Id del ticket es incorrecto" message={error} />;
    if (!ticketResp || !ticketResp.data)
        return <EmptyState message="No se encontró el ticket con ese Id." />;
    // ========================================
    // FIN API
    // ========================================

    const ticket = ticketResp.data;


    // ========================================
    // RENDER - INTERFAZ
    // ========================================
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                {/* Título del ticket */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {ticket.Titulo}
                </h1>

                <Card 
                    className="border-2 border-[#fc52af] backdrop-blur-lg"
                    style={{
                        backgroundColor: 'rgba(252, 82, 175, 0.05)',
                        boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                    }}
                >
                    <CardContent className="p-6 space-y-6">
                        {/* Información básica */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Usuario */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Usuario Solicitante:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.UsuarioSolicitante?.Nombre || 'N/D'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {ticket.UsuarioSolicitante?.Correo || ''}
                                </p>
                            </div>

                            {/* Categoría */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Categoría:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Categoria || 'N/D'}
                                </p>
                            </div>

                            {/* Prioridad */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Prioridad:</span>
                                    <Badge variant={ticket.Prioridad >= 4 ? 'destructive' : 'secondary'}>
                                        {ticket.Prioridad}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground">
                                    {PRIORIDAD_DESC[ticket.Prioridad] || 'N/D'}
                                </p>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Estado:</span>
                                </div>
                                <Badge variant="outline">
                                    {ESTADO_DESC[ticket.Estado] || ticket.Estado || 'N/D'}
                                </Badge>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2 pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>Descripción:</span>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {ticket.Descripcion || 'Sin descripción'}
                            </p>
                        </div>

                        {/* Fechas */}
                        <div className="grid gap-4 md:grid-cols-2 pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                            {/* Fecha de Creación */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Fecha de Creación:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Fecha_Creacion ? new Date(ticket.Fecha_Creacion).toLocaleString('es-ES') : 'N/D'}
                                </p>
                            </div>

                            {/* Fecha Límite Respuesta */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Fecha Límite Respuesta:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Fecha_Limite_Respuesta ? new Date(ticket.Fecha_Limite_Respuesta).toLocaleString('es-ES') : 'N/D'}
                                </p>
                            </div>

                            {/* Fecha Límite Resolución */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Fecha Límite Resolución:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Fecha_Limite_Resolucion ? new Date(ticket.Fecha_Limite_Resolucion).toLocaleString('es-ES') : 'N/D'}
                                </p>
                            </div>

                            {/* Fecha de Cierre */}
                            {ticket.Fecha_Cierre && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                        <span className="font-semibold" style={{ color: '#f7f4f3' }}>Fecha de Cierre:</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {new Date(ticket.Fecha_Cierre).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Cumplimiento SLA */}
                        <div className="grid gap-4 md:grid-cols-2 pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                            {/* Cumplimiento Respuesta */}
                            <div className="flex items-center gap-3">
                                {ticket.cumplimiento_respuesta ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="font-semibold">Cumplimiento SLA Respuesta:</span>
                                <Badge variant={ticket.cumplimiento_respuesta ? 'default' : 'destructive'}>
                                    {ticket.cumplimiento_respuesta ? 'Cumplido' : 'No Cumplido'}
                                </Badge>
                            </div>

                            {/* Cumplimiento Resolución */}
                            <div className="flex items-center gap-3">
                                {ticket.cumplimiento_resolucion ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="font-semibold">Cumplimiento SLA Resolución:</span>
                                <Badge variant={ticket.cumplimiento_resolucion ? 'default' : 'destructive'}>
                                    {ticket.cumplimiento_resolucion ? 'Cumplido' : 'No Cumplido'}
                                </Badge>
                            </div>
                        </div>

                        {/* Historial de Estados */}
                        {ticket.HistorialEstados && ticket.HistorialEstados.length > 0 && (
                            <div className="pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertCircle className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>Historial de Estados:</span>
                                </div>
                                <div className="space-y-3">
                                    {ticket.HistorialEstados.map((historial, index) => (
                                        <div 
                                            key={historial.Id || index} 
                                            className="p-4 rounded-lg space-y-2 border-l-4 backdrop-blur-md"
                                            style={{
                                                backgroundColor: 'rgba(255, 143, 87, 0.25)',
                                                borderLeftColor: '#ff8f57',
                                                border: '1px solid rgba(255, 143, 87, 0.4)',
                                                boxShadow: '0 4px 6px rgba(255, 143, 87, 0.2)'
                                            }}
                                        >
                                            {/* Línea de cambio de estado */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="bg-red-100 dark:bg-red-900">
                                                    {ESTADO_DESC[historial.Estado_Anterior] || `Estado ${historial.Estado_Anterior}`}
                                                </Badge>
                                                <span className="text-sm">→</span>
                                                <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                                                    {ESTADO_DESC[historial.Estado_Nuevo] || `Estado ${historial.Estado_Nuevo}`}
                                                </Badge>
                                            </div>

                                            {/* Fecha del cambio */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                {historial.Fecha_Cambio ? new Date(historial.Fecha_Cambio).toLocaleString('es-ES') : 'N/D'}
                                            </div>

                                            {/* Usuario responsable */}
                                            {(historial.Usuario_Responsable || historial.Id_Usuario_Responsable) && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <User className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                    <span>Responsable: {historial.Usuario_Responsable || `Usuario ID: ${historial.Id_Usuario_Responsable}`}</span>
                                                </div>
                                            )}

                                            {/* Observaciones */}
                                            {historial.Observaciones && (
                                                <div className="text-sm mt-2">
                                                    <span className="font-medium">Observaciones:</span>
                                                    <p className="text-muted-foreground mt-1">{historial.Observaciones}</p>
                                                </div>
                                            )}

                                            {/* Imágenes asociadas al historial */}
                                            {historial.Imagenes && historial.Imagenes.length > 0 && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium">Imágenes adjuntas:</span>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {historial.Imagenes.map((imagen, imgIndex) => (
                                                            <div key={imgIndex} className="relative group">
                                                                <img 
                                                                    src={`${BASE_URL}/${imagen.Imagen}`} 
                                                                    alt={`Historial ${index} Imagen ${imgIndex}`} 
                                                                    className="max-w-xs h-32 object-cover rounded border hover:border-primary cursor-pointer transition-all" 
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Valoración */}
                        {ticket.Valoracion && (() => {
                            const val = Array.isArray(ticket.Valoracion) ? ticket.Valoracion[0] : ticket.Valoracion;
                            if (!val) return null;
                            return (
                                <div className="pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Target className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                        <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>Valoración del Usuario:</span>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Columna Izquierda */}
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium" style={{ color: '#f7f4f3' }}>Usuario:</span>
                                                <p className="text-muted-foreground mt-1">{ticket.UsuarioSolicitante?.Nombre || 'N/D'}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: '#f7f4f3' }}>Puntaje:</span>
                                                <div className="mt-1">
                                                    <Badge 
                                                        style={{
                                                            backgroundColor: val.Puntaje >= 4 ? '#22c55e' : val.Puntaje >= 3 ? '#eab308' : '#ef4444',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {val.Puntaje || 'N/D'} / 5
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Columna Derecha */}
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium" style={{ color: '#f7f4f3' }}>Fecha:</span>
                                                <p className="text-muted-foreground mt-1">
                                                    {val.Fecha_Valoracion ? new Date(val.Fecha_Valoracion).toLocaleString('es-ES') : 'N/D'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Comentario - Ancho completo */}
                                    {val.Comentario && (
                                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(252, 82, 175, 0.3)' }}>
                                            <span className="font-medium" style={{ color: '#f7f4f3' }}>Comentario:</span>
                                            <p className="text-muted-foreground mt-2">{val.Comentario}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            {/* Botón para volver */}
            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}