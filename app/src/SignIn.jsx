import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import sello from "@/assets/sello.png";
import name from "@/assets/name.png";
import AuthService from "./services/AuthService";

export function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Debes aceptar los Términos y Condiciones");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.register(
        formData.username,
        formData.email,
        formData.password
      );

      if (response.data.success) {
        toast.success(response.data.message || "¡Cuenta creada exitosamente!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const message = response.data.message || "Error al crear la cuenta";
        toast.error(message);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      const message = error.response?.data?.message || "Error de red o servidor";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      <ToastContainer position="top-right" theme="dark" />

      {/* Fondo con gradiente personalizado */}
      <div
        className="absolute inset-0"
        style={{
          background: "#FF95B5",
          backgroundImage:
            "linear-gradient(315deg, rgba(255, 149, 181, 1) 0%, rgba(36, 27, 56, 1) 100%)",
        }}
      ></div>

      {/* Estrellas decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <img
            src={sello}
            alt="Andromeda Seal"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_20px_rgba(252,82,175,0.6)] animate-pulse"
          />
          <img
            src={name}
            alt="Andromeda"
            className="w-48 md:w-64 object-contain drop-shadow-[0_0_15px_rgba(252,82,175,0.4)]"
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <h2
            className="text-3xl font-bold text-center text-[#2d1b4e] mb-6"
            style={{
              textShadow: "2px 2px 0 #fff",
            }}
          >
            Registrarme
          </h2>

          {/* Username */}
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 border-[#2d1b4e] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#ff95dd]/50 transition-all text-center font-medium"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@andromeda.com"
              required
              className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 border-[#2d1b4e] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#ff95dd]/50 transition-all text-center font-medium"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
              className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 border-[#2d1b4e] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#ff95dd]/50 transition-all text-center font-medium pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar Contraseña"
              required
              className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 border-[#2d1b4e] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#ff95dd]/50 transition-all text-center font-medium pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center justify-center gap-3 py-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-[#2d1b4e] text-[#6eb3ff] focus:ring-2 focus:ring-[#ff95dd]/50 cursor-pointer"
            />
            <label
              htmlFor="terms"
              className="text-[#2d1b4e] font-medium text-sm"
            >
              Acepto los{" "}
              <span className="underline cursor-pointer hover:text-[#6eb3ff]">
                Términos y Condiciones
              </span>
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#2d4b9e] hover:bg-[#3d5bae] text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center pt-2">
            <p className="text-[#2d1b4e] font-medium">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-[#6eb3ff] hover:text-[#ff95dd] font-bold underline transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default SignIn;
