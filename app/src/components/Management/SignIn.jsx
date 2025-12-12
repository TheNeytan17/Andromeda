import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import sello from "@/assets/sello.png";
import name from "@/assets/name.png";
import AuthService from "../../services/AuthService";
import "../Layout/sparkle-button.css";
import cloud1 from "@/assets/Cloud1.png";
import cloud2 from "@/assets/Cloud2.png";
import cloud3 from "@/assets/Cloud3.png";
import TermsModal from "../ui/TermsModal";

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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "El nombre es requerido";
        } else if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (value.trim().length > 50) {
          error = "El nombre no puede exceder 50 caracteres";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "El correo es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Ingresa un correo electrónico válido";
        } else if (!value.toLowerCase().endsWith("@andromeda.com")) {
          error = "El correo debe ser del dominio @andromeda.com";
        }
        break;

      case "password":
        if (!value) {
          error = "La contraseña es requerida";
        } else if (value.length < 8) {
          error = "Mínimo 8 caracteres";
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = "Debe contener al menos una letra minúscula";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = "Debe contener al menos una letra mayúscula";
        } else if (!/(?=.*\d)/.test(value)) {
          error = "Debe contener al menos un número";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Confirma tu contraseña";
        } else if (value !== formData.password) {
          error = "Las contraseñas no coinciden";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    if (name === "password" && touched.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const usernameError = validateField("username", formData.username);
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);
    const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);

    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (usernameError || emailError || passwordError || confirmPasswordError) {
      const firstError = usernameError || emailError || passwordError || confirmPasswordError;
      toast.error(firstError);
      return;
    }

    if (!agreedToTerms) {
      toast.error("Debes aceptar los Términos y Condiciones");
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

      <div
        className="absolute inset-0"
        style={{
          background: "#FF95B5",
          backgroundImage:
            "linear-gradient(315deg, rgba(255, 149, 181, 1) 0%, rgba(36, 27, 56, 1) 100%)",
        }}
      ></div>

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

      <div className="relative z-10 w-full max-w-md">
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

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 backdrop-blur-sm bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2
            className="text-3xl font-bold text-center text-white mb-6"
            style={{
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Crear Cuenta
          </h2>

          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nombre completo"
              required
              className={`w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 text-gray-800 placeholder-gray-500 focus:outline-none transition-all text-center font-medium ${
                touched.username && errors.username
                  ? "border-red-500 focus:ring-4 focus:ring-red-500/50"
                  : "border-[#2d1b4e] focus:ring-4 focus:ring-[#ff95dd]/50"
              }`}
            />
            {touched.username && errors.username && (
              <p className="text-red-400 text-xs mt-1 text-center font-medium">
                {errors.username}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ejemplo@andromeda.com"
              required
              className={`w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 text-gray-800 placeholder-gray-500 focus:outline-none transition-all text-center font-medium ${
                touched.email && errors.email
                  ? "border-red-500 focus:ring-4 focus:ring-red-500/50"
                  : "border-[#2d1b4e] focus:ring-4 focus:ring-[#ff95dd]/50"
              }`}
            />
            {touched.email && errors.email && (
              <p className="text-red-400 text-xs mt-1 text-center font-medium">
                {errors.email}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Contraseña"
              required
              className={`w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 text-gray-800 placeholder-gray-500 focus:outline-none transition-all text-center font-medium pr-12 ${
                touched.password && errors.password
                  ? "border-red-500 focus:ring-4 focus:ring-red-500/50"
                  : "border-[#2d1b4e] focus:ring-4 focus:ring-[#ff95dd]/50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {touched.password && errors.password && (
              <p className="text-red-400 text-xs mt-1 text-center font-medium">
                {errors.password}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirmar Contraseña"
              required
              className={`w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-3 text-gray-800 placeholder-gray-500 focus:outline-none transition-all text-center font-medium pr-12 ${
                touched.confirmPassword && errors.confirmPassword
                  ? "border-red-500 focus:ring-4 focus:ring-red-500/50"
                  : "border-[#2d1b4e] focus:ring-4 focus:ring-[#ff95dd]/50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1 text-center font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 py-2 px-4">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-white text-[#fc52af] focus:ring-2 focus:ring-[#ff95dd]/50 cursor-pointer accent-[#fc52af]"
            />
            <label
              htmlFor="terms"
              className="text-white font-medium text-sm drop-shadow-md"
            >
              Acepto los{" "}
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="underline cursor-pointer hover:text-[#fc52af] transition-colors"
              >
                Términos y Condiciones
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#fc52af] to-[#ff95dd] hover:from-[#ff6ebf] hover:to-[#ffa5ed] text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl disabled:hover:scale-100"
              style={{
                boxShadow: loading || !agreedToTerms ? 'none' : '0 8px 24px rgba(252, 82, 175, 0.4)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                "Registrarme"
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-white font-medium drop-shadow-md">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-[#fc52af] hover:text-[#ff95dd] font-bold underline transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>

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

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

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
