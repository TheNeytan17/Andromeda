import React from "react";
import { CalendarDays, MapPin } from "lucide-react";
import mascot from "../../assets/mascot.png";
import convertech from "../../assets/convertech.png";
import feria from "../../assets/feria.png";
import fest from "../../assets/fest.png";
import starconcert from "../../assets/starconcert.png";

export function Home() {

  return (
    <main className="relative w-full min-h-screen bg-[#241b38] overflow-hidden flex flex-col items-center justify-start">
      
      {/* HERO */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 gap-12 py-12 md:py-20 md:pr-32">
        {/* Texto */}
        <div className="flex flex-col items-start text-left text-white max-w-lg">
          <h1
            className="font-shrikhand text-3xl md:text-5xl font-normal mb-4 leading-tight"
            style={{ fontFamily: "Shrikhand" }}
          >
            <span className="bg-gradient-to-r from-[#FC52AF] to-[#FBB25F] text-transparent bg-clip-text">
              ANDRÓMEDA:
            </span>
            <br />
            <span className="text-[#f7f4f3]">
              Conciertos, <br />
              convenciones <br />y más
            </span>
          </h1>

          <p className="text-sm tracking-wide text-[#f7f4f3] mt-4">
            ÚNETE A NOSOTROS
          </p>

          <div className="mt-8 flex items-center gap-4">
            <button className="btn-ghost-neon font-medium">
              REGÍSTRATE
            </button>
            <span className="text-4xl text-orange-300 rotate-[-30deg]">→</span>
          </div>
        </div>

        {/* Imagen del gato en hexágonos */}
        <div className="relative flex items-center justify-center">
          {/* Hexágonos concéntricos */}
          <div className="absolute w-[28rem] h-[28rem] md:w-[32rem] md:h-[32rem]">
            <svg
              viewBox="0 0 320 320"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
            >
              <polygon
                points="160,16 296,88 296,232 160,304 24,232 24,88"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="18"
                style={{
                  transformOrigin: 'center',
                  animation: 'scaleIn 1s ease-out 0s forwards',
                  transform: 'scale(0)'
                }}
              />
              <polygon
                points="160,32 280,96 280,224 160,288 40,224 40,96"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="18"
                style={{
                  transformOrigin: 'center',
                  animation: 'scaleIn 1s ease-out 0.2s forwards',
                  transform: 'scale(0)'
                }}
              />
              <polygon
                points="160,48 264,104 264,216 160,272 56,216 56,104"
                fill="url(#grad)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="14"
                style={{
                  transformOrigin: 'center',
                  animation: 'scaleIn 1s ease-out 0.4s forwards',
                  transform: 'scale(0)'
                }}
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6f3c82" />
                  <stop offset="50%" stopColor="#fc52af" />
                  <stop offset="100%" stopColor="#ff8f57" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Imagen del gato */}
          <img
            src={mascot}
            alt="Andrómeda Mascot"
            className="relative w-56 md:w-64 z-10"
          />
        </div>
      </section>

      {/* SOBRE NOSOTROS (dos líneas horizontales) */}
      <section className="w-full bg-[#241b38] py-16 px-8 md:px-16 text-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          {/* Primera línea: Título, flecha y texto */}
          <div className="flex flex-row items-center gap-8">
            <div className="flex items-center gap-8 min-w-[340px]">
              <div>
                <h2
                  className="font-shrikhand text-lg md:text-xl text-white mb-0 uppercase tracking-wider"
                  style={{ fontFamily: "Shrikhand" }}
                >
                  SOBRE
                </h2>
                <h3
                  className="font-shrikhand text-4xl md:text-5xl text-white mb-0"
                  style={{ fontFamily: "Shrikhand" }}
                >
                  NOSOTROS
                </h3>
              </div>
              <span className="text-3xl md:text-4xl text-[#ff8f57] font-bold" style={{marginTop:'1.5rem'}}>
                <svg width="70" height="30" viewBox="0 0 70 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="15" x2="60" y2="15" stroke="#ff8f57" strokeWidth="2" />
                  <polyline points="60,5 70,15 60,25" fill="none" stroke="#ff8f57" strokeWidth="2" />
                </svg>
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white/80 leading-relaxed text-lg">
                En Andrómeda, transformamos ideas en experiencias inolvidables.<br />
                Somos una empresa dedicada a la organización y producción de eventos masivos, comprometida con llevar cada proyecto a una nueva dimensión.
              </p>
            </div>
          </div>

          {/* Segunda línea: cuadros y eventos */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-24 items-start">
            {/* Cuadros */}
            <div className="flex flex-col gap-8 mt-8">
              {/* ¿Dónde? */}
              <div className="flex items-center justify-between p-8 rounded-3xl bg-[#bdb7c0]/40 neon-card-gradient" style={{minHeight:'120px'}}>
                <div>
                  <p className="font-shrikhand text-2xl text-white mb-2 font-normal tracking-widest" style={{ fontFamily: "Shrikhand" }}>¿Dónde?</p>
                  <p className="text-lg text-white/80">Todos nuestros eventos son realizados en el Parque Viva.</p>
                </div>
                <div className="flex items-center justify-center ml-8">
                  <svg width="90" height="90" viewBox="0 0 200 200" className="block" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="100,20 175,60 175,140 100,180 25,140 25,60" fill="#bdb7c0" stroke="#fff" strokeWidth="12" />
                    <foreignObject x="45" y="45" width="110" height="110">
                      <div className="flex items-center justify-center w-full h-full">
                        <MapPin className="w-16 h-16 text-white" />
                      </div>
                    </foreignObject>
                  </svg>
                </div>
              </div>
              {/* ¿Cuándo? */}
              <div className="flex items-center justify-between p-8 rounded-3xl bg-[#bdb7c0]/40 neon-card-gradient" style={{minHeight:'120px'}}>
                <div>
                  <p className="font-shrikhand text-2xl text-white mb-2 font-normal tracking-widest" style={{ fontFamily: "Shrikhand" }}>¿Cuándo?</p>
                  <p className="text-lg text-white/80">Nuestro eventos se realizan de jueves a domingo.</p>
                </div>
                <div className="flex items-center justify-center ml-8">
                  <svg width="90" height="90" viewBox="0 0 200 200" className="block" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="100,20 175,60 175,140 100,180 25,140 25,60" fill="#bdb7c0" stroke="#fff" strokeWidth="12" />
                    <foreignObject x="45" y="45" width="110" height="110">
                      <div className="flex items-center justify-center w-full h-full">
                        <CalendarDays className="w-16 h-16 text-white" />
                      </div>
                    </foreignObject>
                  </svg>
                </div>
              </div>
            </div>

            {/* Eventos */}
            <div className="flex flex-col gap-2 items-start justify-center ml-auto">
              <h3
                className="font-shrikhand text-lg md:text-xl text-white mb-0 uppercase tracking-wider"
                style={{ fontFamily: "Shrikhand" }}
              >
                NUESTROS
              </h3>
              <h4
                className="font-shrikhand text-5xl md:text-6xl text-white mb-6 mt-0"
                style={{ fontFamily: "Shrikhand" }}
              >
                EVENTOS
              </h4>
              <ul className="space-y-8">
                <li>
                  <span className="font-shrikhand text-3xl md:text-4xl text-[#fc52af] font-bold mr-2" style={{ fontFamily: "Shrikhand" }}>+25</span>
                  <span className="font-shrikhand text-2xl text-white font-bold mr-2" style={{ fontFamily: "Shrikhand" }}>CONCIERTOS</span>
                  <p className="text-sm text-white/80 ml-1">Completados al año</p>
                </li>
                <li>
                  <span className="font-shrikhand text-3xl md:text-4xl text-[#b97aff] font-bold mr-2" style={{ fontFamily: "Shrikhand" }}>+15</span>
                  <span className="font-shrikhand text-2xl text-white font-bold mr-2" style={{ fontFamily: "Shrikhand" }}>CONVENCIONES</span>
                  <p className="text-sm text-white/80 ml-1">Completados al año</p>
                </li>
                <li>
                  <span className="font-shrikhand text-3xl md:text-4xl text-[#ff8f57] font-bold mr-2" style={{ fontFamily: "Shrikhand" }}>+30</span>
                  <span className="font-shrikhand text-2xl text-white font-bold mr-2" style={{ fontFamily: "Shrikhand" }}>FESTIVALES</span>
                  <p className="text-sm text-white/80 ml-1">Entre otros eventos completadas al año</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMA */}
      <section className="w-full bg-[#241b38] py-16 px-8 md:px-16 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10 flex-col md:flex-row">
            <div className="flex items-center gap-8 mb-6 md:mb-0">
              <div className="flex flex-col items-start">
                <h2
                  className="font-shrikhand text-4xl md:text-5xl text-white mb-0 uppercase tracking-wider"
                  style={{ fontFamily: "Shrikhand" }}
                >
                  PROGRAMA
                </h2>
                <h3 className="font-shrikhand text-lg md:text-xl text-white mb-0 font-normal" style={{ fontFamily: "Shrikhand" }}>
                  DE ESTA SEMANA
                </h3>
              </div>
              <span className="text-3xl md:text-4xl text-[#ff8f57] font-bold" style={{marginTop:'1.5rem'}}>
                <svg width="70" height="30" viewBox="0 0 70 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="15" x2="60" y2="15" stroke="#ff8f57" strokeWidth="2" />
                  <polyline points="60,5 70,15 60,25" fill="none" stroke="#ff8f57" strokeWidth="2" />
                </svg>
              </span>
            </div>
            <p className="text-base md:text-lg text-white/80 max-w-md text-left mx-auto md:mx-auto">
              En este espacio aparecerá el cronograma de eventos de la semana
              actual
            </p>
          </div>

          {/* Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                img: feria,
                title: "ExpoImpacto",
                day: "Jue - 2:00pm",
                tag: "Feria de sostenibilidad y emprendimiento",
              },
              {
                img: convertech,
                title: "ConverTech",
                day: "Vie - 1:00pm",
                tag: "Convención de innovación y tecnología",
              },
              {
                img: fest,
                title: "Galaxy Fest",
                day: "Sáb - 5:00pm",
                tag: "Festival de música y arte urbano",
              },
              {
                img: starconcert,
                title: "Stellar Nights",
                day: "Dom - 7:00pm",
                tag: "Conciertos bajo las estrellas",
              },
            ].map((event, i) => (
              <div
                key={i}
                className="bg-[#322854] rounded-3xl overflow-hidden shadow-lg hover:scale-[1.03] transition-all duration-500 neon-card"
              >
                <div className="relative w-full h-44">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-lg font-bold mb-1">{event.title}</h4>
                  <p className="text-sm text-white/70 mb-2">{event.day}</p>
                  <span className="inline-block whitespace-normal break-words text-sm bg-white/10 px-4 py-2 rounded-full text-center leading-tight max-w-[220px] mx-auto">
                    {event.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
