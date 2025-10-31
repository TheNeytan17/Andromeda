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
import { Calendar, Settings, Target, ChevronRight, ArrowLeft } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

// Servicio
import AssignmentService from "../../services/AssignmentService";

// ========================================
// MAPEOS / CONSTANTES DE UI
// ========================================
/**
 * Traducción de método de asignación desde id numérico
 */
const METODO_ASIGNACION = {
    1: 'Manual',
    2: 'Automático',
};

/**
 * Descripciones legibles de prioridad
 */
const PRIORIDAD_DESC = {
    1: 'Muy Baja',
    2: 'Baja',
    3: 'Media',
    4: 'Alta',
    5: 'Crítica',
};

// ========================================
// COMPONENTE: Detalle de Asignación
// ========================================
export function DetailAssignment() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [assignResp, setAssignResp] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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
    if (error) return <ErrorAlert title="No se pudo cargar las asignaciones" message={error} />;
    if (!assignResp || !assignResp.data)
        return <EmptyState message="No se encontró la asignación solicitada." />;

    // Normalizar respuesta: si viene arreglo, tomar primer elemento
    const asignacion = Array.isArray(assignResp.data) ? assignResp.data[0] : assignResp.data;

    const tecnicoId = id;
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                {/* Encabezado principal */}
                <div className="flex items-end justify-between gap-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Asignación #{asignacion.Id} — Técnico #{tecnicoId}
                    </h1>
                    <Badge variant="secondary" className="text-sm">Detalle</Badge>
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
                                    <div className="text-sm text-muted-foreground">Ticket #{asignacion.Id_Ticket ?? 'N/D'}</div>
                                    <div className="flex items-center gap-2">
                                        {asignacion.Id_Ticket && (
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/Ticket/${asignacion.Id_Ticket}`)}>
                                                Ver Ticket
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
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>Fecha de Asignación:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {asignacion.Fecha_Asignacion || 'N/D'}
                                        </p>
                                    </div>

                                    {/* Método de asignación */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Settings className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>Método de Asignación:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {METODO_ASIGNACION[asignacion.Metodo_Asignacion] || asignacion.Metodo_Asignacion || 'N/D'}
                                        </p>
                                    </div>

                                    {/* Prioridad */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Target className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>Prioridad:</span>
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
                                            <span className="font-semibold" style={{ color: '#f7f4f3' }}>Regla de Autotriage:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {asignacion.Id_ReglaAutobriage ? `#${asignacion.Id_ReglaAutobriage}` : 'No aplicada (asignación manual)'}
                                        </p>
                                    </div>
                                </div>

                                {/* Información del ticket */}
                                <div className="pt-4" style={{ borderTop: '1px solid #fc52af' }}>
                                    <div className="space-y-2">
                                        <span className="font-semibold text-lg" style={{ color: '#f7f4f3' }}>Información del Ticket</span>
                                        <div className="grid gap-2">
                                            <p><span className="font-medium">Categoría:</span> {asignacion.Categoria || 'N/D'}</p>
                                            <p><span className="font-medium">Estado:</span> <Badge variant="outline">{asignacion.Estado || 'N/D'}</Badge></p>
                                            <p><span className="font-medium">Tiempo Límite:</span> {asignacion.TiempoLimite || 'N/D'}</p>
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
                Regresar
            </Button>
        </div>
    );
}