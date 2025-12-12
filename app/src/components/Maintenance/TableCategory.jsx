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
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        const userSession = localStorage.getItem('user');
        if (!userSession) {
            setUnauthorized(true);
            return;
        }
        const currentUser = JSON.parse(userSession);
        const rol = currentUser.Rol || currentUser.rol || currentUser.role;
        if (rol !== 1 && rol !== '1') {
            setUnauthorized(true);
            return;
        }
    }, []);

    useEffect(() => {
        if (unauthorized) return;
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
    }, [unauthorized]);

    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-6xl text-pink-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-20 h-20 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-pink-400 mb-2">Acceso Denegado</h2>
                <p className="text-lg text-zinc-300 mb-6 text-center">No tienes permisos para acceder a la gestión de categorías. Esta sección está disponible solo para administradores.</p>
                <button onClick={() => window.location.href = '/'} className="px-6 py-3 rounded bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all">Volver al Inicio</button>
            </div>
        );
    }

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
                style={{ background: 'rgba(252, 82, 175, 0.04)' }}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            {categoryColumns.map((col) => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.data.map((row) => (
                            <TableRow key={row.Id}>
                                <TableCell>{row.Nombre}</TableCell>
                                <TableCell>{row.SLA}</TableCell>
                                <TableCell>
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
