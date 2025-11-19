import React from "react";
import logo from "@/assets/logo.png";
import { Facebook, Instagram, Mail } from "lucide-react";
import "./sparkle-button.css";
import { useI18n } from "@/hooks/useI18n";
import { Link } from "react-router-dom";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full relative text-white py-8">
      {/* Degradado superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FC52AF] to-[#FBB25F]"></div>
      
      {/* Fondo con degradado vertical */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#241b38] from-15% to-[#6f3c82]/50 -z-10"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center justify-items-center px-10 gap-8">
        {/* IZQUIERDA */}
        <div className="flex flex-col items-center justify-center text-left">
          <p className="font-shrikhand text-1xl md:text-2xl font-normal mb-4 leading-tight"
            style={{ fontFamily: "Shrikhand" }}
            dangerouslySetInnerHTML={{ __html: t('footer.tagline') }}
          />
        </div>

        {/* CENTRO */}
        <div className="flex items-center gap-8 justify-center">
          <div className="h-32 w-[2px] bg-gradient-to-b from-pink-500 via-purple-500 to-orange-400 rounded-full"></div>

          <div className="flex flex-col items-start">
            <img src={logo} alt="Andrómeda" className="w-55 mb-2" />
          </div>

          <div className="h-32 w-[2px] bg-gradient-to-b from-pink-500 via-purple-500 to-orange-400 rounded-full"></div>
        </div>

        {/* DERECHA */}
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="font-bold text-lg tracking-widest">{t('footer.contact')}</p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-5 h-5 hover:text-pink-400 cursor-pointer transition-colors" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 hover:text-pink-400 cursor-pointer transition-colors" />
            </a>
            <a href="mailto:contacto@andromeda.com">
              <Mail className="w-5 h-5 hover:text-pink-400 cursor-pointer transition-colors" />
            </a>
          </div>
          <div className="sparkle-container mt-3">
            <div className="sparkle-layer-1">
              <div className="sparkle-layer-2">
                <div className="sparkle-layer-3">
                  <div className="sparkle-layer-4">
                    <Link
                      to="/login"
                      className="px-5 py-2 rounded-full font-semibold text-xs transition btn-sparkle"
                      style={{
                        background: 'rgba(247, 244, 243, 0.15)',
                        backdropFilter: 'blur(12px)',
                        border: '2px solid rgba(247, 244, 243, 0.3)',
                        color: '#f7f4f3'
                      }}
                    >
                      {t('login.signin')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10 mt-8 pt-4 text-center text-xs text-white/70">
        {new Date().getFullYear()} © Andrómeda by - Naomy Díaz y Neytan Morales - {t('footer.rights')}
      </div>
    </footer>
  );
}
