import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Github, Mail, MapPin } from 'lucide-react';

export interface CyberOverlayUIProps {
  onViewProjects?: () => void;
}

interface SkillStat {
  label: string;
  value: number; // 0 a 100
  angleDeg: number;
  barColor: string;
}

const SKILLS_DATA: SkillStat[] = [
  { label: 'ANIMACIÓN', value: 84, angleDeg: -90, barColor: 'bg-[#43cbb4]' },
  { label: 'ILUSTRACIÓN', value: 80, angleDeg: -18, barColor: 'bg-[#a73ad9]' },
  { label: 'CÓDIGO', value: 78, angleDeg: 54, barColor: 'bg-[#43cbb4]' },
  { label: 'UNITY', value: 60, angleDeg: 126, barColor: 'bg-[#a73ad9]' },
  { label: 'BLENDER', value: 60, angleDeg: 198, barColor: 'bg-[#43cbb4]' },
];

/**
 * Ventana SYSTEM_MONITOR desplegable (flotante en la esquina inferior derecha)
 * para no empujar el layout ni quitarle espacio al Zorrito 3D.
 */
function CollapsibleSystemMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cx = 110;
  const cy = 78;
  const maxR = 46;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const getPoint = (angleDeg: number, radiusFactor: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * maxR * radiusFactor,
      y: cy + Math.sin(rad) * maxR * radiusFactor,
    };
  };

  const getPolygonPoints = (radiusFactor: number) =>
    SKILLS_DATA.map((s) => {
      const p = getPoint(s.angleDeg, radiusFactor);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');

  const skillPolygonPoints = SKILLS_DATA.map((s) => {
    const p = getPoint(s.angleDeg, s.value / 100);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  return (
    <div
      style={{ pointerEvents: 'auto' }}
      className="pointer-events-auto w-[255px] sm:w-[270px] border border-[#164e63]/90 bg-[#070a12]/92 backdrop-blur-md shadow-[0_0_28px_rgba(0,0,0,0.7)] font-mono-tech transition-all duration-200"
    >
      {/* Barra superior clicable para desplegar / contraer */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full cursor-pointer flex items-center justify-between px-3 py-2 bg-[#061826]/85 hover:bg-[#092235] transition-colors"
      >
        <div className="flex items-center gap-2 text-[9.5px] font-semibold tracking-[0.16em] text-[#43cbb4]">
          <span className="inline-block w-2 h-2 rotate-45 border border-[#43cbb4]" />
          <span>SYSTEM_MONITOR // SKILLS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 border border-[#38bdf8]/70 bg-transparent" />
          <span className="w-2 h-2 bg-[#a73ad9]" />
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#43cbb4] ml-0.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-[#43cbb4] ml-0.5" />
          )}
        </div>
      </button>

      {/* Contenido desplegable */}
      {isOpen && (
        <div className="p-3.5 border-t border-[#164e63]/80">
          {/* Gráfico de Radar Poligonal de Habilidades */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 220 154"
              className="w-full h-[142px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="hexSkillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#43cbb4" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#a73ad9" stopOpacity="0.38" />
                </linearGradient>
              </defs>

              {rings.map((r) => (
                <polygon
                  key={r}
                  points={getPolygonPoints(r)}
                  fill="none"
                  stroke="#15465c"
                  strokeWidth={r === 1 ? 1.1 : 0.75}
                />
              ))}

              {SKILLS_DATA.map((skill) => {
                const outer = getPoint(skill.angleDeg, 1);
                return (
                  <line
                    key={skill.label}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#15465c"
                    strokeWidth="0.75"
                  />
                );
              })}

              <polygon
                points={skillPolygonPoints}
                fill="url(#hexSkillGrad)"
                stroke="#43cbb4"
                strokeWidth="1.5"
              />

              {SKILLS_DATA.map((skill, idx) => {
                const valPt = getPoint(skill.angleDeg, skill.value / 100);
                const labelPt = getPoint(skill.angleDeg, 1.28);
                const isHovered = hoveredIndex === idx;

                return (
                  <g
                    key={skill.label}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={valPt.x}
                      cy={valPt.y}
                      r={isHovered ? 3.8 : 2.5}
                      fill={isHovered ? '#a73ad9' : '#43cbb4'}
                      stroke="#070a12"
                      strokeWidth="1"
                    />
                    <text
                      x={labelPt.x}
                      y={labelPt.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isHovered ? '#43cbb4' : '#94a3b8'}
                      fontSize="7"
                      fontWeight="600"
                      letterSpacing="0.06em"
                    >
                      { `${skill.label} ${skill.value}%` }
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Lista de porcentajes */}
          <div className="mt-1.5 space-y-2">
            <div className="text-[8.5px] tracking-[0.2em] text-slate-400/90 uppercase">
              CREATIVE OUTPUT
            </div>

            {SKILLS_DATA.map((bar) => (
              <div key={bar.label} className="space-y-0.5">
                <div className="flex items-center justify-between text-[9px] tracking-[0.12em]">
                  <span className="text-slate-300">{bar.label}</span>
                  <span className="text-[#43cbb4] font-semibold">{bar.value}%</span>
                </div>
                <div className="w-full h-1 bg-[#131b2e] overflow-hidden">
                  <div
                    className={`h-full ${bar.barColor} shadow-[0_0_8px_rgba(67,203,180,0.45)]`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Interfaz superpuesta limpia:
 * - El Zorrito 3D y los rombos permanecen amplios a la derecha.
 * - El SYSTEM_MONITOR vive como un panel desplegable flotante en la esquina inferior derecha.
 */
export default function CyberOverlayUI({ onViewProjects }: CyberOverlayUIProps) {
  return (
    <div
      style={{ pointerEvents: 'none' }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-6 sm:py-8 select-none"
    >
      {/* ==================== MICRO BARRA SUPERIOR ==================== */}
      <header className="w-full max-w-[1360px] mx-auto flex items-center justify-between text-[10px] font-mono-tech tracking-[0.2em] text-slate-500/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43cbb4]/70" />
          <span>IDENTITY_PROFILE.exe</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>SYSTEM_MONITOR // 3D_ACTIVE</span>
          <span className="text-[#43cbb4]/80">
            [ILUSTRACIÓN • ANIMACIÓN • CÓDIGO • BLENDER • UNITY]
          </span>
        </div>
      </header>

      {/* ==================== CONTENIDO PRINCIPAL IZQUIERDO ==================== */}
      <main className="w-full max-w-[1360px] mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left max-w-md">
          {/* Badge corto y limpio */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#43cbb4]/35 bg-[#43cbb4]/[0.06] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43cbb4] shadow-[0_0_6px_#43cbb4]" />
            <span className="font-mono-tech text-[10px] font-semibold tracking-[0.18em] text-[#43cbb4] uppercase">
              HOLA, SOY
            </span>
          </div>

          {/* Caja de selección ajustada al ancho del texto (w-fit) */}
          <div className="relative group py-2 pr-5 w-fit">
            <span className="absolute -top-0.5 -left-1.5 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />
            <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />
            <span className="absolute -bottom-0.5 -left-1.5 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />
            <span className="absolute -bottom-0.5 right-0 w-1.5 h-1.5 border border-[#43cbb4]/50 bg-[#09090f]" />

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-tight leading-[1.05] bg-gradient-to-r from-white via-[#c59df2] to-[#43cbb4] bg-clip-text text-transparent">
              Esteban Mera
            </h1>

            <div className="mt-3 sm:mt-4 space-y-0.5">
              <h2 className="text-base sm:text-xl lg:text-[20px] font-bold text-white tracking-tight">
                Ingeniero Multimedia y de Sistemas
              </h2>
              <p className="text-sm sm:text-base lg:text-[17px] font-semibold text-[#43cbb4]">
                Ilustración · Animación 2D · Modelado 3D · Unity &amp; Código
              </p>
            </div>
          </div>

          {/* Descripción breve y directa (2 líneas) */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-sm lg:text-[15px] text-slate-400 max-w-[400px] leading-relaxed font-normal">
            Creo ilustración digital, animación 2D, modelado 3D en Blender y
            experiencias interactivas en Unity y web.
          </p>

          {/* Botón CTA "Ver Proyectos" */}
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
      </main>

      {/* ==================== MONITOR DESPLEGABLE FLOTANTE (ESQUINA INFERIOR DERECHA) ==================== */}
      <div className="fixed lg:absolute bottom-14 right-6 sm:right-12 lg:right-20 z-20">
        <CollapsibleSystemMonitor />
      </div>

      {/* ==================== BARRA INFERIOR ==================== */}
      <footer className="w-full max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4 pt-2 text-[10px] font-mono-tech tracking-[0.2em] text-slate-500">
        <div className="flex items-center gap-3.5">
          <a
            href="https://github.com/estebanmeraaranda-arch"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="github.com/estebanmeraaranda-arch"
            style={{ pointerEvents: 'auto' }}
            className="pointer-events-auto text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="mailto:estebanmeraaranda@gmail.com"
            aria-label="Correo electrónico"
            title="estebanmeraaranda@gmail.com"
            style={{ pointerEvents: 'auto' }}
            className="pointer-events-auto text-slate-400 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
          <span className="w-8 h-[1px] bg-slate-800" />
          <span className="text-[9px] tracking-[0.2em] text-slate-400">
            estebanmeraaranda@gmail.com
          </span>
        </div>

        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] tracking-[0.2em] text-slate-400 uppercase">
          <MapPin className="w-3.5 h-3.5 text-[#43cbb4]" />
          <span>CALI, COLOMBIA</span>
          <span className="text-slate-700">•</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#43cbb4] shadow-[0_0_6px_#43cbb4]" />
          <span>DISPONIBLE PARA PROYECTOS</span>
        </div>
      </footer>
    </div>
  );
}
