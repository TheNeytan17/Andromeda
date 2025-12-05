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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, Save, X } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';

// Servicios
import EspecialidadService from "@/services/EspecialidadService";
import TechnicianService from '@/services/TechnicianService';

// ========================================
// COMPONENTE: Crear/Editar Técnico
// ========================================
export function CreateTechnician() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id && id !== 'new';
    const isCreateMode = !id || id === 'new';
    const Estados = [
        { value: '1', label: t('technician.status.active') },
        { value: '0', label: t('technician.status.inactive') }
    ];

    // Estado de datos y UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados para los catálogos
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);

    // Estados del formulario
    const [formData, setFormData] = useState({
        Nombre: '',
        Correo: '',
        Password: '',
        Especialidades: [],
        Estado: '',
        CargaTrabajo: ''
    });

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const fetchTecnicos = async () => {
            try {
                const [especialidadesRes] = await Promise.all([
                    EspecialidadService.getEspecialidades()
                ]);
                if (especialidadesRes.data.success) {
                    setEspecialidadesDisponibles(especialidadesRes.data.data || []);
                }
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTecnicos();
    }, []);

    // Cargar detalle de la categoría si es modo edición
    useEffect(() => {
        const fetchData = async () => {
            if (!isEditMode) {
                return;
            }

            setLoading(true);
            try {
                const response = await TechnicianService.getTechnicianById(id);
                console.log('Respuesta del servidor al obtener técnico:', response.data);
                if (!response.data.success) {
                    toast.error(response.data.message);
                } else {
                    const Tecnico = response.data.data;

                    setFormData({
                        Nombre: Tecnico.Nombre || '',
                        Correo: Tecnico.Correo || '',
                        Estado: Tecnico.Estado,
                        Especialidades: (Tecnico.Especialidades || []).map(e => e.Id),
                        CargaTrabajo: Tecnico.CargaTrabajo || 0
                    });
                }
            } catch (err) {
                if (err.name !== 'AbortError') toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

    const validateForm = () => {
        let isValid = true;
        if (!formData.Nombre.trim()) {
            toast.error(t('technician.validation.nameRequired'));
            isValid = false;
        } else if (/\d/.test(formData.Nombre.trim())) {
            toast.error(t('technician.validation.nameNoNumbers'));
            isValid = false;
        }
        if (!formData.Correo.trim()) {
            toast.error(t('technician.validation.emailRequired'));
            isValid = false;
        } else if (!formData.Correo.trim().endsWith('@andromeda.com')) {
            toast.error(t('technician.validation.emailDomain'));
            isValid = false;
        }
        if (!formData.Estado) {
            toast.error(t('technician.validation.statusRequired'));
            isValid = false;
        }
        if (!formData.Especialidades.length) {
            toast.error(t('technician.validation.skillsRequired'));
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
                Nombre: formData.Nombre,
                Especialidades: formData.Especialidades,
                Correo: formData.Correo,
                Estado: formData.Estado,
                CargaTrabajo: formData.CargaTrabajo
            };

            console.log('Datos a enviar:', dataToSend);
            console.log('ID Técnico:', id);
            console.log('Modo:', isCreateMode ? 'Crear' : 'Editar');

            let response;
            if (isCreateMode) {
                response = await TechnicianService.createTechnician(dataToSend);
            } else {
                response = await TechnicianService.updateTechnician(id, dataToSend);
            }

            console.log('Respuesta del servidor:', response.data);

            if (response.data.success) {
                toast.success(isCreateMode ? t('technician.messages.createSuccess') : t('technician.messages.updateSuccess'));
                setTimeout(() => {
                    navigate('/Technician');
                }, 1500);
            } else {
                toast.error(isCreateMode ? t('technician.messages.createError') : t('technician.messages.updateError'));
            }
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Respuesta del error:', err.response?.data);
            toast.error(isCreateMode ? t('technician.messages.createError') : t('technician.messages.updateError'));
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleEspecialidad = (idEspecialidad) => {
        setFormData(prev => ({
            ...prev,
            Especialidades: prev.Especialidades.includes(idEspecialidad)
                ? prev.Especialidades.filter(id => id !== idEspecialidad)
                : [...prev.Especialidades, idEspecialidad]
        }));
    };

    if (loading) return <LoadingGrid count={1} type="grid" />;

    // Formulario (Crear/Editar)
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {isCreateMode ? t('technician.titleCreate') : t('technician.titleEdit')}
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
                            {/* Nombre del técnico */}
                            <div className="space-y-2">
                                <Label htmlFor="nombre" style={{ color: '#f7f4f3' }}>
                                    {t('technician.form.nameLabel')} *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="nombre"
                                    value={formData.Nombre}
                                    onChange={(e) => handleInputChange('Nombre', e.target.value)}
                                    placeholder={t('technician.form.namePlaceholder')}
                                />
                                <Label htmlFor="Correo" style={{ color: '#f7f4f3' }}>
                                    {t('technician.form.emailLabel')} *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="Correo"
                                    value={formData.Correo}
                                    onChange={(e) => handleInputChange('Correo', e.target.value)}
                                    placeholder={t('technician.form.emailPlaceholder')}
                                />
                                <Label htmlFor="Estado" style={{ color: '#f7f4f3' }}>
                                    {t('technician.form.statusLabel')} *
                                </Label>
                                <div className="space-y-2">
                                    <Select
                                        value={formData.Estado?.toString()}
                                        onValueChange={(value) => handleInputChange('Estado', value)}
                                    >
                                        <SelectTrigger style={{ marginBottom: '2em' }}>
                                            <SelectValue placeholder={t('technician.form.statusPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent> 
                                            {Estados.map((estado) => (
                                                <SelectItem key={estado.value} value={estado.value}>
                                                    {estado.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Label htmlFor="CargaTrabajo" style={{ color: '#f7f4f3' }}>
                                    {t('technician.form.workloadLabel')} *
                                </Label>
                                <Input 
                                    id="CargaTrabajo"
                                    value={formData.CargaTrabajo}
                                    onChange={(e) => handleInputChange('CargaTrabajo', e.target.value)}
                                    placeholder={t('technician.form.workloadPlaceholder')}
                                    readOnly
                                />
                            </div>

                            {/* Especialidades */}
                            <div className="space-y-3">
                                <Label style={{ color: '#f7f4f3' }}>
                                    {t('technician.form.skills')}
                                    <Badge
                                        className="ml-2"
                                        style={{
                                            backgroundColor: '#fc52af',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {formData.Especialidades.length}
                                    </Badge>
                                </Label>
                                <div className="space-y-2">
                                    {especialidadesDisponibles.map((especialidad) => (
                                        <div
                                            key={especialidad.Id}
                                            className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                                            style={{
                                                backgroundColor: formData.Especialidades.includes(especialidad.Id)
                                                    ? 'rgb(255, 143, 87, 0.1)'
                                                    : 'transparent',
                                                borderColor: formData.Especialidades.includes(especialidad.Id)
                                                    ? '#ff8f57'
                                                    : 'rgba(156, 163, 175, 0.5)'
                                            }}
                                            onClick={() => toggleEspecialidad(especialidad.Id)}
                                        >
                                            <Badge
                                                variant={formData.Especialidades.includes(especialidad.Id) ? "default" : "outline"}
                                                className="mt-0.5"
                                                style={{
                                                    backgroundColor: formData.Especialidades.includes(especialidad.Id) ? '#fc52af' : 'transparent',
                                                    borderColor: formData.Especialidades.includes(especialidad.Id) ? '#fc52af' : 'rgba(156, 163, 175, 0.5)',
                                                    color: formData.Especialidades.includes(especialidad.Id) ? '#fff' : '#f7f4f3'
                                                }}
                                            >
                                                {especialidad.Nombre}
                                            </Badge>
                                            <div className="flex-1">
                                                <p className="text-sm" style={{ color: '#f7f4f3' }}>{especialidad.Descripcion}</p>
                                            </div>
                                            {formData.Especialidades.includes(especialidad.Id) && (
                                                <X className="h-4 w-4 text-[#fc52af]" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {especialidadesDisponibles.length === 0 && (
                                    <p className="text-muted-foreground text-sm">{t('technician.form.noSkills')}</p>
                                )}
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
                                    {saving ? t('common.saving') : isCreateMode ? t('technician.actions.create') : t('technician.actions.saveChanges')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/Technician')}
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
