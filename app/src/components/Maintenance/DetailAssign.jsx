// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, Target, ChevronRight, ArrowLeft } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

// Servicio
import AssignmentService from "../../services/AssignmentService";

// ========================================
// MAPEOS / CONSTANTES DE UI
// ========================================

// ========================================
// COMPONENTE: Detalle de Asignación
// ========================================
export function DetailAssignment() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { id } = useParams();
    const [assignResp, setAssignResp] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mapeos dinámicos con traducciones
    const METODO_ASIGNACION = {
        1: t('details.assignment.assignmentMethod.manual'),
        2: t('details.assignment.assignmentMethod.automatic'),
    };

    const PRIORIDAD_DESC = {
        1: t('details.ticket.priority.veryLow'),
        2: t('details.ticket.priority.low'),
        3: t('details.ticket.priority.medium'),
        4: t('details.ticket.priority.high'),
        5: t('details.ticket.priority.critical'),
    };

    // Cargar detalle de la asignación al montar o cambiar id
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Consultar una sola asignación por su Id
                const response = await AssignmentService.getAssignmentSingle(id);
                setAssignResp(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                }
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title={t('details.assignment.loadError')} message={error} />;
    if (!assignResp || !assignResp.data)
        return <EmptyState message={t('details.assignment.noData')} />;

    // Normalizar respuesta: si viene arreglo, tomar primer elemento
    const asignacion = Array.isArray(assignResp.data) ? assignResp.data[0] : assignResp.data;

    const tecnicoId = id;
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                {/* Encabezado principal */}
                <div className="flex items-end justify-between gap-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {t('details.assignment.title')} #{asignacion.Id} — {t('details.assignment.technician')} #{tecnicoId}
                    </h1>
                    <Badge variant="secondary" className="text-sm">{t('details.assignment.detailBadge')}</Badge>
                </div>

                {/* Tarjeta con información de asignación y ticket */}
                <div className="space-y-4">
                    <Card 
                        className="border-2 border-[#fc52af] backdrop-blur-lg"
                        style={{
                            backgroundColor: 'rgba(252, 82, 175, 0.05)',
                            boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                        }}
                    >
                        <CardContent className="p-6 space-y-6">
                                {/* Encabezado de ticket + acciones */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">{t('details.assignment.ticket')} #{asignacion.Id_Ticket ?? 'N/D'}</div>
                                    <div className="flex items-center gap-2">
                                        {asignacion.Id_Ticket && (
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/Ticket/${asignacion.Id_Ticket}`)}>
                                                {t('details.assignment.viewTicket')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {/* Información principal */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Fecha de asignación */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.assignment.assignmentDate')}:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {asignacion.Fecha_Asignacion || 'N/D'}
                                        </p>
                                    </div>

                                    {/* Método de asignación */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Settings className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.assignment.assignmentMethodLabel')}:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {METODO_ASIGNACION[asignacion.Metodo_Asignacion] || asignacion.Metodo_Asignacion || 'N/D'}
                                        </p>
                                    </div>

                                    {/* Prioridad */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Target className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.ticket.priority.label')}:</span>
                                            <Badge variant={asignacion.Prioridad >= 4 ? 'destructive' : 'secondary'}>
                                                {asignacion.Prioridad}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {PRIORIDAD_DESC[asignacion.Prioridad] || 'N/D'}
                                        </p>
                                    </div>

                                    {/* Regla de autotriage */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <ChevronRight className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.assignment.autoTriageRule')}:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {asignacion.Id_ReglaAutobriage ? `#${asignacion.Id_ReglaAutobriage}` : t('details.assignment.noRuleApplied')}
                                        </p>
                                    </div>
                                </div>

                                {/* Información del ticket */}
                                <div className="pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                                    <div className="space-y-2">
                                        <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>{t('details.assignment.ticketInfo')}</span>
                                        <div className="grid gap-2">
                                            <p><span className="font-medium">{t('details.ticket.category')}:</span> {asignacion.Categoria || 'N/D'}</p>
                                            <p><span className="font-medium">{t('details.ticket.status')}:</span> <Badge variant="outline">{asignacion.Estado || 'N/D'}</Badge></p>
                                            <p><span className="font-medium">{t('details.assignment.timeLimit')}:</span> {asignacion.TiempoLimite || 'N/D'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                </div>
            </div>

            {/* Botón para volver a la vista anterior */}
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