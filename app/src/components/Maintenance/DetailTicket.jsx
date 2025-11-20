// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { formatDate } from '@/lib/utils';
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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function DetailTicket() {
    const { t, lang } = useI18n();
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
    if (error) return <ErrorAlert title={t('details.ticket.loadError')} message={error} />;
    if (!ticketResp || !ticketResp.data)
        return <EmptyState message={t('details.ticket.noData')} />;
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
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.userRequester')}:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.UsuarioSolicitante?.Nombre || t('common.notAvailable')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {ticket.UsuarioSolicitante?.Correo || ''}
                                </p>
                            </div>

                            {/* Categoría */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.category')}:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Categoria || t('common.notAvailable')}
                                </p>
                            </div>

                            {/* Prioridad */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.priority.label')}:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Prioridad || t('common.notAvailable')}
                                </p>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.status')}:</span>
                                </div>
                                <Badge variant="outline">
                                    {ticket.Estado || t('common.notAvailable')}
                                </Badge>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2 pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>{t('details.ticket.description')}:</span>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {ticket.Descripcion || t('details.ticket.noDescription')}
                            </p>
                        </div>

                        {/* Fechas */}
                        <div className="grid gap-4 md:grid-cols-2 pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                            {/* Fecha de Creación */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.creationDate')}:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Fecha_Creacion ? formatDate(new Date(ticket.Fecha_Creacion), { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }, lang) : t('common.notAvailable')}
                                </p>
                            </div>

                            {/* Fecha Límite Respuesta */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.responseDeadline')}:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Fecha_Limite_Respuesta ? formatDate(new Date(ticket.Fecha_Limite_Respuesta), { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }, lang) : t('common.notAvailable')}
                                </p>
                            </div>

                            {/* Fecha Límite Resolución */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.resolutionDeadline')}:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {ticket.Fecha_Limite_Resolucion ? formatDate(new Date(ticket.Fecha_Limite_Resolucion), { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }, lang) : t('common.notAvailable')}
                                </p>
                            </div>

                            {/* Fecha de Cierre */}
                            {ticket.Fecha_Cierre && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                        <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.closeDate')}:</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {formatDate(new Date(ticket.Fecha_Cierre), { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }, lang)}
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
                                <span className="font-semibold">{t('details.ticket.slaResponseCompliance')}:</span>
                                <Badge variant={ticket.cumplimiento_respuesta ? 'default' : 'destructive'}>
                                    {ticket.cumplimiento_respuesta ? t('details.ticket.met') : t('details.ticket.notMet')}
                                </Badge>
                            </div>

                            {/* Cumplimiento Resolución */}
                            <div className="flex items-center gap-3">
                                {ticket.cumplimiento_resolucion ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="font-semibold">{t('details.ticket.slaResolutionCompliance')}:</span>
                                <Badge variant={ticket.cumplimiento_resolucion ? 'default' : 'destructive'}>
                                    {ticket.cumplimiento_resolucion ? t('details.ticket.met') : t('details.ticket.notMet')}
                                </Badge>
                            </div>
                        </div>

                        {/* Historial de Estados */}
                        {ticket.HistorialEstados && ticket.HistorialEstados.length > 0 && (
                            <div className="pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertCircle className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>{t('details.ticket.statusHistory')}:</span>
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
                                                    {historial.Estado_Anterior || t('common.notAvailable')}
                                                </Badge>
                                                <span className="text-sm">→</span>
                                                <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                                                    {historial.Estado_Nuevo || t('common.notAvailable')}
                                                </Badge>
                                            </div>

                                            {/* Fecha del cambio */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                {historial.Fecha_Cambio ? formatDate(new Date(historial.Fecha_Cambio), { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }, lang) : t('common.notAvailable')}
                                            </div>

                                            {/* Usuario responsable */}
                                            {(historial.Usuario_Responsable || historial.Id_Usuario_Responsable) && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <User className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                    <span>{t('details.ticket.responsible')}: {historial.Usuario_Responsable || `${t('details.ticket.userId')}: ${historial.Id_Usuario_Responsable}`}</span>
                                                </div>
                                            )}

                                            {/* Observaciones */}
                                            {historial.Observaciones && (
                                                <div className="text-sm mt-2">
                                                    <span className="font-medium">{t('details.ticket.observations')}:</span>
                                                    <p className="text-muted-foreground mt-1">{historial.Observaciones}</p>
                                                </div>
                                            )}

                                            {/* Imágenes asociadas al historial */}
                                            {historial.Imagenes && historial.Imagenes.length > 0 && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium">{t('details.ticket.attachedImages')}:</span>
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
                                        <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>{t('details.ticket.userRating')}:</span>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Columna Izquierda */}
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium" style={{ color: '#f7f4f3' }}>{t('details.ticket.user')}:</span>
                                                <p className="text-muted-foreground mt-1">{ticket.UsuarioSolicitante?.Nombre || t('common.notAvailable')}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: '#f7f4f3' }}>{t('details.ticket.score')}:</span>
                                                <div className="mt-1">
                                                    <Badge 
                                                        style={{
                                                            backgroundColor: val.Puntaje >= 4 ? '#22c55e' : val.Puntaje >= 3 ? '#eab308' : '#ef4444',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {val.Puntaje || t('common.notAvailable')} / 5
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Columna Derecha */}
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium" style={{ color: '#f7f4f3' }}>{t('details.ticket.date')}:</span>
                                                <p className="text-muted-foreground mt-1">
                                                    {val.Fecha_Valoracion ? formatDate(new Date(val.Fecha_Valoracion), { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }, lang) : t('common.notAvailable')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Comentario - Ancho completo */}
                                    {val.Comentario && (
                                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(252, 82, 175, 0.3)' }}>
                                            <span className="font-medium" style={{ color: '#f7f4f3' }}>{t('details.ticket.comment')}:</span>
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
                {t('common.back')}
            </Button>
        </div>
    );
}