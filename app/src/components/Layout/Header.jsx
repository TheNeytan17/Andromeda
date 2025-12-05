import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import sello from "@/assets/sello.png";
import name from "@/assets/name.png";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import "./sparkle-button.css";
import { useI18n } from "@/hooks/useI18n";
import NotificationPanel from "@/components/Home/NotificationPanel";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMaintOpen, setMobileMaintOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t, lang, changeLanguage } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Escuchar cambios en el storage (para actualizar cuando se inicia/cierra sesión en otra pestaña)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      setIsLoggedIn(!!newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleChangeLang = async (value) => {
    try {
      await changeLanguage(value);
    } catch (err) {
      console.error("Error changing language:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header
      className="w-full fixed top-0 left-0 z-50 
      bg-[#ff95b5]/25 backdrop-blur-lg shadow-lg border-b border-white/20"
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Logo + nombre con link al home */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <img src={sello} alt="Andrómeda Sello" className="h-16 md:h-16 w-auto" />
          <img src={name} alt="Andrómeda" className="h-10 md:h-10 w-auto" />
        </Link>

        {/* Navegación centrada */}
        <nav className="hidden md:flex items-center gap-10 text-white text-xs font-semibold tracking-wide">
          <Link
            to="/incidents"
            className="hover:text-[#ff95b5] transition-colors"
          >
            {t('nav.incidents')}
          </Link>
          <Link to="/admin" className="hover:text-[#ff95b5] transition-colors">
            {t('nav.admin')}
          </Link>
          <Link to="/support" className="hover:text-[#ff95b5] transition-colors">
            {t('nav.support')}
          </Link>

          {/* Dropdown Mantenimientos */}
          <Popover open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 hover:text-[#ff95b5] transition-colors">
                {t('nav.maintenances')} <ChevronDown className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-56 bg-[#2b2143]/95 text-white border-white/20 backdrop-blur-md rounded-xl"
            >
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/Technician" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>{t('maint.technicians')}</Link>
                <Link to="/TableCategory" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>{t('maint.categories')}</Link>
                <Link to="/Ticket" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>{t('maint.tickets')}</Link>
                <Link to="/Assignment" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>{t('maint.assignments')}</Link>
              </div>
            </PopoverContent>
          </Popover>
        </nav>

        {/* Selector de idioma, notificaciones y botón iniciar sesión */}
        <div className="hidden md:flex items-center gap-4">
          {/* Panel de notificaciones */}
          <NotificationPanel />
          
          {/* Selector de idioma (estilo como en TableAssign) */}
          <label htmlFor="lang-select" className="sr-only">{t('lang.label')}</label>
          <Select value={lang} onValueChange={handleChangeLang}>
            <SelectTrigger
              id="lang-select"
              aria-label="Selector de idioma"
              className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md focus-visible:ring-[#6f3c82]/50 focus-visible:border-[#6f3c82] selection:bg-[#6f3c82] selection:text-[#f7f4f3] w-[120px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3] focus-visible:ring-0 selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
              <SelectItem value="es" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">Español</SelectItem>
              <SelectItem value="en" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">English</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="sparkle-container">
            <div className="sparkle-layer-1">
              <div className="sparkle-layer-2">
                <div className="sparkle-layer-3">
                  <div className="sparkle-layer-4">
                    {isLoggedIn ? (
                      <button
                        onClick={handleLogout}
                        className="font-semibold text-xs px-5 py-1.5 rounded-full transition btn-sparkle flex items-center gap-2"
                        style={{
                          background: 'rgba(247, 244, 243, 0.15)',
                          backdropFilter: 'blur(12px)',
                          border: '2px solid rgba(247, 244, 243, 0.3)',
                          color: '#f7f4f3'
                        }}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('login.logout') || 'CERRAR SESIÓN'}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="font-semibold text-xs px-5 py-1.5 rounded-full transition btn-sparkle"
                        style={{
                          background: 'rgba(247, 244, 243, 0.15)',
                          backdropFilter: 'blur(12px)',
                          border: '2px solid rgba(247, 244, 243, 0.3)',
                          color: '#f7f4f3'
                        }}
                      >
                        {t('login.signin')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden text-white p-2">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="bg-[#2b2143]/95 text-white backdrop-blur-md">
            <nav className="mt-10 flex flex-col gap-6 text-sm font-medium">
              <Link to="/incidents" onClick={() => setMobileOpen(false)}>
                {t('nav.incidents')}
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                {t('nav.admin')}
              </Link>
              <Link to="/support" onClick={() => setMobileOpen(false)}>
                {t('nav.support')}
              </Link>

              {/* Mantenimientos (desplegable) */}
              <button
                type="button"
                className="flex items-center justify-between w-full text-left hover:text-[#ff95b5] transition-colors"
                onClick={() => setMobileMaintOpen((v) => !v)}
              >
                <span>{t('nav.maintenances')}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileMaintOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileMaintOpen && (
                <div className="ml-4 flex flex-col gap-4 text-sm">
                    <Link to="/Technician" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">{t('maint.technicians')}</Link>
                    <Link to="/TableCategory" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">{t('maint.categories')}</Link>
                    <Link to="/Ticket" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">{t('maint.tickets')}</Link>
                    <Link to="/Assignment" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">{t('maint.assignments')}</Link>
                </div>
              )}

              {/* Selector de idioma en menú móvil */}
              <div className="pt-2">
                <Select value={lang} onValueChange={(v) => { handleChangeLang(v); }}>
                  <SelectTrigger
                    id="lang-select-mobile"
                    aria-label="Selector de idioma"
                    className="rounded-full border-2 border-[#6f3c82] text-[#f7f4f3] px-3 py-1 bg-[rgba(111,60,130,0.15)] backdrop-blur-md focus-visible:ring-[#6f3c82]/50 focus-visible:border-[#6f3c82] selection:bg-[#6f3c82] selection:text-[#f7f4f3] w-[160px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[rgba(111,60,130,0.15)] backdrop-blur-md border-[#6f3c82] text-[#f7f4f3] focus-visible:ring-0 selection:bg-[#6f3c82] selection:text-[#f7f4f3]">
                    <SelectItem value="es" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">Español</SelectItem>
                    <SelectItem value="en" className="data-[highlighted]:bg-[#6f3c82] data-[highlighted]:text-[#f7f4f3] focus:bg-[#6f3c82] focus:text-[#f7f4f3]">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="rounded-full px-4 py-2 text-center font-semibold btn-sparkle flex items-center justify-center gap-2 w-full"
                  style={{
                    background: 'rgba(247, 244, 243, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid rgba(247, 244, 243, 0.3)',
                    color: '#f7f4f3'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {t('login.logout') || 'CERRAR SESIÓN'}
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full px-4 py-2 text-center font-semibold btn-sparkle"
                  style={{
                    background: 'rgba(247, 244, 243, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid rgba(247, 244, 243, 0.3)',
                    color: '#f7f4f3'
                  }}
                >
                  {t('login.signin')}
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
