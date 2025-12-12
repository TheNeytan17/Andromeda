// ========================================
// IMPORTS
// ========================================
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// UI Components
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Eye, Edit, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// API Service
import UserService from "../../services/UserService";

// ========================================
// COMPONENTE: Tabla de Usuarios
// ========================================
export default function TableUser() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);

    // Resultado de consumo del API
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Filtro por rol
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        const checkAccessAndFetch = async () => {
            try {
                // Verificar sesión
                const userSession = localStorage.getItem('user');
                if (!userSession) {
                    setLoading(false);
                    toast.error('Sesión No Iniciada');
                    return;
                }
                // Guardar usuario actual
                const parsedUser = JSON.parse(userSession);
                setCurrentUser(parsedUser);
                // Cargar usuarios
                const response = await UserService.getUsers();
                setData(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                    toast.error(response.data.message);
                } else {
                    toast.success('Usuarios cargados correctamente');
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                    toast.error('Error al cargar usuarios: ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        checkAccessAndFetch();
    }, []);


    // Función para obtener nombre del rol
    const getRoleName = (rolId) => {
        const roles = {
            1: 'Administrador',
            2: 'Técnico',
            3: 'Cliente'
        };
        return roles[rolId] || 'Desconocido';
    };

    // Función para obtener badge de rol
    const getRoleBadge = (rolId) => {
        const rol = parseInt(rolId);
        if (rol === 1) {
            return <Badge className="bg-purple-500/20 border border-purple-400/50 text-purple-300">Administrador</Badge>;
        } else if (rol === 2) {
            return <Badge className="bg-blue-500/20 border border-blue-400/50 text-blue-300">Técnico</Badge>;
        } else if (rol === 3) {
            return <Badge className="bg-green-500/20 border border-green-400/50 text-green-300">Cliente</Badge>;
        }
        return <Badge variant="secondary">Desconocido</Badge>;
    };

    // Filtrar usuarios según rol
    const filteredUsers = data?.data ? data.data.filter(user => {
        if (!currentUser) return false;
        const rol = parseInt(currentUser.Rol);
        if (rol === 1) return true; // Admin ve todos
        // Técnicos y clientes solo ven su propio usuario
        return user.Id === currentUser.Id;
    }) : [];


    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar usuarios" message={error} />;
    if (!data || !data.data || data.data.length === 0)
        return <EmptyState message="No hay usuarios disponibles" />;

    // Interfaz principal
    return (
        <div className="container mx-auto py-12 px-6 md:px-10 lg:px-16">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            {/* Encabezado con filtro y acción de creación */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold tracking-wider" style={{ color: '#f7f4f3' }}>
                        Gestión de Usuarios
                    </h1>
                    
                    {/* Filtro por rol */}
                    <Select value={filterRole} onValueChange={(val) => {
                        setFilterRole(val);
                        if (val === 'all') {
                            toast.info('Mostrando todos los usuarios');
                        } else {
                            toast.info(`Filtrando usuarios: ${getRoleName(parseInt(val))}`);
                        }
                    }}>
                        <SelectTrigger className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3]">
                            <SelectItem value="all">Todos los roles</SelectItem>
                            <SelectItem value="1">Administrador</SelectItem>
                            <SelectItem value="2">Técnico</SelectItem>
                            <SelectItem value="3">Cliente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="icon" className="text-primary cursor-pointer">
                                <Link to="/CreateUser/new">
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Crear usuario</TooltipContent>
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
                            <TableHead className="text-left font-semibold" style={{ color: '#f7f4f3' }}>Nombre</TableHead>
                            <TableHead className="text-left font-semibold" style={{ color: '#f7f4f3' }}>Correo</TableHead>
                            <TableHead className="text-left font-semibold" style={{ color: '#f7f4f3' }}>Rol</TableHead>
                            <TableHead className="text-left font-semibold" style={{ color: '#f7f4f3' }}>Última Sesión</TableHead>
                            <TableHead className="text-left font-semibold" style={{ color: '#f7f4f3' }}>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((row, index) => (
                            <TableRow 
                                key={row.Id}
                                style={{
                                    borderBottom: index < filteredUsers.length - 1 ? '1px solid rgba(252, 82, 175, 0.2)' : 'none'
                                }}
                            >
                                <TableCell className="font-medium" style={{ color: '#f7f4f3' }}>{row.Nombre}</TableCell>
                                <TableCell className="text-muted-foreground">{row.Correo}</TableCell>
                                <TableCell>{getRoleBadge(row.Rol)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {row.Ultima_Sesion ? new Date(row.Ultima_Sesion).toLocaleDateString('es-ES') : 'Nunca'}
                                </TableCell>
                                <TableCell className="flex justify-start items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        toast.info(`Abriendo detalles de ${row.Nombre}`);
                                                        navigate(`/User/${row.Id}`);
                                                    }}
                                                    aria-label={`Ver detalle ${row.Nombre}`}
                                                    className="cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4" style={{ color: '#fbb25f' }} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Ver detalle</TooltipContent>
                                        </Tooltip>
                                        {/* Solo admin puede editar */}
                                        {currentUser && parseInt(currentUser.Rol) === 1 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            toast.info(`Editando ${row.Nombre}`);
                                                            navigate(`/CreateUser/${row.Id}`);
                                                        }}
                                                        aria-label={`Editar ${row.Nombre}`}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="h-4 w-4" style={{ color: '#fc52af' }} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Editar</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Contador de usuarios filtrados */}
            <div className="mt-4 text-center text-sm" style={{ color: '#f7f4f3' }}>
                Mostrando {filteredUsers.length} de {data.data.length} usuarios
            </div>
        </div>
    );
}
