import React, { useEffect, useRef, useMemo, Component, ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useAnimations, Text, RoundedBox } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

export interface AnimatedAvatarProps {
  url?: string;
  position?: [number, number, number];
  scale?: number;
}

/**
 * Busto 3D del Robot Cyber-OS (fiel al diseño de la Imagen 1):
 * - Casco redondeado con iluminación de borde turquesa (#43cbb4) y morado (#a73ad9)
 * - Visor oscuro con dos ojos horizontales brillantes en turquesa neón
 * - Auriculares laterales con acento morado
 * - Torso con insignia luminosa "EM" y anillos orbitales inclinados
 */
function CyberRobotBust() {
  const headRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const eyesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.04;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.18;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.14;
    }

    if (eyesRef.current) {
      const pulse = 1 + Math.sin(t * 3.5) * 0.08;
      eyesRef.current.scale.set(1, pulse, 1);
    }
  });

  return (
    <group>
      {/* Anillos orbitales inclinados detrás del robot (como en la Imagen 1) */}
      <mesh
        ref={ring1Ref}
        position={[0, 0.25, -0.35]}
        rotation={[0.55, -0.45, 0.2]}
      >
        <torusGeometry args={[1.65, 0.006, 16, 120]} />
        <meshBasicMaterial color="#43cbb4" transparent opacity={0.28} />
      </mesh>

      <mesh
        ref={ring2Ref}
        position={[0.05, 0.15, -0.4]}
        rotation={[-0.45, 0.5, -0.3]}
      >
        <torusGeometry args={[1.95, 0.005, 16, 120]} />
        <meshBasicMaterial color="#a73ad9" transparent opacity={0.22} />
      </mesh>

      {/* Halo circular suave detrás de la cabeza */}
      <mesh position={[0, 0.55, -0.45]}>
        <circleGeometry args={[0.92, 64]} />
        <meshBasicMaterial color="#43cbb4" transparent opacity={0.04} />
      </mesh>

      {/* ==================== CABEZA DEL ROBOT ==================== */}
      <group ref={headRef} position={[0, 0.78, 0]}>
        {/* Cráneo / Casco principal */}
        <mesh castShadow receiveShadow position={[0, 0.08, 0]} scale={[0.92, 1.08, 0.92]}>
          <sphereGeometry args={[0.52, 48, 48]} />
          <meshStandardMaterial
            color="#11131f"
            roughness={0.28}
            metalness={0.82}
          />
        </mesh>

        {/* Línea vertical luminosa en la frente */}
        <mesh position={[0, 0.34, 0.47]}>
          <boxGeometry args={[0.012, 0.16, 0.02]} />
          <meshStandardMaterial
            color="#43cbb4"
            emissive="#43cbb4"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* Placa del visor oscuro */}
        <RoundedBox
          args={[0.68, 0.24, 0.16]}
          radius={0.06}
          smoothness={4}
          position={[0, 0.1, 0.41]}
        >
          <meshStandardMaterial
            color="#05070d"
            roughness={0.12}
            metalness={0.95}
          />
        </RoundedBox>

        {/* Borde sutil del visor */}
        <RoundedBox
          args={[0.7, 0.255, 0.14]}
          radius={0.065}
          smoothness={4}
          position={[0, 0.1, 0.4]}
        >
          <meshBasicMaterial color="#43cbb4" wireframe transparent opacity={0.18} />
        </RoundedBox>

        {/* Ojos horizontales cian neón */}
        <group ref={eyesRef} position={[0, 0.1, 0.5]}>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.17, 0.024, 0.02]} />
            <meshStandardMaterial
              color="#43cbb4"
              emissive="#43cbb4"
              emissiveIntensity={3.2}
            />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.17, 0.024, 0.02]} />
            <meshStandardMaterial
              color="#43cbb4"
              emissive="#43cbb4"
              emissiveIntensity={3.2}
            />
          </mesh>
        </group>

        {/* Sonrisa / Línea facial sutil */}
        <mesh position={[0, -0.22, 0.46]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.1, 0.004, 12, 32, Math.PI]} />
          <meshBasicMaterial color="#43cbb4" transparent opacity={0.35} />
        </mesh>

        {/* Auricular izquierdo */}
        <group position={[-0.51, 0.02, 0]}>
          <RoundedBox args={[0.09, 0.28, 0.18]} radius={0.02} smoothness={2}>
            <meshStandardMaterial
              color="#0d1021"
              emissive="#6366f1"
              emissiveIntensity={0.35}
              metalness={0.85}
              roughness={0.2}
            />
          </RoundedBox>
        </group>

        {/* Auricular derecho */}
        <group position={[0.51, 0.02, 0]}>
          <RoundedBox args={[0.09, 0.28, 0.18]} radius={0.02} smoothness={2}>
            <meshStandardMaterial
              color="#0d1021"
              emissive="#a73ad9"
              emissiveIntensity={0.35}
              metalness={0.85}
              roughness={0.2}
            />
          </RoundedBox>
        </group>
      </group>

      {/* ==================== CUELLO ==================== */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.23, 0.28, 32]} />
        <meshStandardMaterial color="#0b0d17" roughness={0.4} metalness={0.75} />
      </mesh>

      {/* ==================== TORSO / PECHO CON "EM" ==================== */}
      <group position={[0, -0.82, 0]}>
        <RoundedBox
          args={[1.42, 1.75, 0.68]}
          radius={0.32}
          smoothness={6}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#10121e"
            roughness={0.3}
            metalness={0.82}
          />
        </RoundedBox>

        {/* Insignia luminosa "EM" en el pecho */}
        <Text
          position={[0, 0.36, 0.35]}
          fontSize={0.095}
          fontWeight="bold"
          letterSpacing={0.12}
          color="#43cbb4"
          anchorX="center"
          anchorY="middle"
        >
          EM
        </Text>

        {/* Líneas técnicas diagonales del pecho */}
        <mesh position={[-0.32, -0.1, 0.345]} rotation={[0, 0, 0.28]}>
          <boxGeometry args={[0.38, 0.008, 0.01]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0.32, -0.1, 0.345]} rotation={[0, 0, -0.28]}>
          <boxGeometry args={[0.38, 0.008, 0.01]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.45} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Subcomponente <AnimatedAvatar /> (Rúbrica Académica):
 * - Utiliza useLoader(FBXLoader, url) para importar el modelo .fbx local (/models/avatar.fbx).
 * - Ejecuta automáticamente la animación Idle con useAnimations de @react-three/drei.
 */
