// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, X, KeyRound, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';

// Servicios
import UserService from '@/services/UserService';

// ========================================
// COMPONENTE: Restablecer Contraseña
// ========================================
export function ResetPassword() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Control de acceso
    const [accessDenied, setAccessDenied] = useState(false);

    // Estado de datos y UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userName, setUserName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados del formulario
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Verificar permisos y cargar nombre del usuario
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

                // Verificar que el usuario logueado sea el mismo que el del parámetro
                const parsedUser = JSON.parse(userSession);
                
                // Buscar el ID del usuario en diferentes posibles propiedades
                const loggedUserId = parsedUser?.Id || parsedUser?.id || parsedUser?.ID || parsedUser?.userId || parsedUser?.UserId;
                const targetUserId = id;

                // Debug: descomentar para ver los valores
                console.log('Logged User ID:', loggedUserId, 'Type:', typeof loggedUserId);
                console.log('Target User ID:', targetUserId, 'Type:', typeof targetUserId);
                console.log('User Session Object:', parsedUser);

                // Comparar ambos IDs como strings para evitar problemas de tipo
                if (!loggedUserId || String(loggedUserId) !== String(targetUserId)) {
                    setAccessDenied(true);
                    setLoading(false);
                    toast.error('Acceso Denegado - Solo puedes restablecer tu propia contraseña');
                    return;
                }

                // Cargar nombre del usuario
                const response = await UserService.getUserById(id);
                if (response.data.success) {
                    setUserName(response.data.data.Nombre);
                    toast.success('Usuario cargado correctamente');
                } else {
                    toast.error(response.data.message);
                }
            } catch (err) {
                console.error('Error:', err);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        checkAccessAndFetch();
    }, [id]);

    const validateForm = () => {
        // Validar contraseña
        if (!formData.newPassword) {
            toast.error('La contraseña es requerida');
            return false;
        }
        if (formData.newPassword.length < 8) {
            toast.error('La contraseña debe tener mínimo 8 caracteres');
            return false;
        }
        if (!/(?=.*[a-z])/.test(formData.newPassword)) {
            toast.error('La contraseña debe contener al menos una letra minúscula');
            return false;
        }
        if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
            toast.error('La contraseña debe contener al menos una letra mayúscula');
            return false;
        }
        if (!/(?=.*\d)/.test(formData.newPassword)) {
            toast.error('La contraseña debe contener al menos un número');
            return false;
        }

        // Validar confirmación
        if (!formData.confirmPassword) {
            toast.error('Confirma la nueva contraseña');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
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
            // Llamar al servicio de restablecimiento
            const response = await UserService.resetPassword(id, formData.newPassword);

            if (response.data.success) {
                toast.success(response.data.message || 'Contraseña restablecida exitosamente');
                setTimeout(() => navigate(`/User/${id}`), 1500);
            } else {
                toast.error(response.data.message || 'Error al restablecer contraseña');
            }
        } catch (err) {
            console.error('Error al restablecer:', err);
            const message = err.response?.data?.message || err.message || 'Error de servidor';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        toast.info('Operación cancelada');
        navigate(`/User/${id}`);
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
                            ? 'Debes iniciar sesión para restablecer tu contraseña.'
                            : 'No tienes permisos para restablecer esta contraseña. Solo puedes restablecer tu propia contraseña.'
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
        <div className="max-w-2xl mx-auto py-12 px-4">
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
                <KeyRound className="w-10 h-10" style={{ color: '#fc52af' }} />
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#f7f4f3' }}>
                        Restablecer Contraseña
                    </h1>
                    <p className="text-muted-foreground">Usuario: {userName}</p>
                </div>
            </div>

            <Card 
                className="border-2 border-[#fc52af] backdrop-blur-lg"
                style={{
                    backgroundColor: 'rgba(252, 82, 175, 0.05)',
                    boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                }}
            >
                <CardContent className="p-6">
                    {/* Advertencia de seguridad */}
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-400">Importante</p>
                                <p className="text-xs text-amber-300 mt-1">
                                    Estás a punto de restablecer tu contraseña. 
                                    Esta acción no se puede deshacer. Asegúrate de recordar tu nueva contraseña.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nueva Contraseña */}
                        <div>
                            <Label htmlFor="newPassword" style={{ color: '#f7f4f3' }}>
                                Nueva Contraseña <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData(prev => ({...prev, newPassword: e.target.value}))}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Debe contener: mayúsculas, minúsculas y números
                            </p>
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <Label htmlFor="confirmPassword" style={{ color: '#f7f4f3' }}>
                                Confirmar Nueva Contraseña <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                                    placeholder="Repite la nueva contraseña"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Restableciendo...' : 'Restablecer Contraseña'}
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
                onClick={() => navigate(`/User/${id}`)}
                className="flex items-center gap-2 mt-6 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver al detalle
            </Button>
        </div>
    );
}