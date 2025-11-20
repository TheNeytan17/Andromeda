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
import { User, Mail, Clock, CheckCircle2, XCircle, Briefcase, ChevronRight, ArrowLeft } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

// Servicio
import TechService from "@/services/TechnicianService";

// ========================================
// COMPONENTE: Detalle de Técnico
// ========================================
export function DetailTechnician() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { id } = useParams();
    // Estado de datos y UI
    const [techResponse, setTechResponse] = useState(null); // Respuesta cruda del API
    const [error, setError] = useState(null);               // Error de carga
    const [loading, setLoading] = useState(true);           // Flag de carga

    // Cargar detalle del técnico al montar o cambiar el id
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await TechService.getTechnicianById(id);
                setTechResponse(response.data);
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
    if (error) return <ErrorAlert title={t('details.technician.loadError')} message={error} />;
    if (!techResponse || !techResponse.data)
        return <EmptyState message={t('details.technician.noData')} />;

    // Normalización y fallbacks
    const tech = techResponse.data; // Objeto del técnico
    const especialidades = Array.isArray(tech.Especialidades) ? tech.Especialidades : [];
    const disponible = !!tech.Estado;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="space-y-6">
                {/* Encabezado con nombre y disponibilidad */}
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{tech.Nombre}</h1>
                    <Badge variant={disponible ? 'secondary' : 'destructive'}>
                        {disponible ? t('details.technician.available') : t('details.technician.notAvailable')}
                    </Badge>
                </div>

                    <Card 
                        className="border-2 border-[#fc52af] backdrop-blur-lg"
                        style={{
                            backgroundColor: 'rgba(252, 82, 175, 0.05)',
                            boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                        }}
                    >
                        <CardContent className="p-6 space-y-6">
                            {/* Información personal, carga y disponibilidad */
                            }
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                        <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.technician.email')}:</span>
                                        <p className="text-muted-foreground">{tech.Correo}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                        <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.technician.lastSession')}:</span>
                                        <p className="text-muted-foreground">{tech.Ultima_Sesion || t('common.notAvailable')}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                        <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.technician.workload')}:</span>
                                        <p className="text-muted-foreground">{tech.CargaTrabajo ?? 0}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {disponible ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-destructive" />
                                        )}
                                        <span className="font-semibold">{t('details.technician.availability')}:</span>
                                        <p className="text-muted-foreground">{disponible ? t('details.technician.available') : t('details.technician.notAvailable')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Especialidades del técnico */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <ChevronRight className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>{t('details.technician.specialties')}</span>
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
                                    <p className="text-muted-foreground">{t('details.technician.noSpecialties')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

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
        </div>
    );
}