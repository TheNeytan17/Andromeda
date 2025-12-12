import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Filter, Calendar, User, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ValoracionService from '../../services/ValoracionService';
import TechnicianService from '../../services/TechnicianService';
import { LoadingGrid } from '../ui/custom/LoadingGrid';

/**
 * Componente para visualizar todas las valoraciones del sistema
 * Solo accesible para administradores
 */
export default function TableReview() {
    const navigate = useNavigate();
    const [valoraciones, setValoraciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTech, setSelectedTech] = useState('all');

    useEffect(() => {
        // Verificar sesión
        const userSession = localStorage.getItem('user');
        if (!userSession) {
            toast.error('Sesión no iniciada');
            navigate('/login');
            return;
        }

        let parsedUser;
        try {
            parsedUser = JSON.parse(userSession);
        } catch (e) {
            console.error('Error al parsear usuario:', e);
            navigate('/login');
            return;
        }

        const role = parseInt(parsedUser.Rol) || parsedUser.Rol;
        const userId = parsedUser.Id || parsedUser.id;

        // Cargar datos según el rol
        const fetchData = async () => {
            try {
                let valData = [];
                
                if (role === 1 || role === '1') {
                    // ADMIN: Ver todas las valoraciones
                    const techRes = await TechnicianService.getTechnicians();
                    const techData = techRes?.data?.data || [];
                    setTechnicians(Array.isArray(techData) ? techData : []);

                    const valRes = await ValoracionService.getAllValoraciones();
                    valData = valRes?.data?.data || [];
                    
                } else if (role === 2 || role === '2') {
                    // TÉCNICO: Ver solo valoraciones de sus tickets
                    const valRes = await ValoracionService.getAllValoraciones({ Id_Tecnico: userId });
                    valData = valRes?.data?.data || [];
                    
                } else if (role === 3 || role === '3') {
                    // CLIENTE: Ver solo sus propias valoraciones
                    const valRes = await ValoracionService.getAllValoraciones();
                    const allValData = valRes?.data?.data || [];
                    valData = allValData.filter(v => String(v.Id_Usuario) === String(userId));
                }

                setValoraciones(Array.isArray(valData) ? valData : []);
                toast.success('Valoraciones cargadas correctamente');
            } catch (error) {
                console.error('Error al cargar valoraciones:', error);
                toast.error('Error al cargar datos');
                setValoraciones([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Filtrar valoraciones por técnico
    const filteredValoraciones = selectedTech === 'all'
        ? valoraciones
        : valoraciones.filter(v => String(v.Id_Tecnico) === selectedTech);

    // Calcular estadísticas
    const stats = {
        total: filteredValoraciones.length,
        promedio: filteredValoraciones.length > 0
            ? (filteredValoraciones.reduce((sum, v) => sum + (Number(v.Puntaje) || 0), 0) / filteredValoraciones.length).toFixed(2)
            : 0,
        excelentes: filteredValoraciones.filter(v => Number(v.Puntaje) >= 4).length,
        regulares: filteredValoraciones.filter(v => Number(v.Puntaje) === 3).length,
        malas: filteredValoraciones.filter(v => Number(v.Puntaje) < 3).length
    };

    if (loading) {
        return <LoadingGrid message="Cargando valoraciones..." />;
    }

    return (
        <div className="container mx-auto py-8 px-4 text-white">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="light"
            />

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Valoraciones de Servicio</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                        {(() => {
                            const userSession = JSON.parse(localStorage.getItem('user') || '{}');
                            const role = parseInt(userSession.Rol);
                            if (role === 1) return 'Administración de todas las calificaciones del sistema';
                            if (role === 2) return 'Calificaciones de los tickets que has atendido';
                            if (role === 3) return 'Tus valoraciones de servicio';
                            return 'Calificaciones y comentarios de tickets cerrados';
                        })()}
                    </p>
                </div>
                <Badge className="bg-purple-500/20 border-purple-400/50 text-purple-300">
                    {(() => {
                        const userSession = JSON.parse(localStorage.getItem('user') || '{}');
                        const role = parseInt(userSession.Rol);
                        if (role === 1) return 'Administrador';
                        if (role === 2) return 'Técnico';
                        if (role === 3) return 'Cliente';
                        return 'Usuario';
                    })()}
                </Badge>
            </div>

            {/* Filtros y Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Filtro por técnico - Solo para Admin */}
                {(() => {
                    const userSession = JSON.parse(localStorage.getItem('user') || '{}');
                    const role = parseInt(userSession.Rol);
                    return role === 1 && (
                        <Card className="bg-zinc-900/50 border-purple-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Filter className="w-5 h-5 text-purple-400" />
                                    <div className="flex-1">
                                        <label className="text-sm text-zinc-300 mb-2 block">Filtrar por técnico:</label>
                                        <Select value={selectedTech} onValueChange={setSelectedTech}>
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectItem value="all">Todos los técnicos</SelectItem>
                                                {technicians.map(tech => (
                                                    <SelectItem key={tech.Id} value={String(tech.Id)}>
                                                        {tech.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Estadísticas */}
                <Card className="bg-zinc-900/50 border-purple-500/30">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div>
                                <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
                                <div className="text-xs text-zinc-400">Total</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-400">{stats.promedio}</div>
                                <div className="text-xs text-zinc-400">Promedio</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-400">{stats.excelentes}</div>
                                <div className="text-xs text-zinc-400">≥4 ⭐</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-400">{stats.malas}</div>
                                <div className="text-xs text-zinc-400">&lt;3 ⭐</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Valoraciones */}
            {filteredValoraciones.length === 0 ? (
                <Card className="bg-zinc-900/50 border-purple-500/30">
                    <CardContent className="p-8 text-center">
                        <Star className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">No hay valoraciones disponibles</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredValoraciones.map((val) => (
                        <Card key={val.Id} className="bg-zinc-900/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Información principal */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {val.TituloTicket || `Ticket #${val.Id_Ticket}`}
                                                </h3>
                                                <p className="text-xs text-zinc-500">Ticket #{val.Id_Ticket}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{val.NombreUsuario || 'Usuario desconocido'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(val.Fecha_Valoracion).toLocaleDateString('es-ES')}</span>
                                            </div>
                                            {val.NombreTecnico && (
                                                <Badge className="bg-blue-500/20 border-blue-400/50 text-blue-300">
                                                    Técnico: {val.NombreTecnico}
                                                </Badge>
                                            )}
                                        </div>

                                        {val.Comentario && (
                                            <div className="pl-7">
                                                <p className="text-sm text-zinc-300 italic">"{val.Comentario}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Puntaje */}
                                    <div className="flex flex-col items-center gap-2">
                                        <Badge
                                            className="text-lg font-bold px-4 py-2"
                                            style={{
                                                backgroundColor: Number(val.Puntaje) >= 4 ? '#22c55e' : Number(val.Puntaje) >= 3 ? '#eab308' : '#ef4444',
                                                color: 'white'
                                            }}
                                        >
                                            {val.Puntaje} / 5
                                        </Badge>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${
                                                        star <= Number(val.Puntaje)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'fill-zinc-700 text-zinc-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Botón volver */}
            <Button
                onClick={() => navigate(-1)}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
                Volver
            </Button>
        </div>
    );
}
