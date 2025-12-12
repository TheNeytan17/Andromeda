import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import sello from "@/assets/sello.png";
import name from "@/assets/name.png";
import cloud1 from "@/assets/Cloud1.png";
import cloud2 from "@/assets/Cloud2.png";
import cloud3 from "@/assets/Cloud3.png";
import AuthService from "../../services/AuthService";
import "../Layout/sparkle-button.css";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(correo, password);
      console.log("Login response completa:", response.data);

      // Verificar si la respuesta tiene data anidada
      const loginData = response.data.data || response.data;
      console.log("Login data:", loginData);

      if (loginData.success && loginData.token && loginData.user) {
        console.log("Guardando token y user...");
        AuthService.saveAuthData(loginData.token, loginData.user);
        console.log("Token guardado:", localStorage.getItem('token') ? 'SI' : 'NO');
        console.log("User guardado:", localStorage.getItem('user') ? 'SI' : 'NO');
        toast.success("¡Bienvenido! Inicio de sesión exitoso");
        setTimeout(() => navigate("/"), 1000);
      } else {
        console.error("Login falló:", loginData);
        toast.error(loginData.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const message =
        error.response?.data?.message ||
        "Error de conexión. Por favor intenta nuevamente.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      <ToastContainer position="top-right" theme="dark" />

      {/* Botón Volver - Arriba a la izquierda */}
      <div className="fixed top-6 left-6 z-50">
        <div className="sparkle-container">
          <div className="sparkle-layer-1">
            <div className="sparkle-layer-2">
              <div className="sparkle-layer-3">
                <div className="sparkle-layer-4">
                  <Link
                    to="/"
                    className="font-semibold text-xs px-4 py-2 rounded-full transition btn-sparkle flex items-center gap-1.5 inline-flex"
                    style={{
                      background: 'rgba(247, 244, 243, 0.15)',
                      backdropFilter: 'blur(12px)',
                      border: '2px solid rgba(247, 244, 243, 0.3)',
                      color: '#f7f4f3'
                    }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fondo con gradiente personalizado */}
      <div
        className="absolute inset-0"
        style={{
          background: "#36235f",
          backgroundImage:
            "linear-gradient(135deg, #36235f 0%, #2d1b4e 100%)",
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
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 backdrop-blur-sm bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2
            className="text-2xl font-bold text-center text-white mb-6"
            style={{
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Iniciar Sesión
          </h2>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@andromeda.com"
              required
              className="w-full px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border-2 border-[#2d1b4e] text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff95dd]/50 transition-all text-center font-medium"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border-2 border-[#2d1b4e] text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff95dd]/50 transition-all text-center font-medium pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Submit button */}
          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 rounded-lg text-white font-bold text-sm transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{
                background: '#352c50',
              }}
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </div>

          {/* Forgot password link */}
          <div className="text-center pt-2">
            <Link
              to="#"
              className="text-[#352c50] text-xs hover:text-[#ff95dd] transition-colors underline"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          {/* Register link */}
          <div className="text-center pt-2">
            <p className="text-[#2d1b4e] font-medium">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/signin"
                className="text-[#fc52af] hover:text-[#ff95dd] font-bold underline transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </form>

        {/* NUBES GIGANTES */}
        <div className="pointer-events-none absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[140%] md:w-[160%] flex justify-center gap-[-120px] items-end -z-10">
          <img
            src={cloud1}
            alt="cloud left"
            className="w-[680px] md:w-[880px] object-contain ml-20 md:ml-100 -translate-x-6"
          />

          <img
            src={cloud3}
            alt="cloud middle"
            className="w-[820px] md:w-[1180px] object-contain translate-y-4 -ml-12 md:-ml-124 -translate-x-16"
          />

          <img
            src={cloud2}
            alt="cloud right"
            className="w-[780px] md:w-[1080px] object-contain -translate-x-55 md:-translate-x-[340px]"
          />
        </div>
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
};

export default Login;