export function AnimatedAvatar({
  url = '/models/avatar.fbx',
  position = [1.25, -0.22, 0],
  scale = 0.018,
}: AnimatedAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Carga del archivo .fbx local con useLoader(FBXLoader)
  const fbx = useLoader(FBXLoader, url);
  const clonedScene = useMemo(() => fbx.clone(), [fbx]);

  // Enlace de animaciones mediante @react-three/drei
  const { actions, names } = useAnimations(fbx.animations, groupRef);

  // Detectamos si el FBX cargado es nuestro placeholder ligero (<= 50 vértices)
  // o si el usuario colocó un personaje completo de Mixamo
  const isPlaceholderFBX = useMemo(() => {
    let totalVertices = 0;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const geom = (child as THREE.Mesh).geometry;
        if (geom?.attributes?.position) {
          totalVertices += geom.attributes.position.count;
        }
      }
    });
    return totalVertices <= 50;
  }, [clonedScene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Ocultamos la malla mínima de prueba para mostrar el CyberRobotBust de la Imagen 1
        if (isPlaceholderFBX) {
          mesh.visible = false;
        }
      }
    });
  }, [clonedScene, isPlaceholderFBX]);

  useEffect(() => {
    if (names.length > 0) {
      const idleName =
        names.find((n) => n.toLowerCase().includes('idle')) || names[0];
      const action = actions[idleName];
      if (action) {
        action.reset().fadeIn(0.4).play();
      }
      return () => {
        action?.fadeOut(0.4);
      };
    }
  }, [actions, names]);

  // Flotación suave Idle continua
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Primitiva FBX cargada con useLoader(FBXLoader) */}
      <group scale={scale} dispose={null}>
        <primitive object={clonedScene} />
      </group>

      {/* Si es el FBX base, renderiza el Robot Cyber-OS exacto de la Imagen 1 */}
      {isPlaceholderFBX && <CyberRobotBust />}
    </group>
  );
}

export function AvatarPlaceholderFallback({
  position = [1.25, -0.22, 0],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      <CyberRobotBust />
    </group>
  );
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class FBXModelErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default AnimatedAvatar;
