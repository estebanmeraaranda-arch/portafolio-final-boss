import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, useCursor } from '@react-three/drei';
import * as THREE from 'three';

export interface FloatingDiamondProps {
  label: string;
  position: [number, number, number];
  hoverEmissiveColor?: '#43cbb4' | '#a73ad9';
  phaseOffset?: number;
}

/**
 * Rombos 3D flotantes ("AI", "3D", "UX", "</>") con el tamaño estilizado de la Imagen 1:
 * - Rotación constante sobre su propio eje y oscilación vertical suave con useFrame.
 * - Eventos onPointerOver y onPointerOut: escala a 1.2x y cambia color emisivo a #43cbb4 o #a73ad9.
 */
export default function FloatingDiamond({
  label,
  position,
  hoverEmissiveColor = '#43cbb4',
  phaseOffset = 0,
}: FloatingDiamondProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

  const targetScaleVector = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Leve oscilación vertical
      groupRef.current.position.y =
        position[1] + Math.sin(elapsed * 1.9 + phaseOffset) * 0.09;

      // Escala 1.2x al pasar el cursor (onPointerOver)
      const s = hovered ? 1.2 : 1.0;
      targetScaleVector.set(s, s, s);
      groupRef.current.scale.lerp(targetScaleVector, 0.15);
    }

    if (meshRef.current) {
      // Rotación continua sobre su propio eje
      meshRef.current.rotation.y += delta * (hovered ? 2.2 : 0.95);
      meshRef.current.rotation.x = Math.sin(elapsed * 0.7 + phaseOffset) * 0.2;
    }

    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.5;
      wireRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Núcleo del rombo (se ilumina con emissive en hover) */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial
          color={hovered ? hoverEmissiveColor : '#0d101b'}
          emissive={hovered ? hoverEmissiveColor : '#090b12'}
          emissiveIntensity={hovered ? 1.8 : 0.15}
          metalness={0.85}
          roughness={0.2}
          transparent
          opacity={hovered ? 0.95 : 0.75}
        />
      </mesh>

      {/* Contorno wireframe geométrico fino (como en la Imagen 1) */}
      <mesh ref={wireRef} scale={1.16}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshBasicMaterial
          color={hoverEmissiveColor}
          wireframe
          transparent
          opacity={hovered ? 1.0 : 0.65}
        />
      </mesh>

      {/* Etiqueta técnica ("ARTE 2D", "ANIMACIÓN", "UNITY", "BRANDING") */}
      <Billboard follow={true}>
        <Text
          position={[0, -0.24, 0]}
          fontSize={0.062}
          letterSpacing={0.06}
          fontWeight="bold"
          color={hovered ? '#ffffff' : hoverEmissiveColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#09090f"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
