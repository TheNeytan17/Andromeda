import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Filter, Search, RefreshCw, Ticket, MessageCircle, LogIn, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import MagicBento from './MagicBento';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import NotificationService from '../../services/NotificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = más reciente primero, 'asc' = más antigua primero
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getAllNotifications();
      console.log('Response completo:', response);
      // El backend devuelve {success: true, data: [...]}
      const data = Array.isArray(response.data.data) ? response.data.data : 
                   Array.isArray(response.data) ? response.data : [];
      console.log('Notificaciones cargadas:', data);
      console.log('Estados de notificaciones:', data.map(n => ({ id: n.Id, estado: n.Estado, tipo: typeof n.Estado })));
      setNotifications(data);
      setFilteredNotifications(data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...notifications];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.Mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.Tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.Tipo_Notificacion.toString() === filterType);
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      const status = filterStatus === 'read' ? 1 : 0;
      filtered = filtered.filter((n) => {
        const notifEstado = typeof n.Estado === 'string' ? parseInt(n.Estado) : n.Estado;
        return notifEstado === status;
      });
    }

    // Ordenar por fecha
    filtered.sort((a, b) => {
      const dateA = new Date(a.Fecha_Envio);
      const dateB = new Date(b.Fecha_Envio);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotifications(filtered);
  }, [searchTerm, filterType, filterStatus, sortOrder, notifications]);

  // Marcar como leída
  const markAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.Id === id ? { ...n, Estado: 1 } : n))
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, Estado: 1 })));
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  // Obtener icono según tipo
  const getNotificationIcon = (tipo) => {
    const iconClass = "w-5 h-5";
    const tipoNum = typeof tipo === 'string' ? parseInt(tipo) : tipo;
    
    switch (tipoNum) {
      case 1:
        return <Ticket className={iconClass} />;
      case 2:
        return <RefreshCw className={iconClass} />;
      case 3:
        return <MessageCircle className={iconClass} />;
      case 4:
        return <LogIn className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Obtener colores según tipo
  const getNotificationColors = (tipo) => {
    const tipoNum = typeof tipo === "string" ? parseInt(tipo) : tipo;

    switch (tipoNum) {
      case 1:
        return {
          header: "bg-[#ff95b5] text-black",
          body: "bg-[#faf7f5]",
        };

      case 2:
        return {
          header: "bg-[#ff8f57] text-black",
          body: "bg-[#faf7f5]",
        };

      case 3:
        return {
          header: "bg-[#fbb25f] text-black",
          body: "bg-[#faf7f5]",
        };

      case 4:
        return {
          header: "bg-[#a9c0eb] text-black",
          body: "bg-[#faf7f5]",
        };

      default:
        return {
          header: "bg-gray-400 text-black",
          body: "bg-[#faf7f5]",
        };
    }
  };

  // Cargar al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter((n) => n.Estado === 0 || n.Estado === '0').length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Historial de Notificaciones
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona todas tus notificaciones en un solo lugar
        </p>
      </div>

      {/* Mostrar mensaje si no está autenticado */}
      {!isLoggedIn && (
        <Card className="mb-6 border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <LogIn className="h-12 w-12 text-orange-500" />
              <div>
                <p className="text-orange-900 font-semibold text-lg mb-2">Debes iniciar sesión para ver tus notificaciones</p>
                <p className="text-orange-800 text-sm">Por favor inicia sesión para acceder a tu historial de notificaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas en MagicBento - Solo mostrar si está autenticado */}
      {isLoggedIn && (
      <div className="mb-6">
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="132, 0, 255"
          isStats={true}
          customCards={[
            {
              color: '#060010',
              title: notifications.length.toString(),
              description: '',
              label: 'Total'
            },
            {
              color: '#060010',
              title: unreadCount.toString(),
              description: '',
              label: 'Sin Leer'
            },
            {
              color: '#060010',
              title: (notifications.length - unreadCount).toString(),
              description: '',
              label: 'Leídas'
            },
            {
              color: '#060010',
              title: (
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="1">Asignación</SelectItem>
                    <SelectItem value="2">Cambio de estado</SelectItem>
                    <SelectItem value="3">Nueva observación</SelectItem>
                    <SelectItem value="4">Inicio de sesión</SelectItem>
                  </SelectContent>
                </Select>
              ),
              description: '',
              label: 'Tipo'
            }
          ]}
        />
      </div>
      )}

      {/* Filtros - 3 Tarjetas MagicBento - Solo mostrar si está autenticado */}
      {isLoggedIn && (
      <div className="mb-6">
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="132, 0, 255"
          isStats={true}
          customCards={[
            {
              color: '#060010',
              title: (
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-gray-800 text-white rounded px-2 py-1 text-sm"
                  />
                </div>
              ),
              description: '',
              label: 'Buscar'
            },
            {
              color: '#060010',
              title: (
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">Sin leer</SelectItem>
                    <SelectItem value="read">Leídas</SelectItem>
                  </SelectContent>
                </Select>
              ),
              description: '',
              label: 'Estado'
            },
            {
              color: '#060010',
              title: (
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Más reciente primero</SelectItem>
                    <SelectItem value="asc">Más antigua primero</SelectItem>
                  </SelectContent>
                </Select>
              ),
              description: '',
              label: 'Ordenar'
            },
            {
              color: '#060010',
              title: (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadNotifications} title="Actualizar" size="sm" className="flex-1">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} size="sm" className="flex-1">
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Marcar
                    </Button>
                  )}
                </div>
              ),
              description: '',
              label: 'Acciones'
            }
          ]}
        />
      </div>
      )}

      {/* Lista de Notificaciones - Solo mostrar si está autenticado */}
      {isLoggedIn && (loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Cargando notificaciones...</p>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-gray-500 text-lg">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'No se encontraron notificaciones con los filtros aplicados'
                : 'No tienes notificaciones'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredNotifications.map((notification) => {
            const colors = getNotificationColors(notification.Tipo_Notificacion);
            const isUnread = notification.Estado === 0 || notification.Estado === '0';
            
            return (
              <div key={notification.Id} className="relative">
                <div className="relative rounded-xl border-[2px] border-[#6f3c82] overflow-visible bg-[#1a0d21] shadow-[4px_4px_0px_rgba(111,60,130,0.3)]">
                  {/* HEADER DE COLOR */}
                  <div className={`${colors.header} px-4 py-3 mx-2 mt-2 rounded-lg flex justify-center items-center relative`}>
                    <span className="font-black text-base tracking-wide uppercase">
                      {notification.Tipo}
                    </span>

                    <div className="absolute left-4 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-[#2a1533] shadow-sm">
                        <div style={{color: '#fc52af'}}>
                          {getNotificationIcon(notification.Tipo_Notificacion)}
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-4 flex items-center gap-2">
                      {isUnread && (
                        <span className="bg-[#fc52af] text-[9px] px-2 py-0.5 rounded-full text-white font-bold shadow-sm">
                          NUEVO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CUERPO DEL MENSAJE */}
                  <div className="px-4 py-3 bg-[#2a1533] mx-2 mb-2 rounded-lg">
                    <p className="text-sm text-[#f7f4f3] font-medium leading-relaxed mb-3">
                      {notification.Mensaje}
                    </p>
                    
                    {/* Fecha completa y acciones */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#6f3c82]/30">
                      <div className="text-xs text-[#f7f4f3]/60">
                        {format(
                          new Date(notification.Fecha_Envio),
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex gap-2">
                        {isUnread && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.Id)}
                            title="Marcar como leída"
                            className="h-7 px-2 border-[#6f3c82] hover:bg-[#6f3c82]/20 hover:border-[#6f3c82]"
                          >
                            <Check className="h-3 w-3 text-[#fc52af]" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default NotificationHistory;
