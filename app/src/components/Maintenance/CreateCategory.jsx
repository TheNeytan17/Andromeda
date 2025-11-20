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
import { ArrowLeft, Save, X } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Servicios
import CategoryService from "@/services/CategoryService";
import EtiquetaService from "@/services/EtiquetaService";
import SLAService from "@/services/SLAService";
import EspecialidadService from "@/services/EspecialidadService";

// ========================================
// COMPONENTE: Crear/Editar Categoría
// ========================================
export function CreateCategory() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id && id !== 'new';
    const isCreateMode = !id || id === 'new';

    // Estado de datos y UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        Nombre: '',
        Etiquetas: [],
        Especialidades: []
    });

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [etiquetasRes, especialidadesRes] = await Promise.all([
                    EtiquetaService.getEtiquetas(),
                    EspecialidadService.getEspecialidades()
                ]);
                if (etiquetasRes.data.success) {
                    setEtiquetasDisponibles(etiquetasRes.data.data || []);
                }
                if (especialidadesRes.data.success) {
                    setEspecialidadesDisponibles(especialidadesRes.data.data || []);
                }
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogos();
    }, []);

    // Cargar detalle de la categoría si es modo edición
    useEffect(() => {
        const fetchData = async () => {
            if (!isEditMode) return;
            setLoading(true);
            try {
                const response = await CategoryService.getCategoryById(id);
                if (!response.data.success) {
                    toast.error(response.data.message);
                } else {
                    const categoria = response.data.data;
                    setFormData({
                        Nombre: categoria.Nombre || '',
                        Etiquetas: (categoria.Etiquetas || []).map(e => e.Id),
                        Especialidades: (categoria.Especialidades || []).map(e => e.Id)
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
            toast.error(t('category.validation.nameRequired'));
            isValid = false;
        }
        if (!formData.Etiquetas.length) {
            toast.error(t('category.validation.tagsRequired'));
            isValid = false;
        }
        if (!formData.Especialidades.length) {
            toast.error(t('category.validation.skillsRequired'));
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            const dataToSend = {
                Nombre: formData.Nombre,
                Etiquetas: formData.Etiquetas,
                Especialidades: formData.Especialidades
            };
            let response;
            if (isCreateMode) {
                response = await CategoryService.createCategory(dataToSend);
            } else {
                response = await CategoryService.updateCategory(id, dataToSend);
            }
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate('/TableCategory');
                }, 1500);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleEtiqueta = (idEtiqueta) => {
        setFormData(prev => ({
            ...prev,
            Etiquetas: prev.Etiquetas.includes(idEtiqueta)
                ? prev.Etiquetas.filter(id => id !== idEtiqueta)
                : [...prev.Etiquetas, idEtiqueta]
        }));
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
                    {isCreateMode ? t('category.titleCreate') : t('category.titleEdit')}
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
                            {/* Nombre de la categoría */}
                            <div className="space-y-2">
                                <Label htmlFor="nombre" style={{ color: '#f7f4f3' }}>
                                    {t('category.form.nameLabel')} *
                                </Label>
                                <Input
                                    id="nombre"
                                    value={formData.Nombre}
                                    onChange={(e) => handleInputChange('Nombre', e.target.value)}
                                    placeholder={t('category.form.namePlaceholder')}
                                />
                            </div>

                            {/* Etiquetas */}
                            <div className="space-y-3">
                                <Label style={{ color: '#f7f4f3' }}>
                                    {t('category.form.tags')}
                                    <Badge
                                        className="ml-2"
                                        style={{
                                            backgroundColor: '#fc52af',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {formData.Etiquetas.length}
                                    </Badge>
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {etiquetasDisponibles.map((etiqueta) => (
                                        <Badge
                                            key={etiqueta.Id}
                                            variant={formData.Etiquetas.includes(etiqueta.Id) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            style={{
                                                backgroundColor: formData.Etiquetas.includes(etiqueta.Id) ? '#fc52af' : 'transparent',
                                                borderColor: formData.Etiquetas.includes(etiqueta.Id) ? '#fc52af' : 'rgba(156, 163, 175, 0.5)',
                                                color: formData.Etiquetas.includes(etiqueta.Id) ? '#fff' : '#f7f4f3'
                                            }}
                                            onClick={() => toggleEtiqueta(etiqueta.Id)}
                                        >
                                            {etiqueta.Nombre}
                                            {formData.Etiquetas.includes(etiqueta.Id) && (
                                                <X className="ml-1 h-3 w-3" />
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                                {etiquetasDisponibles.length === 0 && (
                                    <p className="text-muted-foreground text-sm">{t('category.form.noTags')}</p>
                                )}
                            </div>

                            {/* Especialidades */}
                            <div className="space-y-3">
                                <Label style={{ color: '#f7f4f3' }}>
                                    {t('category.form.requiredSkills')}
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
                                    <p className="text-muted-foreground text-sm">{t('category.form.noSkills')}</p>
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
                                    {saving ? t('common.saving') : isCreateMode ? t('category.actions.create') : t('category.actions.saveChanges')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/TableCategory')}
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
