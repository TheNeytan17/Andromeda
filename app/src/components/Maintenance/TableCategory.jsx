// ========================================
// IMPORTS
// ========================================
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

// Hooks y UI
import { useState, useEffect } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ArrowLeft, Eye, Edit } from "lucide-react";

// Servicio
import CategoryService from "../../services/CategoryService";

// ========================================
// CONFIGURACIÓN DE TABLA
// ========================================
// Columnas de la tabla
function useColumns(t) {
    return [
        { key: "Nombre", label: t('tables.categories.columns.name') },
        { key: "SLA", label: t('tables.categories.columns.sla') },
        { key: "actions", label: t('tables.common.actions') },
    ];
}

// ========================================
// COMPONENTE: Tabla de Categorías
// ========================================
export default function TableCategories() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const categoryColumns = useColumns(t);

    // Estado API
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar categorías al montar
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CategoryService.getCategories();
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
    if (error) return <ErrorAlert title={t('tables.categories.loadError')} message={error} />;
    if (!data || !data.data || data.data.length === 0)
        return <EmptyState message={t('tables.categories.empty')} />;

    return (
        <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
            {/* Encabezado con acción de creación */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold tracking-wider" style={{ color: '#f7f4f3' }}>{t('tables.categories.title')}</h1>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="icon" className="text-primary">
                                <Link to="/CreateCategory/new">
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('tables.categories.create')}</TooltipContent>
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
                            {categoryColumns.map((column) => (
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
                                    {row.SLA_Descripcion
                                        || (row.Tiempo_Respuesta != null && row.Tiempo_Resolucion != null
                                                    ? `${t('tables.categories.slaShort.response')} ${row.Tiempo_Respuesta}${t('units.minShort')} · ${t('tables.categories.slaShort.resolution')} ${row.Tiempo_Resolucion}${t('units.minShort')}`
                                                    : t('common.notAvailable'))}
                                </TableCell>
                                <TableCell className="flex justify-start items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/Category/${row.Id}`)}
                                                    aria-label={`${t('tables.common.viewDetail')} ${row.Nombre}`}
                                                >
                                                    <Eye className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('tables.common.viewDetail')}</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/CreateCategory/${row.Id}`)}
                                                    aria-label={`${t('tables.common.edit')} ${row.Nombre}`}
                                                >
                                                    <Edit className="h-4 w-4" style={{ color: '#fc52af' }} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('tables.categories.edit')}</TooltipContent>
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
