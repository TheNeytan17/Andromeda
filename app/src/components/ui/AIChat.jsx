import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, User, Sparkles } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import mascot from '@/assets/mascot.png';
import starRain from '@/assets/starRain.png';
import spark from '@/assets/spark.png';
import moon from '@/assets/moon.png';
import upCorner from '@/assets/upCorner.png';
import cloud1 from '@/assets/Cloud1.png';
import cloud2 from '@/assets/Cloud2.png';
import cloud3 from '@/assets/Cloud3.png';

import IAService from '@/services/IAService';

const AIChat = ({ onClose }) => {
    // Estados - DEBEN estar antes de cualquier return condicional
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: '¡Hola! 👋 Soy Andromy, tu asistente virtual de Andromeda. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPrompts, setShowPrompts] = useState(false);

    // Prompts sugeridos con selects de tablas
    const suggestedPrompts = [
        { id: 1, text: 'Dame una lista de todos los técnicos', table: 'tecnicos' },
        { id: 2, text: 'Muéstrame todos los tickets pendientes', table: 'tickets' },
        { id: 3, text: 'Lista de todas las categorías', table: 'categorias' },
        { id: 4, text: 'Muéstrame los usuarios registrados', table: 'usuarios' },
        { id: 5, text: 'Lista de estados de tickets', table: 'estados' },
        { id: 6, text: 'Muéstrame las prioridades disponibles', table: 'prioridades' },
    ];
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const promptsMenuRef = useRef(null);

    // Funciones de utilidad
    const isAuthenticated = () => {
        try {
            const userData = localStorage.getItem('user');
            return userData && userData !== 'null' && userData !== 'undefined';
        } catch {
            return false;
        }
    };

    const getUserName = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            return userData?.nombre || 'Usuario';
        } catch {
            return 'Usuario';
        }
    };

    // Auto-scroll al final cuando hay nuevos mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cerrar menú de prompts al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (promptsMenuRef.current && !promptsMenuRef.current.contains(event.target)) {
                setShowPrompts(false);
            }
        };

        if (showPrompts) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPrompts]);

    // Focus en el input cuando se monta el componente
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Verificar autenticación y cerrar si no está autenticado
    useEffect(() => {
        if (!isAuthenticated()) {
            onClose();
        }
    }, [onClose]);

    // Si no está autenticado, no renderizar nada
    if (!isAuthenticated()) {
        return null;
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Preparar el historial de conversación (últimos 10 mensajes para contexto)
            const conversationHistory = messages.slice(-10).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: typeof msg.text === 'string' ? msg.text.replace(/<[^>]*>/g, '') : msg.text
            }));

            const response = await IAService.getResponse(inputMessage, conversationHistory);

            // Extraer el texto limpio (navegar por la estructura anidada)
            let botText = 'Lo siento, no pude generar una respuesta.';

            // La estructura es: response.data.data.data
            if (response.data?.data?.data && typeof response.data.data.data === 'string') {
                botText = response.data.data.data;
            } else if (response.data?.data && typeof response.data.data === 'string') {
                botText = response.data.data;
            } else if (typeof response.data === 'string') {
                botText = response.data;
            } else if (response.data?.message) {
                botText = response.data.message;
            }

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: botText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-screen flex flex-col relative overflow-hidden">
            {/* Gradient background */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background: "#FF95B5",
                    backgroundImage:
                        "linear-gradient(315deg, rgba(255, 149, 181, 1) 0%, rgba(36, 27, 56, 1) 100%)",
                }}
            ></div>

            {/* Estrellitas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-twinkle"
                        style={{
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${Math.random() * 2 + 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Header en la parte superior */}
            <div className="relative z-10 bg-[#ff95b5]/25 backdrop-blur-lg shadow-lg border-b border-white/20 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                        <img src={mascot} alt="Andromy" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Asistente IA de Andromeda</h3>
                        <p className="text-sm text-white/90">En línea • Aquí para ayudarte</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        aria-label="Cerrar chat"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Contenedor del chat */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="w-full max-w-5xl h-[calc(100vh-120px)] bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col relative z-10 overflow-hidden">

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 bg-transparent rounded-t-3xl scrollbar-hide">
                <div className="max-w-5xl mx-auto w-full">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${message.type === 'bot'
                                        ? 'bg-gradient-to-r from-[#FC52AF] to-[#FBB25F]'
                                        : 'bg-[#6f3c82]'
                                    }`}
                            >
                                {message.type === 'bot' ? (
                                    <img src={mascot} alt="Andromy" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
                            </div>

                            {/* Chat container con nuevo diseño */}
                            <div className={`${message.type === 'bot' && typeof message.text === 'string' && message.text.includes('<table') ? 'w-full' : 'max-w-[70%]'} ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="flex flex-col items-center relative py-10">
                                    {/* Header */}
                                    <div className="relative mb-[-5px] z-20">
                                        <div className="bg-white px-12 py-3 rounded-full text-xl font-bold text-[#1c1c1c] text-center shadow-lg italic">
                                            {message.type === 'bot' ? 'Andromy' : getUserName()}
                                        </div>
                                    </div>

                                    {/* Chat Box */}
                                    <div 
                                        className={`w-full border-4 border-white rounded-[30px] mt-3 ${
                                            message.type === 'bot'
                                                ? 'bg-gradient-to-b from-[#2e2e58] to-[#1a1a33]'
                                                : 'bg-gradient-to-b from-[#ff6ba8] to-[#ffb88c]'
                                        } relative overflow-visible`}
                                    >
                                        {/* Decoración superior izquierda - upCorner con fondo y círculos */}
                                        <div className="absolute -left-4 -top-5 w-16 h-16">
                                            {/* upCorner de fondo con 50% opacidad - más grande */}
                                            <img src={upCorner} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 opacity-50" />
                                            
                                            {/* upCorner principal */}
                                            <img src={upCorner} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-100 z-10" />
                                            
                                            {/* Círculos como en la imagen - uno arriba a la derecha, dos a la derecha */}
                                            <div className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-white z-20"></div>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white z-20"></div>
                                            <div className="absolute right-1 bottom-2 w-1.5 h-1.5 rounded-full bg-white z-20"></div>
                                        </div>
                                        
                                        {/* Decoración lateral izquierda - Spark */}
                                        <img src={spark} alt="" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 opacity-90 object-contain" />
                                        
                                        {/* Decoración lateral derecha - Spark */}
                                        <img src={spark} alt="" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-20 h-20 opacity-90 object-contain" />
                                        
                                        {/* Decoración inferior izquierda - Moon */}
                                        <img src={moon} alt="" className="absolute left-8 bottom-0 w-16 h-16 opacity-50" />
                                        
                                        {/* Decoración inferior derecha - StarRain */}
                                        <img src={starRain} alt="" className="absolute right-6 bottom-2 w-14 h-14 opacity-40" />
                                        
                                        {/* Círculos colgantes superiores - todos a la derecha */}
                                        <div className="absolute top-0 right-[30%] flex flex-col items-center">
                                            <div className="w-0.5 h-8 bg-white/70"></div>
                                            <div className="w-2 h-2 rounded-full bg-white shadow-md"></div>
                                        </div>
                                        <div className="absolute top-0 right-[20%] flex flex-col items-center">
                                            <div className="w-0.5 h-6 bg-white/70"></div>
                                            <div className="w-2 h-2 rounded-full bg-white shadow-md"></div>
                                        </div>
                                        <div className="absolute top-0 right-[10%] flex flex-col items-center">
                                            <div className="w-0.5 h-10 bg-white/70"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md"></div>
                                        </div>

                                        {/* Contenido del chat */}
                                        <div className="px-10 pt-16 pb-10 text-white text-xl relative z-10">
                                            {message.type === 'bot' && typeof message.text === 'string' && message.text.includes('<table') ? (
                                                <div
                                                    className={`leading-relaxed ai-table-container ${message.type === 'bot' ? 'text-white' : 'text-[#1c1c1c]'}`}
                                                    dangerouslySetInnerHTML={{ __html: message.text }}
                                                />
                                            ) : (
                                                <p className={`leading-relaxed whitespace-pre-wrap font-medium ${
                                                    message.type === 'bot' ? 'text-white' : 'text-[#2a1533]'
                                                }`}>
                                                    {typeof message.text === 'string' ? message.text : 'Error al cargar el mensaje'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Barra inferior */}
                                    <div className="mt-5 w-full h-5 border-b-4 border-white rounded-b-[20px] relative">
                                        {/* Círculo inferior izquierdo */}
                                        <div className="w-3 h-3 rounded-full bg-white border-2 border-[#2a1533] absolute left-[25%] bottom-0 transform translate-y-1/2"></div>
                                        
                                        {/* Rombo central */}
                                        <div className="w-[18px] h-[18px] border-4 border-white bg-[#2a1533] rounded-[4px] absolute left-1/2 bottom-[-10px] transform -translate-x-1/2 rotate-45"></div>
                                        
                                        {/* Círculo inferior derecho */}
                                        <div className="w-3 h-3 rounded-full bg-white border-2 border-[#2a1533] absolute right-[25%] bottom-0 transform translate-y-1/2"></div>
                                    </div>

                                    <span className="text-xs text-[#f7f4f3]/50 mt-3 px-2 block">
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Indicador de escritura */}
                {isLoading && (
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FC52AF] to-[#FBB25F] flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src={mascot} alt="Andromy" className="w-full h-full object-cover" />
                            </div>
                            <div className="bg-gradient-to-b from-[#2e2e58] to-[#1a1a33] px-6 py-3 rounded-full shadow-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">Andromy está pensando</span>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-[#1a0d21]/50 backdrop-blur-sm border-t border-[#6f3c82]/30 relative z-40">
                <div className="max-w-5xl mx-auto w-full relative">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu mensaje..."
                            disabled={isLoading}
                            className="flex-1 bg-[#2a1533] text-[#f7f4f3] placeholder:text-[#f7f4f3]/50 border border-[#6f3c82]/50 rounded-xl px-5 py-2 text-base focus:outline-none focus:border-[#FC52AF] transition-colors disabled:opacity-50"
                        />
                        
                        {/* Botón de Prompts Sugeridos */}
                        <div className="relative z-50" ref={promptsMenuRef}>
                            <button
                                onClick={() => setShowPrompts(!showPrompts)}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 disabled:opacity-50 rounded-xl px-4 py-3 border-2 border-purple-500/50"
                                title="Prompts Sugeridos"
                            >
                                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                            </button>
                            
                            {/* Menú desplegable de prompts */}
                            {showPrompts && (
                                <div className="absolute bottom-full right-0 mb-2 w-80 bg-[#2a1533] border border-[#6f3c82] rounded-xl shadow-2xl overflow-hidden z-[100]">
                                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-3 border-b border-[#6f3c82]">
                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            Prompts Sugeridos
                                        </h3>
                                        <p className="text-xs text-white/60 mt-1">Selects de tablas de la base de datos</p>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {suggestedPrompts.map((prompt) => (
                                            <button
                                                key={prompt.id}
                                                onClick={() => {
                                                    setInputMessage(prompt.text);
                                                    setShowPrompts(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-purple-500/10 transition-colors border-b border-[#6f3c82]/30 last:border-b-0"
                                            >
                                                <p className="text-white text-sm">{prompt.text}</p>
                                                <p className="text-purple-400 text-xs mt-1">Tabla: {prompt.table}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="bg-gradient-to-r from-[#FC52AF] to-[#FBB25F] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-6 py-3 transition-opacity"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                                <Send className="w-6 h-6 text-white" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-[#f7f4f3]/40 mt-3 text-center">
                        La IA puede cometer errores. Verifica información importante.
                    </p>
                </div>
            </div>
                </div>
            </div>

            {/* Nubecitas */}
            <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[140%] md:w-[160%] flex justify-center gap-[-120px] items-end -z-10">
                <img
                    src={cloud1}
                    alt="cloud left"
                    className="w-[680px] md:w-[880px] object-contain ml-20 md:ml-100 -translate-x-6 translate-y-16"
                />
                <img
                    src={cloud3}
                    alt="cloud middle"
                    className="w-[820px] md:w-[1180px] object-contain -ml-12 md:-ml-124 -translate-x-16 translate-y-20"
                />
                <img
                    src={cloud2}
                    alt="cloud right"
                    className="w-[780px] md:w-[1080px] object-contain -translate-x-55 md:-translate-x-[340px] translate-y-16"
                />
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default AIChat;
