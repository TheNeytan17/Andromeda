// ========================================
// IMPORTS
// ========================================
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

// Hooks
import { useState, useEffect } from "react";

// UI Components
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ArrowLeft, Eye } from "lucide-react";

// API Service
import TechService from "../../services/TechnicianService";

// ========================================
// CONFIGURACIÓN DE TABLA
// ========================================
// Columnas a mostrar (máximo 3 campos para el cliente)
function useColumns(t) {
    return [
        { key: "Nombre", label: t('tables.technicians.columns.name') },
        { key: "Especialidades", label: t('tables.technicians.columns.skills') },
        { key: "actions", label: t('tables.common.actions') },
    ];
}

// ========================================
// COMPONENTE: Tabla de Técnicos
// ========================================
export default function TableTechnicians() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const techColumns = useColumns(t);

    // Resultado de consumo del API
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar técnicos al montar
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await TechService.getTechnicians();
                setData(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                }
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title={t('tables.technicians.loadError')} message={error} />;
    if (!data || !data.data || data.data.length === 0)
        return <EmptyState message={t('tables.technicians.empty')} />;

    // Interfaz
    return (
    <div className="container mx-auto py-12 px-6 md:px-10 lg:px-16">
            {/* Encabezado con acción de creación */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-bold tracking-wider" style={{ color: '#f7f4f3' }}>{t('tables.technicians.title')}</h1>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* En el futuro, ajustar esta ruta cuando exista la pantalla de creación */}
                            <Button asChild variant="outline" size="icon" className="text-primary">
                                <Link to="/Technician">
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('tables.technicians.create')}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div 
                className="rounded-lg border-2 border-[#fc52af] backdrop-blur-lg overflow-hidden"
                style={{
                    backgroundColor: 'rgba(252, 82, 175, 0.05)',
                    boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                }}
            >
                <Table>
                    <TableHeader 
                        style={{
                            backgroundColor: 'rgba(255, 143, 87, 0.2)',
                            borderBottom: '2px solid #fc52af'
                        }}
                    >
                        <TableRow>
                            {techColumns.map((column) => (
                                <TableHead key={column.key} className="text-left font-semibold" style={{ color: '#f7f4f3' }}>
                                    {column.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.data.map((row, index) => (
                            <TableRow 
                                key={row.Id}
                                style={{
                                    borderBottom: index < data.data.length - 1 ? '1px solid rgba(252, 82, 175, 0.2)' : 'none'
                                }}
                            >
                                <TableCell className="font-medium" style={{ color: '#f7f4f3' }}>{row.Nombre}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {Array.isArray(row.Especialidades) && row.Especialidades.length > 0
                                        ? row.Especialidades.map((e) => e.Nombre).join(", ")
                                        : "Sin especialidades"}
                                </TableCell>
                                <TableCell className="flex justify-start items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/Technician/${row.Id}`)}
                                                    aria-label={`${t('tables.common.viewDetail')} ${row.Nombre}`}
                                                >
                                                    <Eye className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('tables.common.viewDetail')}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
