import React, { useState, useEffect } from 'react';
import FloatingAndromy from '@/assets/FloatingAndromy.png';
import AIChat from './AIChat';

const FloatingAIChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar autenticación
    useEffect(() => {
        const checkAuth = () => {
            try {
                const userData = localStorage.getItem('user');
                setIsAuthenticated(userData && userData !== 'null' && userData !== 'undefined');
            } catch {
                setIsAuthenticated(false);
            }
        };

        checkAuth();

        // Escuchar cambios en el localStorage
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Si no está autenticado, no mostrar nada
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 bg-gradient-to-r from-[#FC52AF] to-[#FBB25F] p-1 animate-bounce hover:animate-none"
                    aria-label="Abrir chat con IA"
                >
                    <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                        <img 
                            src={FloatingAndromy} 
                            alt="Andromy" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>
            )}

            {/* Chat de pantalla completa */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-[#1a0d21]">
                    <AIChat onClose={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
};

export default FloatingAIChatButton;
