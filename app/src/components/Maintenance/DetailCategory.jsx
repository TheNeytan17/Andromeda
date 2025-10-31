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
import { User, Clock, ChevronRight, Tag, ArrowLeft } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

// Servicio
import CategoryService from "@/services/CategoryService";

// ========================================
// COMPONENTE: Detalle de Categoría
// ========================================
export function DetailCategory() {
    const navigate = useNavigate();
    const { id } = useParams();
    // Estado de datos y UI
    const [catResp, setCatResp] = useState(null); // Respuesta cruda del API
    const [error, setError] = useState(null);     // Mensaje de error si falla la carga
    const [loading, setLoading] = useState(true); // Flag de carga

    // Cargar detalle de la categoría al montar o si cambia el id
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CategoryService.getCategoryById(id);
                setCatResp(response.data);
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
    if (error) return <ErrorAlert title="No se pudo cargar la categoría" message={error} />;
    if (!catResp || !catResp.data)
        return <EmptyState message="No se encontraron datos para esta categoría." />;

    // Normalización de datos y fallbacks seguros
    const categoria = catResp.data;
    const especialidades = Array.isArray(categoria.Especialidades) ? categoria.Especialidades : [];
    const etiquetas = Array.isArray(categoria.Etiquetas) ? categoria.Etiquetas : [];
    // SLA puede venir como arreglo con un elemento
    const sla = Array.isArray(categoria.SLA) ? categoria.SLA[0] : categoria.SLA;

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                {/* Título */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {categoria.Nombre}
                </h1>

                <Card 
                    className="border-2 border-[#fc52af] backdrop-blur-lg"
                    style={{
                        backgroundColor: 'rgba(252, 82, 175, 0.05)',
                        boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                    }}
                >
                    <CardContent className="p-6 space-y-8">
                        {/* Resumen: Especialidad encargada + SLA */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Campo solicitado: renombrado de 'Director' a 'Especialidad encargada' */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Especialidad encargada:</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {categoria.Nombre}
                                </p>
                            </div>

                            {/* SLA */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>SLA:</span>
                                    {sla && (
                                        <Badge variant="secondary">#{sla.Id}</Badge>
                                    )}
                                </div>
                                {sla ? (
                                    <div className="text-muted-foreground space-y-1">
                                        <p>Tiempo de respuesta: <span className="font-semibold">{sla.Tiempo_Respuesta}</span> h</p>
                                        <p>Tiempo de resolución: <span className="font-semibold">{sla.Tiempo_Resolucion}</span> h</p>
                                        <p className="mt-2">{sla.Descripcion}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Sin información de SLA.</p>
                                )}
                            </div>
                        </div>

                        {/* Listas */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Especialidades */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <ChevronRight className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Especialidades requeridas</span>
                                    <Badge variant="secondary">{especialidades.length}</Badge>
                                </div>
                                {especialidades.length > 0 ? (
                                    <div className="space-y-2">
                                        {especialidades.map((esp) => (
                                            <div key={esp.Id} className="flex items-start gap-3 p-2 rounded-lg border">
                                                <Badge variant="outline" className="mt-0.5">{esp.Nombre}</Badge>
                                                <p className="text-muted-foreground text-sm">{esp.Descripcion}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No hay especialidades asociadas.</p>
                                )}
                            </div>

                            {/* Etiquetas */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Tag className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Etiquetas</span>
                                    <Badge variant="secondary">{etiquetas.length}</Badge>
                                </div>
                                {etiquetas.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {etiquetas.map((et) => (
                                            <Badge key={et.Id} variant="outline">{et.Nombre}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Sin etiquetas asociadas.</p>
                                )}
                            </div>
                        </div>
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