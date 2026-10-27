import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  AnimatedAvatar,
  AvatarPlaceholderFallback,
  FBXModelErrorBoundary,
} from './AnimatedAvatar';
import FloatingDiamond from './FloatingDiamond';
import CyberOverlayUI from './CyberOverlayUI';

export interface HeroHeaderProps {
  modelUrl?: string;
  onViewProjects?: () => void;
}

export default function HeroHeader({
  modelUrl = '/models/Zorrito.glb',
  onViewProjects,
}: HeroHeaderProps) {
  // Rombos flotantes 3D desplazados hacia la derecha alrededor del Zorrito
  const floatingDiamonds: Array<{
    label: string;
    position: [number, number, number];
    hoverEmissiveColor: '#43cbb4' | '#a73ad9';
    phaseOffset: number;
  }> = [
      {
        label: 'ILUSTRACIÓN',
        position: [0.45, 1.02, 0.25],
        hoverEmissiveColor: '#a73ad9',
        phaseOffset: 0,
      },
      {
        label: 'ANIMACIÓN',
        position: [2.42, 0.82, 0.15],
        hoverEmissiveColor: '#43cbb4',
        phaseOffset: 1.6,
      },
      {
        label: 'UNITY',
        position: [0.55, -0.55, 0.35],
        hoverEmissiveColor: '#43cbb4',
        phaseOffset: 3.2,
      },
      {
        label: 'CÓDIGO',
        position: [2.32, -0.52, 0.35],
        hoverEmissiveColor: '#a73ad9',
        phaseOffset: 4.8,
      },
    ];

  const handleViewProjects = () => {
    if (onViewProjects) {
      onViewProjects();
      return;
    }
    const projectsEl = document.getElementById('proyectos');
    if (projectsEl) {
      projectsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-[#09090f]">
      {/* Resplandor ambiental suave detrás del avatar (derecha) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_76%_48%,rgba(167,58,217,0.14)_0%,rgba(67,203,180,0.08)_28%,transparent_62%)]"
      />

      {/* Cuadrícula técnica ultra sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-25 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      {/* ==================== CAPA 3D: R3F <Canvas> ==================== */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0.15, 4.8], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Controles sin zoom y con ángulos restringidos */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            target={[0, 0.05, 0]}
            minPolarAngle={Math.PI / 2 - 0.25}
            maxPolarAngle={Math.PI / 2 + 0.2}
            minAzimuthAngle={-0.38}
            maxAzimuthAngle={0.38}
            rotateSpeed={0.6}
          />

          {/* Iluminación de estudio suave (estilo Viewport de Blender) + acentos sutiles Cyber-OS */}
          <ambientLight intensity={1.1} />
          <hemisphereLight
            args={['#ffffff', '#8a94a6', 1.2]}
            position={[0, 5, 0]}
          />
          <directionalLight
            position={[1.8, 2.5, 4.5]}
            intensity={1.6}
            color="#ffffff"
          />
          <directionalLight
            position={[-2.5, 1.5, 3.0]}
            intensity={0.75}
            color="#e2f8f5"
          />
          <directionalLight
            position={[3.5, 2.0, -2.5]}
            intensity={0.85}
            color="#c084fc"
          />

          {/* Modelo 3D Zorrito.glb animado desplazado a la derecha */}
          <FBXModelErrorBoundary fallback={<AvatarPlaceholderFallback position={[1.45, -0.22, 0]} />}>
            <Suspense fallback={<AvatarPlaceholderFallback position={[1.45, -0.22, 0]} />}>
              <AnimatedAvatar url={modelUrl} position={[1.45, -0.22, 0]} scale={1.18} />
            </Suspense>
          </FBXModelErrorBoundary>

          {/* Rombos 3D ("AI", "3D", "UX", "</>") alrededor del robot */}
          {floatingDiamonds.map((diamond) => (
            <FloatingDiamond
              key={diamond.label}
              label={diamond.label}
              position={diamond.position}
              hoverEmissiveColor={diamond.hoverEmissiveColor}
              phaseOffset={diamond.phaseOffset}
            />
          ))}
        </Canvas>
      </div>

      {/* ==================== CAPA UI SUPERPUESTA (IMAGEN 1) ==================== */}
      <CyberOverlayUI onViewProjects={handleViewProjects} />
    </section>
  );
}
