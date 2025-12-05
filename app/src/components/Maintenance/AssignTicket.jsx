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
import CategoryService from '@/services/CategoryService';
import TechnicianService from '@/services/TechnicianService';
import EtiquetaService from '@/services/EtiquetaService';
import AssignmentService from '@/services/AssignmentService';

//Id Solicitante
const IdUser = 1;

// ========================================
// COMPONENTE: Crear/Editar Ticket
// ========================================
export function AssingTicket() {
    const { t, lang } = useI18n();
    const navigate = useNavigate();
    const { id } = useParams();
    const isCreateMode = !id || id === 'new';

    // Estado de datos y UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados para los catálogos
    const [ticket, setTicket] = useState({});
    const [states, setStates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [SLAs, setSLAs] = useState([]);
    const [technicians, setTechnicians] = useState([]);


    // Estados del formulario
    const [formData, setFormData] = useState({
        Id_Ticket: '',
        Estado_Anterior: '',
        Estado_Nuevo: '',
        Justificación: '',
        Id_Usuario_Responsable: '',
        Id_Tecnico: ''
    });

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
                const [categoriesData] = await Promise.all([
                    CategoryService.getCategoryById(ticketData.data.data.Id_Categoria)
                ]);
                const [slaData] = await Promise.all([
                    SLAService.getSLAById(categoriesData.data.data.Id_SLA)
                ]);
                // Obtener técnicos por especialidad evitando duplicados
                const techPromises = categoriesData.data.data.Especialidades.map((Especialidad) =>
                    TechnicianService.getTechniciansByEtiqueta(Especialidad.Id)
                );
                
                const techResults = await Promise.all(techPromises);
                const allTechnicians = techResults.flatMap(techData => 
                    techData.data.success ? techData.data.data : []
                );
                
                // Eliminar duplicados basándose en el Id del técnico
                const uniqueTechnicians = Array.from(
                    new Map(allTechnicians.map(tech => [tech.Id, tech])).values()
                );
                
                setTechnicians(uniqueTechnicians);
                if (statesData.data.success) {
                    setStates(statesData.data.data || []);
                }
                if (ticketData.data.success) {
                    setTicket(ticketData.data.data || null);
                }
                if (categoriesData.data.success) {
                    setCategories(categoriesData.data.data || []);
                }
                if (slaData.data.success) {
                    setSLAs(slaData.data.data || []);
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
        if (!formData.Justificación.trim()) {
            toast.error(t('La justificación es obligatoria'));
            isValid = false;
        }
        if (!formData.Id_Tecnico) {
            toast.error(t('Debe seleccionar un técnico'));
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
                Observaciones: formData.Justificación,
                Estado_Anterior: Number(ticket.Estado),
                Estado_Nuevo: Number(ticket.Estado) + 1,
                Fecha_Cambio: new Date().toISOString().slice(0, 19).replace('T', ' '),
                Id_Usuario_Responsable: IdUser,
                Id_Tecnico: formData.Id_Tecnico,
                Id_Usuario_Ticket: ticket.Id_Usuario,
                Metodo_Asignacion: '1',
                Prioridad: ticket.Prioridad
            };

            console.log('Datos a enviar:', dataToSend);

            let response;
            response = await AssignmentService.createAssignment(dataToSend);

            console.log('Respuesta del servidor:', response.data);

            if (response.data.success) {
                toast.success(isCreateMode ? t('ticket.messages.createSuccess') : t('ticket.messages.updateSuccess'));
                setTimeout(() => {
                    navigate('/Ticket');
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
                    {isCreateMode ? t('ticket.titleCreate') : t('Asignar Ticket')}
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

                                {/* Información del Ticket - Estado, SLA y Categoría */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold" style={{ color: '#f7f4f3' }}>
                                        {t('Detalles del Ticket')}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Estado */}
                                        <div className='flex flex-col gap-3 h-full'>
                                            <div className="flex items-center gap-2 h-8">
                                                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                                <p className="text-sm font-semibold text-blue-300 uppercase tracking-wide">
                                                    {t('Estado')}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/15 backdrop-blur-sm border-2 border-blue-400/40 rounded-xl p-4 shadow-md hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-400/60 flex-1">
                                                <div className="flex items-center gap-3 h-full">
                                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-500/25 flex items-center justify-center border border-blue-400/50">
                                                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-bold text-white line-clamp-2">
                                                            {states.find(s => s.Id === ((ticket.Estado)))?.Nombre || t('common.notAvailable')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SLA */}
                                        <div className='flex flex-col gap-3 h-full'>
                                            <div className="flex items-center gap-2 h-8">
                                                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                                                <p className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                                                    {t('SLA')}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/15 backdrop-blur-sm border-2 border-purple-400/40 rounded-xl p-4 shadow-md hover:shadow-purple-500/20 transition-all duration-300 hover:border-purple-400/60 flex-1">
                                                <div className="flex items-center gap-3 h-full">
                                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-500/25 flex items-center justify-center border border-purple-400/50">
                                                        <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white break-words">
                                                            {SLAs[0]?.Descripcion || t('common.notAvailable')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Categoría */}
                                        <div className='flex flex-col gap-3 h-full'>
                                            <div className="flex items-center gap-2 h-8">
                                                <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                                                <p className="text-sm font-semibold text-orange-300 uppercase tracking-wide">
                                                    {t('Categoria')}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-orange-500/15 to-orange-600/15 backdrop-blur-sm border-2 border-orange-400/40 rounded-xl p-4 shadow-md hover:shadow-orange-500/20 transition-all duration-300 hover:border-orange-400/60 flex-1">
                                                <div className="flex items-center gap-3 h-full">
                                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-orange-500/25 flex items-center justify-center border border-orange-400/50">
                                                        <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-bold text-white line-clamp-2">
                                                            {categories?.Nombre || t('common.notAvailable')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Observaciones e Imagen */}
                                <div className="relative">
                                    <div className="relative flex items-start justify-between gap-6 z-10">
                                        {/* Sección de Justificación */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-6 bg-gradient-to-b from-[#fc52af] to-purple-500 rounded-full"></div>
                                                <h3 className="text-lg font-semibold" style={{ color: '#f7f4f3' }}>
                                                    {t('Justificación')}
                                                </h3>
                                            </div>

                                            <div className="relative h-[240px]">
                                                <textarea
                                                    id="Justificación"
                                                    value={formData.Justificación}
                                                    onChange={(e) => handleInputChange('Justificación', e.target.value)}
                                                    placeholder={t('Inserte las justificación de porque eligio a este técnico.')}
                                                    className="w-full h-full px-4 py-3 bg-white/5 border-2 border-[#fc52af]/30 rounded-xl text-white placeholder:text-gray-500 focus:border-[#fc52af] focus:ring-2 focus:ring-[#fc52af]/20 transition-all duration-300 resize-none backdrop-blur-sm"
                                                    style={{
                                                        outline: 'none'
                                                    }}
                                                />
                                                <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-md">
                                                    {formData.Justificación?.length || 0} caracteres
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sección de Tecnicos */}
                                        <div className="lg:w-96 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-6 bg-gradient-to-b from-[#fc52af] to-purple-500 rounded-full"></div>
                                                <h3 className="text-lg font-semibold" style={{ color: '#f7f4f3' }}>
                                                    {t('Tecnicos Disponibles')}
                                                </h3>
                                            </div>

                                            <div className="bg-white/5 border-2 border-[#fc52af]/30 rounded-xl backdrop-blur-sm overflow-hidden h-[240px] flex flex-col">
                                                {technicians.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                                                        <svg className="w-16 h-16 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <p className="text-sm text-gray-400 text-center">
                                                            {t('No hay técnicos disponibles')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Header con contador */}
                                                        <div className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#fc52af]/10 to-purple-500/10 border-b border-[#fc52af]/20">
                                                            <p className="text-xs font-semibold text-gray-300">
                                                                {technicians.length} {technicians.length === 1 ? t('técnico disponible') : t('técnicos disponibles')}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Lista con scroll */}
                                                        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: 'rgba(252, 82, 175, 0.5) transparent'
                                                        }}>
                                                        <div className="space-y-2 p-3">
                                                            {technicians.map((tech) => (
                                                                <div
                                                                    key={tech.Id}
                                                                    className="bg-gradient-to-r from-purple-500/10 to-[#fc52af]/10 border border-[#fc52af]/30 rounded-lg p-3 hover:border-[#fc52af] hover:from-purple-500/20 hover:to-[#fc52af]/20 transition-all duration-200 cursor-pointer group"
                                                                    onClick={() => handleInputChange('Id_Tecnico', tech.Id)}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {/* Avatar del técnico */}
                                                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-[#fc52af] to-purple-500 flex items-center justify-center border-2 border-[#fc52af]/50 group-hover:border-[#fc52af] transition-colors">
                                                                            <span className="text-white font-bold text-sm">
                                                                                {tech.Nombre?.charAt(0).toUpperCase()}{tech.Apellido?.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {/* Información del técnico */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-semibold text-white group-hover:text-[#fc52af] transition-colors">
                                                                                {tech.Nombre}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                                <Badge 
                                                                                    variant="outline" 
                                                                                    className="text-xs bg-purple-500/20 border-purple-400/50 text-purple-300"
                                                                                >
                                                                                    {tech.Correo}
                                                                                </Badge>
                                                                            </div>
                                                                            
                                                                            {/* Carga de trabajo */}
                                                                            <div className="mt-2">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <span className="text-xs text-gray-400">
                                                                                        {t('Carga de trabajo')}
                                                                                    </span>
                                                                                    <span className="text-xs font-semibold text-white">
                                                                                        {tech.CargaTrabajo || 0} {t('tickets')}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                                                            (tech.CargaTrabajo || 0) <= 3 
                                                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                                                                                : (Number(tech.CargaTrabajo) || 0) <= 5 
                                                                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                                                                                                : 'bg-gradient-to-r from-red-500 to-red-600'
                                                                                        }`}
                                                                                        style={{ 
                                                                                            width: `${Math.min(((tech.CargaTrabajo || 0) / 10) * 100, 100)}%` 
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Indicador de selección */}
                                                                        {formData.Id_Tecnico === tech.Id && (
                                                                            <div className="flex-shrink-0">
                                                                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones e Imagen */}
                            <div className="space-y-6">
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
                                                {formatDate(new Date(), { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }, lang)}
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
                                    <Ticket className="w-4 h-4" />
                                    {saving ? t('common.saving') : isCreateMode ? t('ticket.actions.create') : t('Asignar Ticket')}
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
