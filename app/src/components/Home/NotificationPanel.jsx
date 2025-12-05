import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, Ticket, RefreshCw, MessageCircle, LogIn } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import NotificationService from "../../services/NotificationService";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const intervalRef = useRef(null);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [isOpen]);

  const loadAllNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getAllNotifications();
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setNotifications(data);

      const unread = data.filter((n) => n.Estado === 0 || n.Estado === "0");
      setUnreadCount(unread.length);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUnreadCount(0);
        return;
      }
      const response = await NotificationService.getUnreadCount();
      const count = response.data.data?.count || response.data.count || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error al actualizar contador:", error);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    console.log("Marcando notificación como leída:", id);
    try {
      const response = await NotificationService.markAsRead(id);
      console.log("Respuesta completa del servidor:", response);
      console.log("Response.data:", response.data);
      console.log("Notificaciones antes:", notifications.length);
      
      // Eliminar la notificación del panel (solo mostrar no leídas)
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.Id !== id);
        console.log("Notificaciones después:", filtered.length);
        return filtered;
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("La notificación se marcó como leída");
    } catch (error) {
      console.error("Error al marcar como leída:", error);
      toast.error("Error al marcar la notificación como leída");
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      // Limpiar todas las notificaciones del panel
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const getNotificationIcon = (tipo) => {
    const iconClass = "w-4 h-4";
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
          header: "bg-gray-300 text-black",
          body: "bg-[#faf7f5]",
        };
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    updateCount();
    intervalRef.current = setInterval(updateCount, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* ANIMACIÓN GLOW PARA NO LEÍDAS */}
      <style>{`
        @keyframes softGlow {
          0% { box-shadow: 0 0 0px rgba(0,0,0,0); }
          50% { box-shadow: 0 0 12px rgba(0, 0, 0, 0.25); }
          100% { box-shadow: 0 0 0px rgba(0,0,0,0); }
        }

        .glow-unread {
          animation: softGlow 2s ease-in-out infinite;
        }
      `}</style>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-[600px] border-2 border-white/30 shadow-2xl backdrop-blur-2xl rounded-2xl"
          sideOffset={5}
          align="end"
          style={{
            background: 'linear-gradient(135deg, rgba(130, 60, 97, 0.6) 0%, rgba(100, 65, 150, 0.6) 50%, rgba(130, 149, 184, 0.6) 100%)',
            overflow: 'hidden',
            padding: 0
          }}
        >
          {!isLoggedIn ? (
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <LogIn className="h-12 w-12 text-white/60" />
                  <div>
                    <p className="text-white font-semibold mb-2">Debes iniciar sesión para ver tus notificaciones</p>
                    <p className="text-white/70 text-sm">Por favor inicia sesión para acceder a tu panel de notificaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-none bg-transparent -my-1">
            <CardHeader className="border-b border-white/30 px-4 py-1 rounded-t-2xl -mt-5" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <CardTitle className="text-base text-white">Notificaciones</CardTitle>
                  <CardDescription className="text-sm text-white/90">
                    {unreadCount > 0
                      ? `Tienes ${unreadCount} notificación${
                          unreadCount > 1 ? "es" : ""
                        } sin leer`
                      : "No tienes notificaciones sin leer"}
                  </CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-white hover:bg-white/20"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[280px] overflow-y-auto px-1 py-1">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Cargando notificaciones...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {notifications
                      .filter((n) => n.Estado === 0 || n.Estado === "0")
                      .sort(
                        (a, b) =>
                          new Date(b.Fecha_Envio) - new Date(a.Fecha_Envio)
                      )
                      .map((notification) => {
                        const colors = getNotificationColors(
                          notification.Tipo_Notificacion
                        );

                        const isUnread =
                          notification.Estado === 0 ||
                          notification.Estado === "0";

                        return (
                          <div key={notification.Id} className="px-2 pt-5 pb-2 first:pt-5 last:pb-8">
                            <div className="relative rounded-xl border-[2px] border-black overflow-visible bg-white shadow-[4px_4px_0px_#000]">
                              {/* CHIP DE FECHA */}
                              <div className="absolute -top-3 left-6 bg-white border-[2px] border-black px-3 py-0.5 text-[10px] font-bold rounded-full z-10 text-black">
                                {formatDistanceToNow(
                                  new Date(notification.Fecha_Envio),
                                  {
                                    addSuffix: true,
                                    locale: es,
                                  }
                                )}
                              </div>

                              {/* HEADER DE COLOR */}
                              <div className={`${colors.header} px-4 py-2 mx-2 mt-4 rounded-lg flex justify-center items-center relative`}>
                                <span className="font-black text-xs tracking-wide uppercase">
                                  {notification.Tipo}
                                </span>

                                <div className="absolute left-4 flex items-center gap-2">
                                  <div className="p-1.5 rounded-full bg-white shadow-sm">
                                    <div style={{color: '#fc52af'}}>
                                      {getNotificationIcon(notification.Tipo_Notificacion)}
                                    </div>
                                  </div>
                                </div>

                                <div className="absolute right-4 flex items-center gap-2">
                                  {isUnread && (
                                    <button
                                      className="p-0.5 hover:scale-125 transition-all duration-200 cursor-pointer hover:opacity-80"
                                      onClick={() => markAsRead(notification.Id)}
                                      title="Marcar como leída"
                                    >
                                      <CheckCheck className="w-5 h-5 text-white" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* CUERPO DEL MENSAJE */}
                              <div className="px-4 py-3 bg-white mx-2 mb-2 rounded-lg">
                                <p className="text-xs text-gray-900 font-medium leading-relaxed">
                                  {notification.Mensaje}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-white/30 rounded-b-2xl -mb-5" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <Button
                    variant="link"
                    className="text-sm w-full py-4 text-white hover:text-white/80"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = "/notifications";
                    }}
                  >
                    Ver todas las notificaciones
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
            )}
        </PopoverContent>
      </Popover>
    </>
  );
};

export default NotificationPanel;
