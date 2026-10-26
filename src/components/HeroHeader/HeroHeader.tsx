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
  modelUrl = '/models/avatar.fbx',
  onViewProjects,
}: HeroHeaderProps) {
  // Rombos flotantes 3D ("AI", "3D", "UX", "</>") posicionados alrededor del robot en el lado derecho
  const floatingDiamonds: Array<{
    label: string;
    position: [number, number, number];
    hoverEmissiveColor: '#43cbb4' | '#a73ad9';
    phaseOffset: number;
  }> = [
    {
      label: 'AI',
      position: [0.18, 1.05, 0.25],
      hoverEmissiveColor: '#a73ad9',
      phaseOffset: 0,
    },
    {
      label: '3D',
      position: [2.25, 0.82, 0.15],
      hoverEmissiveColor: '#43cbb4',
      phaseOffset: 1.6,
    },
    {
      label: 'UX',
      position: [0.32, -0.55, 0.35],
      hoverEmissiveColor: '#43cbb4',
      phaseOffset: 3.2,
    },
    {
      label: '</>',
      position: [2.15, -0.52, 0.35],
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
      {/* Resplandor ambiental suave detrás del avatar (derecha) como en la Imagen 1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_72%_48%,rgba(167,58,217,0.14)_0%,rgba(67,203,180,0.08)_28%,transparent_62%)]"
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
          {/* Controles sin zoom y con ángulos restringidos (Rúbrica) */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            target={[0.55, 0.05, 0]}
            minPolarAngle={Math.PI / 2 - 0.25}
            maxPolarAngle={Math.PI / 2 + 0.2}
            minAzimuthAngle={-0.38}
            maxAzimuthAngle={0.38}
            rotateSpeed={0.6}
          />

          {/* Iluminación de la rúbrica: ambientLight baja + luces #43cbb4 y #a73ad9 */}
          <ambientLight intensity={0.28} />
          <directionalLight
            position={[-2.5, 3.5, 3.5]}
            intensity={2.4}
            color="#43cbb4"
            castShadow
          />
          <directionalLight
            position={[4.5, 2.5, -2.0]}
            intensity={2.8}
            color="#a73ad9"
          />
          <pointLight
            position={[0.4, 0.6, 2.2]}
            intensity={1.6}
            color="#43cbb4"
            distance={6}
          />
          <pointLight
            position={[2.4, 0.5, 1.8]}
            intensity={1.6}
            color="#a73ad9"
            distance={6}
          />

          {/* Modelo FBX animado + Robot 3D de la Imagen 1 */}
          <FBXModelErrorBoundary fallback={<AvatarPlaceholderFallback />}>
            <Suspense fallback={<AvatarPlaceholderFallback />}>
              <AnimatedAvatar url={modelUrl} position={[1.25, -0.22, 0]} />
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
