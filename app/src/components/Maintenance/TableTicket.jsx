// ========================================
// IMPORTS
// ========================================
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

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

// Servicio a llamar
import TicketService from "../../services/TicketService";
import UserService from "../../services/UserService";

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
    // Variable temporal (ejemplo) para seleccionar usuario
    const id = 17;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await UserService.getUserById(id);
                const rol = user.data.data.Rol;
                if (rol == 1){
                    const response = await TicketService.getTickets();
                    setData(response.data)
                    if (!response.data.success) {
                        setError(response.data.message)
                    }
                }else{
                    if(rol == 2){
                        const response = await TicketService.getTicketTechnician(user.data.data.Id);
                        console.log(response.data)
                        setData(response.data)
                    }else{
                        const response = await TicketService.getTicketClient(user.data.data.Id);
                        console.log(response.data)
                        setData(response.data)
                    }
                }
            } catch (err) {
                // Si el error no es por cancelación, se registra 
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                // Independientemente del resultado, se actualiza el loading 
                setLoaded(false);
            }
        };
        fetchData()
    }, []);

    if (loaded) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title={t('tables.tickets.loadError')} message={error} />;
    if (!data || data.data.length === 0)
        return <EmptyState message={t('tables.tickets.empty')} />;
    //#endregion API

    /**
     * Convierte el código numérico de estado a etiqueta legible
     * @param {number|string} estado
     * @returns {string}
     */
    function Estado(estado) {
        switch (parseInt(estado)) {
            case 1:
                return t('tickets.status.pending');
            case 2:
                return t('tickets.status.assigned');
            case 3:
                return t('tickets.status.inProgress');
            case 4:
                return t('tickets.status.resolved');
            case 5:
                return t('tickets.status.closed');
        }
    }

    // Interfaz
    return (
        <div className="py-12 px-6 md:px-10 lg:px-16">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-shrikhand tracking-wider" style={{ fontFamily: "Shrikhand" }}>{t('tables.tickets.title')}</h1>
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
                                    {Estado(row.Estado)}
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/Ticket/${row.Id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('tables.common.viewDetails')}</p>
                                            </TooltipContent>
                                        </Tooltip>
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
