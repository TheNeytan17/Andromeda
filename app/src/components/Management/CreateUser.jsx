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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X, AlertTriangle } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';

// Servicios
import UserService from '@/services/UserService';

// ========================================
// COMPONENTE: Crear/Editar Usuario
// ========================================
export function CreateUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id && id !== 'new';
    const isCreateMode = !id || id === 'new';

    // Control de acceso
    const [accessDenied, setAccessDenied] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Estado de datos y UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados del formulario
    const [formData, setFormData] = useState({
        Nombre: '',
        Correo: '',
        Password: '',
        Rol: '',
        Estado: '1'
    });

    // Verificar permisos al montar
    useEffect(() => {
        const checkAccess = () => {
            try {
                const userSession = localStorage.getItem('user');
                if (!userSession) {
                    setAccessDenied(true);
                    setLoading(false);
                    toast.error('Sesión No Iniciada');
                    return false;
                }

                const parsedUser = JSON.parse(userSession);
                const roleValue = parsedUser?.Rol || parsedUser?.rol || parsedUser?.Role || parsedUser?.role;
                const role = parseInt(roleValue);
                
                // Obtener ID del usuario logueado
                const loggedUserId = parsedUser?.Id || parsedUser?.id || parsedUser?.ID || parsedUser?.userId || parsedUser?.UserId;

                // Verificar si es administrador
                const userIsAdmin = role === 1;
                setIsAdmin(userIsAdmin);

                // MODO CREAR: Solo administradores
                if (isCreateMode) {
                    if (!userIsAdmin) {
                        setAccessDenied(true);
                        setLoading(false);
                        toast.error('Acceso Denegado - Solo administradores pueden crear usuarios');
                        return false;
                    }
                    return true;
                }

                // MODO EDITAR: Administradores O el mismo usuario
                if (isEditMode) {
                    const targetUserId = id;
                    const isSameUser = String(loggedUserId) === String(targetUserId);
                    
                    if (!userIsAdmin && !isSameUser) {
                        setAccessDenied(true);
                        setLoading(false);
                        toast.error('Acceso Denegado - Solo puedes editar tu propio perfil');
                        return false;
                    }
                    return true;
                }

                return true;
            } catch (e) {
                console.error('Error al verificar acceso:', e);
                setAccessDenied(true);
                setLoading(false);
                return false;
            }
        };

        if (!checkAccess()) return;

        // Si es modo crear, finalizar carga
        if (isCreateMode) {
            setLoading(false);
            return;
        }

        // Cargar datos si es edición
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await UserService.getUserById(id);
                if (!response.data.success) {
                    toast.error(response.data.message);
                } else {
                    const user = response.data.data;
                    setFormData({
                        Nombre: user.Nombre || '',
                        Correo: user.Correo || '',
                        Password: '', // No cargar contraseña por seguridad
                        Rol: String(user.Rol) || '',
                        Estado: String(user.Estado) || '1'
                    });
                    toast.success('Usuario cargado correctamente');
                }
            } catch (err) {
                if (err.name !== 'AbortError') toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode, isCreateMode]);

    const validateForm = () => {
        // Validar nombre
        if (!formData.Nombre.trim()) {
            toast.error('El nombre es requerido');
            return false;
        }
        if (formData.Nombre.trim().length < 3) {
            toast.error('El nombre debe tener al menos 3 caracteres');
            return false;
        }
        if (formData.Nombre.trim().length > 50) {
            toast.error('El nombre no puede exceder 50 caracteres');
            return false;
        }

        // Validar correo
        if (!formData.Correo.trim()) {
            toast.error('El correo es requerido');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Correo)) {
            toast.error('Ingresa un correo electrónico válido');
            return false;
        }
        if (!formData.Correo.toLowerCase().endsWith('@andromeda.com')) {
            toast.error('El correo debe ser del dominio @andromeda.com');
            return false;
        }

        // Validar contraseña (solo en modo crear o si se proporciona en edición)
        if (isCreateMode || formData.Password) {
            if (!formData.Password) {
                toast.error('La contraseña es requerida');
                return false;
            }
            if (formData.Password.length < 8) {
                toast.error('La contraseña debe tener mínimo 8 caracteres');
                return false;
            }
            if (!/(?=.*[a-z])/.test(formData.Password)) {
                toast.error('La contraseña debe contener al menos una letra minúscula');
                return false;
            }
            if (!/(?=.*[A-Z])/.test(formData.Password)) {
                toast.error('La contraseña debe contener al menos una letra mayúscula');
                return false;
            }
            if (!/(?=.*\d)/.test(formData.Password)) {
                toast.error('La contraseña debe contener al menos un número');
                return false;
            }
        }

        // Validar rol
        if (!formData.Rol) {
            toast.error('Selecciona un rol');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            let dataToSend = {
                Nombre: formData.Nombre.trim(),
                Correo: formData.Correo.trim().toLowerCase(),
                Rol: parseInt(formData.Rol),
                Estado: parseInt(formData.Estado)
            };

            // En crear, incluir contraseña obligatoria
            if (isCreateMode) {
                dataToSend.Password = formData.Password;
            } else {
                // En editar, solo incluir contraseña si se proporcionó
                // (esto se puede restringir desde el backend)
                if (formData.Password) {
                    toast.warning('No se puede cambiar la contraseña desde aquí. Usa la opción de restablecimiento.');
                }
            }

            let response;
            if (isCreateMode) {
                response = await UserService.createUser(dataToSend);
            } else {
                response = await UserService.updateUser(id, dataToSend);
            }

            if (response.data.success) {
                toast.success(response.data.message || 
                    (isCreateMode ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente'));
                setTimeout(() => navigate('/Users'), 1500);
            } else {
                toast.error(response.data.message || 'Error al guardar usuario');
            }
        } catch (err) {
            console.error('Error al guardar:', err);
            const message = err.response?.data?.message || err.message || 'Error de servidor';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        toast.info('Operación cancelada');
        navigate('/Users');
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
                            ? 'Debes iniciar sesión para gestionar usuarios.'
                            : isCreateMode
                                ? 'No tienes permisos para crear usuarios. Esta función está disponible solo para administradores.'
                                : 'No tienes permisos para editar este usuario. Solo puedes editar tu propio perfil.'
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

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
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

            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-4xl font-bold" style={{ color: '#f7f4f3' }}>
                    {isCreateMode ? 'Crear Usuario' : 'Editar Usuario'}
                </h1>
                {!isCreateMode && <Badge variant="secondary">ID: {id}</Badge>}
            </div>

            <Card 
                className="border-2 border-[#fc52af] backdrop-blur-lg"
                style={{
                    backgroundColor: 'rgba(252, 82, 175, 0.05)',
                    boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                }}
            >
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <Label htmlFor="nombre" style={{ color: '#f7f4f3' }}>
                                Nombre Completo <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="nombre"
                                value={formData.Nombre}
                                onChange={(e) => setFormData(prev => ({...prev, Nombre: e.target.value}))}
                                placeholder="Ej: Juan Pérez"
                                required
                                className="mt-1"
                            />
                        </div>

                        {/* Correo */}
                        <div>
                            <Label htmlFor="correo" style={{ color: '#f7f4f3' }}>
                                Correo Electrónico <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="correo"
                                type="email"
                                value={formData.Correo}
                                onChange={(e) => setFormData(prev => ({...prev, Correo: e.target.value}))}
                                placeholder="ejemplo@andromeda.com"
                                required
                                disabled={isEditMode} // No permitir cambiar correo en edición
                                className="mt-1"
                            />
                            {isEditMode && (
                                <p className="text-xs text-amber-400 mt-1">
                                    El correo no se puede modificar
                                </p>
                            )}
                        </div>

                        {/* Contraseña (solo en crear) */}
                        {isCreateMode && (
                            <div>
                                <Label htmlFor="password" style={{ color: '#f7f4f3' }}>
                                    Contraseña <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.Password}
                                    onChange={(e) => setFormData(prev => ({...prev, Password: e.target.value}))}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Debe contener: mayúsculas, minúsculas y números
                                </p>
                            </div>
                        )}

                        {/* Mensaje para edición */}
                        {isEditMode && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded">
                                <p className="text-sm text-amber-300">
                                    <strong>Nota:</strong> La contraseña no se puede editar desde aquí por seguridad. 
                                    {isAdmin ? 'Los usuarios deben' : 'Debes'} usar la opción "Restablecer contraseña".
                                </p>
                            </div>
                        )}

                        {/* Rol - Solo editable por administradores */}
                        <div>
                            <Label htmlFor="rol" style={{ color: '#f7f4f3' }}>
                                Rol <span className="text-red-400">*</span>
                            </Label>
                            <Select 
                                value={formData.Rol} 
                                onValueChange={(val) => setFormData(prev => ({...prev, Rol: val}))}
                                disabled={!isAdmin} // Solo admin puede cambiar roles
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Administrador</SelectItem>
                                    <SelectItem value="2">Técnico</SelectItem>
                                    <SelectItem value="3">Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                            {!isAdmin && isEditMode && (
                                <p className="text-xs text-amber-400 mt-1">
                                    Solo los administradores pueden cambiar roles
                                </p>
                            )}
                        </div>

                        {/* Estado - Solo editable por administradores */}
                        <div>
                            <Label htmlFor="estado" style={{ color: '#f7f4f3' }}>
                                Estado
                            </Label>
                            <Select 
                                value={formData.Estado} 
                                onValueChange={(val) => setFormData(prev => ({...prev, Estado: val}))}
                                disabled={!isAdmin} // Solo admin puede cambiar estado
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Activo</SelectItem>
                                    <SelectItem value="0">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                            {!isAdmin && isEditMode && (
                                <p className="text-xs text-amber-400 mt-1">
                                    Solo los administradores pueden cambiar el estado
                                </p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Button
                type="button"
                onClick={() => navigate('/Users')}
                className="flex items-center gap-2 mt-6 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver a la lista
            </Button>
        </div>
    );
}