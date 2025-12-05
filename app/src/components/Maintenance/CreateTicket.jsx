// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import {useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, Car, Minimize, Save, X } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';

// Servicios
import CategoryService from '@/services/CategoryService';
import UserService from '@/services/UserService';
import EtiquetaService from '@/services/EtiquetaService';
import TicketService from '@/services/TicketService';
import PriorityService from '@/services/PriorityService';
import SLAService from '@/services/SLAService';
import { formatDate } from '@/lib/utils';

//Id Solicitante
const IdUser = 1;

// ========================================
// COMPONENTE: Crear/Editar Ticket
// ========================================
export function CreateTicket() {
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
    const [prioridadesDisponibles, setPrioridadesDisponibles] = useState([]);
    const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
    const [user, setUsuarioSolicitante] = useState(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        Titulo: '',
        Descripcion: '',
        Prioridad: '',
        Etiquetas: [],
        Fecha_Creacion: '',
        Archivo: '',
        IdUsuario: ''
    });

    /*** Manejo de imagen ***/
    const handleChangeImage = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileURL(URL.createObjectURL(selectedFile));
        }
    };

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const fetchPrioridades = async () => {
            try {
                const [Prioridadres] = await Promise.all([
                    PriorityService.getPrioridades()
                ]);
                if (Prioridadres.data.success) {
                    setPrioridadesDisponibles(Prioridadres.data.data || []);
                }
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrioridades();
    }, []);

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const fetchEtiquetas = async () => {
            try {
                const [Etiquetasres] = await Promise.all([
                    EtiquetaService.getEtiquetas()
                ]);
                if (Etiquetasres.data.success) {
                    setEtiquetasDisponibles(Etiquetasres.data.data || []);
                }
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEtiquetas();
    }, []);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const [Usuariosres] = await Promise.all([
                    UserService.getUserById(IdUser)
                ]);
                if (Usuariosres.data.success) {
                    setUsuarioSolicitante(Usuariosres.data.data || null);
                }
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuario();
    }, []);

    const validateForm = () => {
        let isValid = true;

        if (!formData.Titulo.trim()) {
            console.log(formData.Titulo);
            toast.error(t('ticket.validation.titleRequired'));
            isValid = false;
        }
        if (!formData.Prioridad) {
            toast.error(t('ticket.validation.priorityRequired'));
            isValid = false;
        }
        if (!formData.Descripcion.trim()) {
            toast.error(t('ticket.validation.descriptionRequired'));
            isValid = false;
        }
        if (!formData.Categoria) {
            toast.error(t('ticket.validation.categoryRequired'));
            isValid = false;
        }
        if (!formData.Etiqueta) {
            toast.error(t('ticket.validation.tagRequired'));
            isValid = false;
        }
        if(!file){
            toast.error(t('ticket.validation.imageRequired'));
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
                Titulo: formData.Titulo,
                Descripcion: formData.Descripcion,
                Prioridad: formData.Prioridad,
                Etiqueta: formData.Etiqueta,
                Categoria: formData.Categoria,
                Fecha_Creacion: formData.FechaCreacion,
                Id_Usuario: formData.IdUsuario,
                Fecha_Limite_Respuesta: formData.Fecha_Limite_Respuesta,
                Fecha_Limite_Resolucion: formData.Fecha_Limite_Resolucion
            };

            //Campos Calculados
            dataToSend.Archivo = file;
            dataToSend.Id_Usuario = IdUser;
            
            // Función para convertir fecha a formato MySQL en zona horaria Costa Rica (UTC-6)
            const formatToCostaRica = (date) => {
                const costaRicaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
                const year = costaRicaDate.getFullYear();
                const month = String(costaRicaDate.getMonth() + 1).padStart(2, '0');
                const day = String(costaRicaDate.getDate()).padStart(2, '0');
                const hours = String(costaRicaDate.getHours()).padStart(2, '0');
                const minutes = String(costaRicaDate.getMinutes()).padStart(2, '0');
                const seconds = String(costaRicaDate.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };
            
            // Fecha actual en Costa Rica
            const fechaActual = new Date();
            dataToSend.Fecha_Creacion = formatToCostaRica(fechaActual);
            
            //SLA
            const slaResponse = await SLAService.getSLAById(formData.Categoria.Id_SLA);

            dataToSend.Categoria = formData.Categoria.Id;
            
            //Resolución - Sumar horas correctamente usando milisegundos
            const horasResolucion = slaResponse.data.data[0].Tiempo_Resolucion;
            const FechaResolucion = new Date(fechaActual.getTime() + (horasResolucion * 60 * 60 * 1000));
            
            //Respuesta - Sumar horas correctamente usando milisegundos
            const horasRespuesta = slaResponse.data.data[0].Tiempo_Respuesta;
            const FechaRespuesta = new Date(fechaActual.getTime() + (horasRespuesta * 60 * 60 * 1000));
            
            dataToSend.Fecha_Limite_Resolucion = formatToCostaRica(FechaResolucion);
            dataToSend.Fecha_Limite_Respuesta = formatToCostaRica(FechaRespuesta);

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
            response = await TicketService.createTicket(formDataToSend);

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

    // Selección de etiqueta (modo simple: una sola)
    const toggleEtiqueta = (idEtiqueta) => {
        setFormData(prev => {
            const nueva = prev.Etiqueta === idEtiqueta ? '' : idEtiqueta;
            // Si se selecciona una nueva etiqueta, actualizar categoría asociada
            if (nueva) {
                CambiarCategoria(nueva);
            } else {
                handleInputChange('Categoria', '');
            }
            return { ...prev, Etiqueta: nueva };
        });
    };

    const CambiarCategoria = async (IdEtiqueta) => {
        const CategoriasAsociadas = await CategoryService.getCategoriesByEtiqueta(IdEtiqueta);
        console.log(CategoriasAsociadas.data.data);
        handleInputChange('Categoria', CategoriasAsociadas.data.data[0] || '');
    };

    if (loading) return <LoadingGrid count={1} type="grid" />;

    // Formulario (Crear/Editar)
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 md:px-10 lg:px-16">
            <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {isCreateMode ? t('ticket.titleCreate') : t('ticket.titleEdit')}
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
                            {/* Titulo */}
                            <div className="space-y-2">
                                <Label htmlFor="Titulo" style={{ color: '#f7f4f3' }}>
                                    {t('ticket.form.titleLabel')} *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="Titulo"
                                    value={formData.Titulo}
                                    onChange={(e) => handleInputChange('Titulo', e.target.value)}
                                    placeholder={t('ticket.form.titlePlaceholder')}
                                />
                                <Label htmlFor="Descripcion" style={{ color: '#f7f4f3' }}>
                                    {t('ticket.form.descriptionLabel')} *
                                </Label>
                                <Input style={{ marginBottom: '2em', height: '100px' }}
                                    id="Descripcion"
                                    value={formData.Descripcion}
                                    onChange={(e) => handleInputChange('Descripcion', e.target.value)}
                                    placeholder={t('ticket.form.descriptionPlaceholder')}
                                />
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    {t('ticket.form.requesterLabel')} *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="UsuarioSolicitante"
                                    value={user?.Nombre || ''}
                                    onChange={(e) => handleInputChange('UsuarioSolicitante', e.target.value)}
                                    readOnly
                                />
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    {t('ticket.form.emailLabel')} *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="UsuarioSolicitante"
                                    value={user?.Correo || ''}
                                    onChange={(e) => handleInputChange('UsuarioSolicitante', e.target.value)}
                                    readOnly
                                />
                                {/* Prioridad */}
                                <div style={{ marginBottom: '2em' }}>
                                    <Label htmlFor="Prioridad" style={{ color: '#f7f4f3', marginBottom: '1em' }}>
                                        {t('ticket.form.priorityLabel')} *
                                    </Label>
                                    <div className="space-y-2">
                                        <Select
                                            value={formData.Prioridad?.toString()}
                                            onValueChange={(value) => handleInputChange('Prioridad', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('ticket.form.priorityPlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {prioridadesDisponibles.map((estado) => (
                                                    <SelectItem key={estado.value} value={estado.Id}>
                                                        {estado.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Etiquetas y Categorías en 2 columnas */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5em', marginBottom: '2em' }}>
                                    <div> {/* Etiqueta (Badges) */}
                                        <Label htmlFor="Etiqueta" style={{ color: '#f7f4f3', marginBottom: '0.25em', display: 'block' }}>
                                            {t('ticket.form.tagLabel')} *
                                        </Label>
                                        <p style={{ color: '#9ca3af', marginBottom: '0.75em', fontSize: '0.75rem' }}>Solo puede elegir una etiqueta</p>
                                        <div className="flex flex-wrap gap-2" style={{ marginBottom: '0.5em' }}>
                                            {etiquetasDisponibles.map((etiqueta) => {
                                                const selected = formData.Etiqueta === etiqueta.Id;
                                                const locked = formData.Etiqueta && formData.Etiqueta !== etiqueta.Id;
                                                return (
                                                    <Badge
                                                        key={etiqueta.Id}
                                                        variant={selected ? 'default' : 'outline'}
                                                        className="" // cursor handled inline to allow not-allowed state
                                                        style={{
                                                            backgroundColor: selected ? '#fc52af' : 'transparent',
                                                            borderColor: selected ? '#fc52af' : 'rgba(156, 163, 175, 0.5)',
                                                            color: selected ? '#fff' : '#f7f4f3',
                                                            opacity: locked ? 0.4 : 1,
                                                            cursor: locked ? 'not-allowed' : 'pointer'
                                                        }}
                                                        onClick={() => {
                                                            if (locked) return;
                                                            toggleEtiqueta(etiqueta.Id);
                                                        }}
                                                    >
                                                        {etiqueta.Nombre}
                                                        {selected && <X className="ml-1 h-3 w-3" />}
                                                    </Badge>
                                                );
                                            })}
                                            {etiquetasDisponibles.length === 0 && (
                                                <p className="text-muted-foreground text-sm">
                                                    {t('ticket.form.tagPlaceholder')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div> {/* Categoria */}
                                        <Label htmlFor="Categoria" style={{ color: '#f7f4f3', marginBottom: '0.25em', display: 'block' }}>
                                            {t('ticket.form.categoryLabel')} *
                                        </Label>
                                        <p style={{ color: '#9ca3af', marginBottom: '0.75em', fontSize: '0.75rem', visibility: 'hidden' }}>Placeholder</p>
                                        <div>
                                            {formData.Categoria ? (
                                                <Badge
                                                    id="Categoria"
                                                    className="px-3 py-1"
                                                    style={{
                                                        backgroundColor: '#fc52af',
                                                        borderColor: '#fc52af',
                                                        color: '#fff'
                                                    }}
                                                >
                                                    {formData.Categoria.Nombre}
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    id="Categoria"
                                                    variant="outline"
                                                    className="px-3 py-1"
                                                    style={{
                                                        borderColor: 'rgba(156, 163, 175, 0.5)',
                                                        color: '#f7f4f3'
                                                    }}
                                                >
                                                    {t('ticket.form.categoryPlaceholder')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    {t('ticket.form.creationDateLabel')} *
                                </Label>
                                <h1>{formatDate(new Date(), { month: 'long', day: 'numeric', year: 'numeric' }, lang)}</h1>
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    {t('ticket.form.statusLabel')} *
                                </Label>
                                <h1>Pendiente</h1>

                                {/* Imagen */}
                                <div className="mb-6">
                                    <Label htmlFor="image" className="block mb-1 text-sm font-medium">
                                        {t('ticket.form.imageLabel')}
                                    </Label>
                                    <div
                                        className="relative w-56 h-56 border-2 border-dashed border-muted/50 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
                                        onClick={() => document.getElementById("image").click()}
                                    >
                                        {!fileURL && (
                                            <div className="text-center px-4">
                                                <p className="text-sm text-muted-foreground">{t('ticket.form.imageClickText')}</p>
                                                <p className="text-xs text-muted-foreground">{t('ticket.form.imageFormatText')}</p>
                                            </div>
                                        )}
                                        {fileURL && (
                                            <img
                                                src={fileURL}
                                                alt="preview"
                                                className="w-full h-full object-contain rounded-lg shadow-sm"
                                            />
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
                                    {saving ? t('common.saving') : isCreateMode ? t('ticket.actions.create') : t('ticket.actions.saveChanges')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/Ticket')}
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
