// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { useI18n } from "@/hooks/useI18n";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Minimize, Save, Ticket, X } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';

// Servicios
import UserService from '@/services/UserService';
import TicketService from '@/services/TicketService';
import SLAService from '@/services/SLAService';
import StateService from '@/services/StateService';
import { formatDate } from '@/lib/utils';

//Id Solicitante
const IdUser = 1;

// ========================================
// COMPONENTE: Crear/Editar Ticket
// ========================================
export function ChangeState() {
    const { t, lang } = useI18n();
    const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const isCreateMode = !id || id === 'new';

    // Estado de datos y UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados para los catálogos
    const [ticket, setTicket] = useState({});
    const [states, setStates] = useState([]);

    // Estados del formulario
    const [formData, setFormData] = useState({
        Id_Ticket: '',
        Estado_Anterior: '',
        Estado_Nuevo: '',
        Fecha_Cambio: '',
        Archivo: '',
        Observaciones: '',
        Id_Usuario_Responsable: ''
    });

    /*** Manejo de imagen ***/
    const handleChangeImage = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileURL(URL.createObjectURL(selectedFile));
        }
    };



    // Cargar datos del usuario solicitante
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const [ticketData] = await Promise.all([
                    TicketService.getTicketAssigment(id)
                ]);
                const [statesData] = await Promise.all([
                    StateService.getStates()
                ]);
                if (statesData.data.success) {
                    setStates(statesData.data.data || []);
                }
                if (ticketData.data.success) {
                    setTicket(ticketData.data.data || null);
                }
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuario();
    }, [id]);



    const validateForm = () => {
        let isValid = true;
        if (!formData.Observaciones.trim()) {
            toast.error(t('Las observaciones son obligatorias'));
            isValid = false;
        }
        if (!file) {
            toast.error(t('Debe adjuntar una imagen'));
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const dataToSend = {
                Id_Ticket: ticket.Id,
                Observaciones: formData.Observaciones,
                Estado_Anterior: Number(ticket.Estado),
                Estado_Nuevo: Number(ticket.Estado) + 1,
                Archivo: file,
                Fecha_Cambio: new Date().toISOString().slice(0, 19).replace('T', ' '),
                Id_Usuario_Responsable: IdUser
            };

            console.log('Datos a enviar:', dataToSend);

            // Convertir a FormData para enviar archivos
            const formDataToSend = new FormData();
            Object.keys(dataToSend).forEach(key => {
                if (dataToSend[key] instanceof File) {
                    formDataToSend.append(key, dataToSend[key]);
                } else {
                    formDataToSend.append(key, dataToSend[key]);
                }
            });

            let response;
            response = await TicketService.createHistory(formDataToSend);

            console.log('Respuesta del servidor:', response.data);

            if (response.data.success) {
                toast.success(isCreateMode ? t('ticket.messages.createSuccess') : t('ticket.messages.updateSuccess'));
                setTimeout(() => {
                    navigate('/Assignment');
                }, 1500);
            } else {
                toast.error(isCreateMode ? t('ticket.messages.createError') : t('ticket.messages.updateError'));
            }
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Respuesta del error:', err.response?.data);
            toast.error(isCreateMode ? t('ticket.messages.createError') : t('ticket.messages.updateError'));
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <LoadingGrid count={1} type="grid" />;

    // Formulario (Crear/Editar)
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {isCreateMode ? t('ticket.titleCreate') : t('Actualizar Estado del Ticket')}
                </h1>

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

                <form onSubmit={handleSubmit}>
                    <Card
                        className="border-2 border-[#fc52af] backdrop-blur-lg"
                        style={{
                            backgroundColor: 'rgba(252, 82, 175, 0.05)',
                            boxShadow: '0 8px 32px 0 rgba(252, 82, 175, 0.15)'
                        }}
                    >

                        <CardContent className="p-6 space-y-6">
                            {/* Información del Ticket */}
                            <div className="space-y-4">
                                {/* Tarjeta de información del ticket */}
                                <div className="bg-gradient-to-br from-[#fc52af]/10 to-purple-500/10 backdrop-blur-sm border-2 border-[#fc52af]/30 rounded-xl p-5 shadow-lg">
                                    <div className="flex items-start gap-4">
                                        {/* Icono del ticket */}
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fc52af] to-purple-500 flex items-center justify-center shadow-lg">
                                                <Ticket className="w-7 h-7 text-white" />
                                            </div>
                                        </div>

                                        {/* Información del ticket */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-[#fc52af]/20 border-[#fc52af]/50 text-white font-semibold px-3 py-1"
                                                >
                                                    {t('Ticket ID')}: #{ticket?.Id || t('common.notAvailable')}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                                    {t('Nombre del Ticket')}
                                                </p>
                                                <h2 className="text-xl font-bold text-white leading-tight">
                                                    {ticket?.Titulo || t('common.notAvailable')}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-[#fc52af] rounded-full"></div>
                                    <h3 className="text-lg font-semibold" style={{ color: '#f7f4f3' }}>
                                        {t('Cambio de Estado')}
                                    </h3>
                                </div>

                                {/* Visualización de Estados */}
                                <div className="relative">
                                    {/* Línea de conexión */}
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fc52af] via-purple-400 to-[#fc52af] opacity-30 transform -translate-y-1/2 z-0"></div>

                                    <div className="relative flex items-center justify-between gap-4 z-10">
                                        {/* Estado Actual */}
                                        <div className="flex-1 group">
                                            <div className="relative bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm border-2 border-red-400/50 rounded-xl p-4 shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center border-2 border-red-400">
                                                        <Ticket className="w-6 h-6 text-red-300" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-red-300 font-medium mb-1">{t('Estado Anterior')}</p>
                                                        <p className="text-sm font-bold text-white">
                                                            {states.find(s => s.Id === ((ticket.Estado)))?.Nombre || t('common.notAvailable')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Flecha de Transición */}
                                        <div className="flex-shrink-0 px-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#fc52af] to-purple-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                                                <div className="relative bg-gradient-to-r from-[#fc52af] to-purple-500 p-3 rounded-full shadow-xl">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado Nuevo */}
                                        <div className="flex-1 group">
                                            <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border-2 border-green-400/50 rounded-xl p-4 shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center border-2 border-green-400">
                                                        <Ticket className="w-6 h-6 text-green-300" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-green-300 font-medium mb-1">{t('Próximo Estado')}</p>
                                                        <p className="text-sm font-bold text-white">
                                                            {states.find(s => Number(s.Id) === (Number(ticket.Estado) + 1))?.Nombre || t('common.notAvailable')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones e Imagen */}
                            <div className="space-y-6">
                                <div className="flex flex-col lg:flex-row gap-6 w-full">
                                    {/* Sección de Observaciones */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-6 bg-gradient-to-b from-[#fc52af] to-purple-500 rounded-full"></div>
                                            <h3 className="text-lg font-semibold" style={{ color: '#f7f4f3' }}>
                                                {t('Observaciones')}
                                            </h3>
                                        </div>

                                        <div className="relative">
                                            <textarea
                                                id="Observaciones"
                                                value={formData.Observaciones}
                                                onChange={(e) => handleInputChange('Observaciones', e.target.value)}
                                                placeholder={t('Inserte las observaciones del cambio de estado...')}
                                                rows={8}
                                                className="w-full px-4 py-3 bg-white/5 border-2 border-[#fc52af]/30 rounded-xl text-white placeholder:text-gray-500 focus:border-[#fc52af] focus:ring-2 focus:ring-[#fc52af]/20 transition-all duration-300 resize-none backdrop-blur-sm"
                                                style={{
                                                    outline: 'none',
                                                    minHeight: '200px'
                                                }}
                                            />
                                            <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-md">
                                                {formData.Observaciones?.length || 0} caracteres
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección de Imagen */}
                                    <div className="lg:w-64 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-[#fc52af] rounded-full"></div>
                                            <h3 className="text-lg font-semibold" style={{ color: '#f7f4f3' }}>
                                                {t('ticket.form.imageLabel')}
                                            </h3>
                                        </div>

                                        <div
                                            className="h-55 relative w-full aspect-square border-2 border-dashed border-[#fc52af]/30 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#fc52af] transition-all duration-300 bg-white/5 backdrop-blur-sm group"
                                            onClick={() => document.getElementById("image").click()}
                                            style={{ minHeight: '200px' }}
                                        >
                                            {!fileURL && (
                                                <div className="text-center px-4">
                                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#fc52af]/20 flex items-center justify-center group-hover:bg-[#fc52af]/30 transition-all duration-300">
                                                        <svg className="w-8 h-8 text-[#fc52af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-300 font-medium mb-1">{t('ticket.form.imageClickText')}</p>
                                                    <p className="text-xs text-gray-500">{t('ticket.form.imageFormatText')}</p>
                                                </div>
                                            )}
                                            {fileURL && (
                                                <>
                                                    <img
                                                        src={fileURL}
                                                        alt="preview"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFile(null);
                                                            setFileURL(null);
                                                        }}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleChangeImage}
                                        />
                                    </div>
                                </div>

                                {/* Sección de Fecha */}
                                <div className="bg-[#5334A0] backdrop-blur-sm border-2 border-blue-400/30 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400/50">
                                            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-300 font-medium mb-1">
                                                {t('Fecha de Cambio')}
                                            </p>
                                            <p className="text-base font-semibold text-white">
                                                {formatDate(new Date(), { month: 'long', day: 'numeric', year: 'numeric' }, lang)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>


                            {/* Botones de acción */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{
                                        background: 'rgba(247, 244, 243, 0.15)',
                                        backdropFilter: 'blur(12px)',
                                        border: '2px solid rgba(247, 244, 243, 0.3)',
                                        color: '#f7f4f3'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(247, 244, 243, 0.25)';
                                        e.currentTarget.style.borderColor = 'rgba(247, 244, 243, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(247, 244, 243, 0.15)';
                                        e.currentTarget.style.borderColor = 'rgba(247, 244, 243, 0.3)';
                                    }}
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? t('common.saving') : isCreateMode ? t('ticket.actions.create') : t('Actualizar')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/Assignment')}
                                    disabled={saving}
                                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{
                                        background: 'transparent',
                                        border: '2px solid #f7f4f3',
                                        color: '#f7f4f3'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(247, 244, 243, 0.1)';
                                        e.currentTarget.style.borderColor = '#fc52af';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = '#f7f4f3';
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
