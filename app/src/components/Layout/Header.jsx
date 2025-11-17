import { Link } from "react-router-dom";
import { useState } from "react";
import sello from "@/assets/sello.png";
import name from "@/assets/name.png";
import { Menu, X, ChevronDown } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import "./sparkle-button.css";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMaintOpen, setMobileMaintOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

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
            GESTIÓN DE INCIDENTES
          </Link>
          <Link to="/admin" className="hover:text-[#ff95b5] transition-colors">
            ADMINISTRACIÓN
          </Link>
          <Link to="/support" className="hover:text-[#ff95b5] transition-colors">
            SOPORTE
          </Link>

          {/* Dropdown Mantenimientos */}
          <Popover open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 hover:text-[#ff95b5] transition-colors">
                MANTENIMIENTOS <ChevronDown className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-56 bg-[#2b2143]/95 text-white border-white/20 backdrop-blur-md rounded-xl"
            >
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/Technician" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>Técnicos</Link>
                <Link to="/TableCategory" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>Categorías</Link>
                <Link to="/Ticket" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>Tickets</Link>
                <Link to="/Assignment" className="hover:text-[#ff95b5] transition-colors" onClick={() => setMaintenanceOpen(false)}>Asignaciones</Link>
              </div>
            </PopoverContent>
          </Popover>
        </nav>

        {/* Botón iniciar sesión */}
        <div className="hidden md:flex items-center gap-4">
          <div className="sparkle-container">
            <div className="sparkle-layer-1">
              <div className="sparkle-layer-2">
                <div className="sparkle-layer-3">
                  <div className="sparkle-layer-4">
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
                      INICIAR SESIÓN
                    </Link>
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
                GESTIÓN DE INCIDENTES
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                ADMINISTRACIÓN
              </Link>
              <Link to="/support" onClick={() => setMobileOpen(false)}>
                SOPORTE
              </Link>

              {/* Mantenimientos (desplegable) */}
              <button
                type="button"
                className="flex items-center justify-between w-full text-left hover:text-[#ff95b5] transition-colors"
                onClick={() => setMobileMaintOpen((v) => !v)}
              >
                <span>MANTENIMIENTOS</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileMaintOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileMaintOpen && (
                <div className="ml-4 flex flex-col gap-4 text-sm">
                  <Link to="/Technician" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">Técnicos</Link>
                  <Link to="/TableCategory" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">Categorías</Link>
                  <Link to="/Ticket" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">Tickets</Link>
                  <Link to="/Assignment" onClick={() => setMobileOpen(false)} className="hover:text-[#ff95b5]">Asignaciones</Link>
                </div>
              )}

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
                INICIAR SESIÓN
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
