import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import ValoracionService from '../../services/ValoracionService';

/**
 * Componente para valorar un ticket cerrado
 * @param {Object} props
 * @param {number} props.ticketId - ID del ticket a valorar
 * @param {number} props.userId - ID del usuario que valora
 * @param {string} props.ticketTitle - Título del ticket
 * @param {Function} props.onClose - Callback al cerrar modal
 * @param {Function} props.onSuccess - Callback al crear valoración exitosamente
 */
export default function RateTicket({ ticketId, userId, ticketTitle, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Enviar valoración al backend
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado un puntaje
        if (rating === 0) {
            toast.error('Por favor selecciona una calificación');
            return;
        }

        // Validar longitud del comentario
        if (comment.length > 250) {
            toast.error('El comentario no puede exceder 250 caracteres');
            return;
        }

        setLoading(true);

        try {
            const valoracionData = {
                Id_Ticket: ticketId,
                Id_Usuario: userId,
                Puntaje: rating,
                Comentario: comment.trim() || null
            };

            console.log('=== Enviando valoración ===');
            console.log('Datos:', valoracionData);

            const response = await ValoracionService.createValoracion(valoracionData);

            console.log('=== Respuesta recibida ===');
            console.log('Response completa:', response);
            console.log('Response.data:', response.data);

            if (response.data.success) {
                toast.success('¡Valoración enviada exitosamente!');
                
                // Llamar callback de éxito si existe
                if (onSuccess) {
                    console.log('Llamando onSuccess callback con:', response.data.data);
                    onSuccess(response.data.data);
                }
                
                // Cerrar modal después de un delay para que se vea el toast
                setTimeout(() => {
                    if (onClose) {
                        onClose();
                    }
                }, 1500);
            } else {
                console.error('Error en respuesta:', response.data);
                toast.error(response.data.message || 'Error al enviar valoración');
            }
        } catch (error) {
            console.error('=== Error al enviar valoración ===');
            console.error('Error completo:', error);
            console.error('Response del error:', error.response);
            const errorMsg = error.response?.data?.message || error.message || 'Error al enviar valoración';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Renderizar estrellas interactivas
     */
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoveredRating || rating);
            
            return (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                    <Star
                        className={`w-10 h-10 ${
                            isActive
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-zinc-700 text-zinc-700'
                        }`}
                    />
                </button>
            );
        });
    };

    /**
     * Obtener texto descriptivo según el puntaje
     */
    const getRatingText = (score) => {
        const texts = {
            1: 'Muy insatisfecho',
            2: 'Insatisfecho',
            3: 'Normal',
            4: 'Satisfecho',
            5: 'Muy satisfecho'
        };
        return texts[score] || 'Selecciona tu calificación';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border-2 border-purple-500/30 rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Encabezado */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Valorar Servicio</h2>
                    <p className="text-sm text-zinc-400">
                        ¿Cómo fue tu experiencia con el ticket{' '}
                        <span className="text-purple-400 font-semibold">#{ticketId}</span>?
                    </p>
                    {ticketTitle && (
                        <p className="text-xs text-zinc-500 mt-1 italic">"{ticketTitle}"</p>
                    )}
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selector de estrellas */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">
                            Calificación <span className="text-red-400">*</span>
                        </label>
                        
                        <div className="flex justify-center gap-2 py-4">
                            {renderStars()}
                        </div>

                        <p className="text-center text-sm font-medium text-purple-400">
                            {getRatingText(hoveredRating || rating)}
                        </p>
                    </div>

                    {/* Comentario opcional */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">
                            Comentario <span className="text-zinc-500">(Opcional)</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Comparte tu experiencia... (máximo 250 caracteres)"
                            maxLength={250}
                            rows={4}
                            className="w-full px-3 py-2 bg-zinc-800 border-2 border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-zinc-500 text-right">
                            {comment.length}/250 caracteres
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Enviando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Enviar Valoración
                                </span>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Nota informativa */}
                <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-zinc-400">
                    <strong className="text-purple-400">Nota:</strong> Solo puedes valorar tickets cerrados y
                    la valoración es definitiva (no se puede modificar).
                </div>
            </div>
        </div>
    );
}
