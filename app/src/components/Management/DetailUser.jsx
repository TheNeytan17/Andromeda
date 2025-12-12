// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Clock, CheckCircle2, XCircle, Shield, ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

// Servicio
import UserService from "@/services/UserService";

// ========================================
// COMPONENTE: Detalle de Usuario
// ========================================
export function DetailUser() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Control de acceso
    const [accessDenied, setAccessDenied] = useState(false);

    // Estado de datos y UI
    const [userResponse, setUserResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar permisos y cargar datos
    useEffect(() => {
        const checkAccessAndFetch = async () => {
            try {
                // Verificar sesión
                const userSession = localStorage.getItem('user');
                if (!userSession) {
                    setAccessDenied(true);
                    setLoading(false);
                    toast.error('Sesión No Iniciada');
                    return;
                }


                // Cargar usuario
                const response = await UserService.getUserById(id);
                setUserResponse(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                    toast.error(response.data.message);
                } else {
                    toast.success('Usuario cargado correctamente');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    toast.error(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        checkAccessAndFetch();
    }, [id]);

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

    // Renderizado de control de acceso
    if (accessDenied) {
        const userSession = localStorage.getItem('user');
        const isNoSession = !userSession;

        return (
            <div className="container mx-auto py-8 px-4 text-white">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertTriangle className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-red-400">
                        {isNoSession ? 'Sesión No Iniciada' : 'Acceso Denegado'}
                    </h2>
                    <p className="text-zinc-400 text-center max-w-md">
                        {isNoSession 
                            ? 'Debes iniciar sesión para ver detalles de usuarios.'
                            : 'No tienes permisos para ver detalles de usuarios. Esta sección está disponible solo para administradores.'
                        }
                    </p>
                    <Button 
                        onClick={() => navigate(isNoSession ? '/login' : '/')}
                        className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                        {isNoSession ? 'Ir a Iniciar Sesión' : 'Volver al Inicio'}
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar usuario" message={error} />;
    if (!userResponse || !userResponse.data)
        return <EmptyState message="No se encontraron datos del usuario" />;

    const user = userResponse.data;
    const activo = !!user.Estado;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
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

            <div className="space-y-6">
                {/* Encabezado con nombre y estado */}
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#f7f4f3' }}>
                        {user.Nombre}
                    </h1>
                    <Badge variant={activo ? 'secondary' : 'destructive'}>
                        {activo ? 'Activo' : 'Inactivo'}
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
                        {/* Información del usuario */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>ID:</span>
                                    <p className="text-muted-foreground">{user.Id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Correo:</span>
                                    <p className="text-muted-foreground">{user.Correo}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Rol:</span>
                                    {getRoleBadge(user.Rol)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" style={{ color: '#fbb25f' }} />
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Última Sesión:</span>
                                    <p className="text-muted-foreground">
                                        {user.Ultima_Sesion 
                                            ? new Date(user.Ultima_Sesion).toLocaleString('es-ES')
                                            : 'Nunca'
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {activo ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-destructive" />
                                    )}
                                    <span className="font-semibold" style={{ color: '#f7f4f3' }}>Estado:</span>
                                    <p className="text-muted-foreground">{activo ? 'Activo' : 'Inactivo'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 pt-4 border-t border-[#fc52af]/20">
                            <Button
                                onClick={() => {
                                    toast.info('Redirigiendo a edición...');
                                    navigate(`/CreateUser/${user.Id}`);
                                }}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer"
                            >
                                <User className="w-4 h-4" />
                                Editar Usuario
                            </Button>
                            <Button
                                onClick={() => {
                                    toast.info('Abriendo formulario de restablecimiento...');
                                    navigate(`/ResetPassword/${user.Id}`);
                                }}
                                variant="outline"
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <KeyRound className="w-4 h-4" />
                                Restablecer Contraseña
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Botón para volver */}
                <Button
                    type="button"
                    onClick={() => {
                        toast.info('Volviendo a la lista...');
                        navigate('/Users');
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a la lista
                </Button>
            </div>
        </div>
    );
}
