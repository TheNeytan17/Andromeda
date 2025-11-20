// ========================================
// IMPORTS
// ========================================
import React, { useEffect, useState } from 'react';
import {useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, Car, Minimize, Save, X } from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';

// Servicios
import CategoryService from '@/services/CategoryService';
import UserService from '@/services/UserService';
import EtiquetaService from '@/services/EtiquetaService';
import TicketService from '@/services/TicketService';
import PriorityService from '@/services/PriorityService';
import SLAService from '@/services/SLAService';

//Id Solicitante
const IdUser = 1;

// ========================================
// COMPONENTE: Crear/Editar Ticket
// ========================================
export function CreateTicket() {
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
            toast.error('El título del ticket es requerido');
            isValid = false;
        }
        if (!formData.Prioridad) {
            toast.error('La prioridad es requerida');
            isValid = false;
        }
        if (!formData.Descripcion.trim()) {
            toast.error('La descripción es requerida');
            isValid = false;
        }
        if (!formData.Categoria) {
            toast.error('La categoría es requerida');
            isValid = false;
        }
        if (!formData.Etiqueta) {
            toast.error('La etiqueta es requerida');
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
            dataToSend.Fecha_Creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
            //SLA
            const slaResponse = await SLAService.getSLAById(formData.Categoria.Id_SLA);

            dataToSend.Categoria = formData.Categoria.Id;
            //Resolución
            const FechaResolucion = new Date();
            FechaResolucion.setHours(FechaResolucion.getHours() + slaResponse.data.data[0].Tiempo_Resolucion);
            //Respuesta
            const FechaRespuesta = new Date();
            FechaRespuesta.setHours(FechaRespuesta.getHours() + slaResponse.data.data[0].Tiempo_Respuesta);
            
            dataToSend.Fecha_Limite_Resolucion = FechaResolucion.toISOString().slice(0, 19).replace('T', ' ');
            dataToSend.Fecha_Limite_Respuesta = FechaRespuesta.toISOString().slice(0, 19).replace('T', ' ');

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
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate('/Ticket');
                }, 1500);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Respuesta del error:', err.response?.data);
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                    {isCreateMode ? 'Crear Ticket' : 'Editar Ticket'}
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
                                    Título *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="Titulo"
                                    value={formData.Titulo}
                                    onChange={(e) => handleInputChange('Titulo', e.target.value)}
                                    placeholder="Ingrese el título del ticket"
                                />
                                <Label htmlFor="Descripcion" style={{ color: '#f7f4f3' }}>
                                    Descripción *
                                </Label>
                                <Input style={{ marginBottom: '2em', height: '100px' }}
                                    id="Descripcion"
                                    value={formData.Descripcion}
                                    onChange={(e) => handleInputChange('Descripcion', e.target.value)}
                                    placeholder="Ingrese la descripción del ticket"
                                />
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    Usuario Solicitante *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="UsuarioSolicitante"
                                    value={user?.Nombre || ''}
                                    onChange={(e) => handleInputChange('UsuarioSolicitante', e.target.value)}
                                    readOnly
                                />
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    Correo *
                                </Label>
                                <Input style={{ marginBottom: '2em' }}
                                    id="UsuarioSolicitante"
                                    value={user?.Correo || ''}
                                    onChange={(e) => handleInputChange('UsuarioSolicitante', e.target.value)}
                                    readOnly
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1em' }}>
                                    <div> {/* Prioridad */}
                                        <Label htmlFor="Prioridad" style={{ color: '#f7f4f3', marginBottom: '1em' }}>
                                            Prioridad *
                                        </Label>
                                        <div className="space-y-2">
                                            <Select
                                                value={formData.Prioridad?.toString()}
                                                onValueChange={(value) => handleInputChange('Prioridad', value)}
                                            >
                                                <SelectTrigger style={{ marginBottom: '2em' }}>
                                                    <SelectValue placeholder="Seleccione la prioridad del Ticket" />
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
                                    <div> {/* Etiqueta */}
                                        <Label htmlFor="Etiqueta" style={{ color: '#f7f4f3', marginBottom: '1em' }}>
                                            Etiqueta *
                                        </Label>
                                        <div className="space-y-2">
                                            <Select
                                                value={formData.Etiqueta?.toString()}
                                                onValueChange={(value) => {
                                                    handleInputChange('Etiqueta', value);
                                                    CambiarCategoria(value);
                                                }}
                                            >
                                                <SelectTrigger style={{ marginBottom: '0.5em' }}>
                                                    <SelectValue placeholder="Seleccione una Etiqueta" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {etiquetasDisponibles.map((etiqueta) => (
                                                        <SelectItem key={etiqueta.value} value={etiqueta.Id}>
                                                            {etiqueta.Nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div> {/* Categoria */}
                                        <Label htmlFor="Categoria" style={{ color: '#f7f4f3', marginBottom: '1em' }}>
                                            Categoria *
                                        </Label>
                                        <Input style={{ marginBottom: '2em' }}
                                            id="Categoria"
                                            value={formData.Categoria?.Nombre || ''}
                                            placeholder="Seleccione una Etiqueta"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    Fecha de Creación *
                                </Label>
                                <h1>{new Date().toLocaleDateString()}</h1>
                                <Label htmlFor="UsuarioSolicitante" style={{ color: '#f7f4f3' }}>
                                    Estado *
                                </Label>
                                <h1>Pendiente</h1>

                                {/* Imagen */}
                                <div className="mb-6">
                                    <Label htmlFor="image" className="block mb-1 text-sm font-medium">
                                        Imagen
                                    </Label>
                                    <div
                                        className="relative w-56 h-56 border-2 border-dashed border-muted/50 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
                                        onClick={() => document.getElementById("image").click()}
                                    >
                                        {!fileURL && (
                                            <div className="text-center px-4">
                                                <p className="text-sm text-muted-foreground">Haz clic o arrastra una imagen</p>
                                                <p className="text-xs text-muted-foreground">(jpg, png, máximo 5MB)</p>
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
                                    {saving ? 'Guardando...' : isCreateMode ? 'Crear Ticket' : 'Guardar Cambios'}
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
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
