import React from 'react';
import { ArrowUpRight, Github, Linkedin } from 'lucide-react';

export interface CyberOverlayUIProps {
  onViewProjects?: () => void;
}

/**
 * Interfaz superpuesta fiel a la Imagen 1:
 * - Capa absoluta con z-10 y pointer-events: none (pointer-events-none).
 * - Reactivación de eventos (pointer-events-auto) en el botón "Ver Proyectos" y enlaces sociales.
 * - Incluye las referencias sutiles de la rúbrica (IDENTITY_PROFILE.exe, SYSTEM_MONITOR y
 *   nodos de selección responsivos) sin recargar ni tapar el diseño limpio de la Imagen 1.
 */
export default function CyberOverlayUI({ onViewProjects }: CyberOverlayUIProps) {
  return (
    <div
      style={{ pointerEvents: 'none' }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-6 sm:py-8 select-none"
    >
      {/* ==================== MICRO BARRA SUPERIOR SUTIL ==================== */}
      <header className="w-full max-w-[1360px] mx-auto flex items-center justify-between text-[10px] font-mono-tech tracking-[0.2em] text-slate-500/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43cbb4]/70" />
          <span>IDENTITY_PROFILE.exe</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>SYSTEM_MONITOR // 3D_ACTIVE</span>
          <span className="text-[#43cbb4]/80">[AI • 3D • UX • &lt;/&gt;]</span>
        </div>
      </header>

      {/* ==================== CONTENIDO PRINCIPAL IZQUIERDO (IMAGEN 1) ==================== */}
      <main className="w-full max-w-[1360px] mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start text-left max-w-xl">
          {/* Badge superior: • HOLA, SOY */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#43cbb4]/35 bg-[#43cbb4]/[0.06] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43cbb4] shadow-[0_0_6px_#43cbb4]" />
            <span className="font-mono-tech text-[10px] font-semibold tracking-[0.18em] text-[#43cbb4] uppercase">
              HOLA, SOY
            </span>
          </div>

          {/* Caja de selección responsiva con nodos sutiles envolviendo nombre y carrera */}
          <div className="relative group py-2 pr-4 w-full max-w-full">
            {/* Nodos de esquina minimalistas */}
            <span className="absolute -top-0.5 -left-1.5 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />
            <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />
            <span className="absolute -bottom-0.5 -left-1.5 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />
            <span className="absolute -bottom-0.5 right-0 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />

            {/* Título principal: Esteban Mera (Degradado Blanco -> Lavanda -> Turquesa) */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight leading-[1.05] bg-gradient-to-r from-white via-[#c59df2] to-[#43cbb4] bg-clip-text text-transparent">
              Esteban Mera
            </h1>

            {/* Subtítulos exactos de la Imagen 1 */}
            <div className="mt-3 sm:mt-4 space-y-0.5">
              <h2 className="text-base sm:text-xl lg:text-[21px] font-bold text-white tracking-tight">
                Ingeniero Multimedia y de Sistemas
              </h2>
              <p className="text-sm sm:text-lg lg:text-[19px] font-semibold text-[#43cbb4]">
                Desarrollador Web
              </p>
            </div>
          </div>

          {/* Descripción limpia */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-sm lg:text-[15px] text-slate-400 max-w-[430px] leading-relaxed font-normal">
            Diseño y desarrollo experiencias web interactivas, interfaces
            dinámicas y entornos 3D.
          </p>

          {/* Botón CTA "Ver Proyectos" con pointer-events: auto (idéntico a la Imagen 1) */}
          <div className="mt-7 sm:mt-8">
            <button
              type="button"
              onClick={onViewProjects}
              style={{ pointerEvents: 'auto' }}
              className="pointer-events-auto cursor-pointer group inline-flex items-center gap-4 bg-[#1089d8] hover:bg-[#169bf0] text-white text-xs sm:text-[13px] font-semibold pl-5 pr-2.5 py-2.5 rounded-[6px] shadow-[0_6px_24px_rgba(16,137,216,0.32)] hover:shadow-[0_8px_28px_rgba(67,203,180,0.4)] transition-all duration-200 active:scale-95"
            >
              <span>Ver Proyectos</span>
              <span className="w-6 h-6 rounded-[4px] bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </button>
          </div>
        </div>

        {/* Columna derecha libre para el Robot 3D y los rombos interactivos */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 h-full items-end justify-end relative">
          {/* Etiqueta flotante inferior derecha junto al avatar (Imagen 1) */}
          <div className="translate-y-24 xl:translate-y-28 pr-2 text-left font-mono-tech">
            <div className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-slate-400 uppercase">
              <span className="w-3.5 h-[1.5px] bg-[#43cbb4]" />
              <span>MODELO INTERACTIVO</span>
            </div>
            <div className="pl-5 mt-0.5 text-[9px] tracking-[0.18em] text-slate-300 font-semibold uppercase">
              ARRASTRA PARA EXPLORAR
            </div>
          </div>
        </div>
      </main>

      {/* ==================== BARRA INFERIOR MINIMALISTA (IMAGEN 1) ==================== */}
      <footer className="w-full max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4 pt-2 text-[10px] font-mono-tech tracking-[0.2em] text-slate-500">
        {/* Redes sociales izquierda */}
        <div className="flex items-center gap-3.5">
          <a
            href="https://github.com/estebanmeraaranda-arch"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            style={{ pointerEvents: 'auto' }}
            className="pointer-events-auto text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            style={{ pointerEvents: 'auto' }}
            className="pointer-events-auto text-slate-400 hover:text-white transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <span className="w-8 h-[1px] bg-slate-800" />
          <span className="text-[9px] tracking-[0.24em] text-slate-500 uppercase">
            SÍGUEME
          </span>
        </div>

        {/* Estado disponible derecha */}
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] tracking-[0.2em] text-slate-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43cbb4] shadow-[0_0_6px_#43cbb4]" />
          <span>DISPONIBLE PARA NUEVOS PROYECTOS</span>
        </div>
      </footer>
    </div>
  );
}
