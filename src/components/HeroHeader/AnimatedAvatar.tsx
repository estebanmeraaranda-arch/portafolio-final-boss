import React, { useEffect, useRef, useMemo, Component, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export interface AnimatedAvatarProps {
  url?: string;
  position?: [number, number, number];
  scale?: number;
}

interface PolyFace {
  v: number[];
  mat: number;
}

/**
 * Ejecuta una iteración de subdivisión Catmull-Clark sobre una malla poligonal (quads/tris)
 * preservando el índice de material por cara (idéntico al modificador Subdivision Surface de Blender).
 */
function catmullClarkStep(
  vertices: [number, number, number][],
  faces: PolyFace[]
): { vertices: [number, number, number][]; faces: PolyFace[] } {
  const numV = vertices.length;
  const numF = faces.length;

  // 1. Puntos de cara (Face points)
  const facePoints = new Array<[number, number, number]>(numF);
  for (let f = 0; f < numF; f++) {
    const loop = faces[f].v;
    let sx = 0,
      sy = 0,
      sz = 0;
    for (let i = 0; i < loop.length; i++) {
      const v = vertices[loop[i]];
      sx += v[0];
      sy += v[1];
      sz += v[2];
    }
    const inv = 1 / loop.length;
    facePoints[f] = [sx * inv, sy * inv, sz * inv];
  }

  // 2. Aristas y adyacencias (Edge points)
  const edgeMap = new Map<string, number>();
  const edges: Array<{
    a: number;
    b: number;
    faces: number[];
    ep: [number, number, number];
  }> = [];
  const vertFaces = Array.from({ length: numV }, () => [] as number[]);
  const vertEdges = Array.from({ length: numV }, () => [] as number[]);

  function getEdgeIdx(u: number, v: number, fIdx: number): number {
    const a = u < v ? u : v;
    const b = u < v ? v : u;
    const key = `${a}:${b}`;
    let eIdx = edgeMap.get(key);
    if (eIdx === undefined) {
      eIdx = edges.length;
      edges.push({ a, b, faces: [fIdx], ep: [0, 0, 0] });
      edgeMap.set(key, eIdx);
      vertEdges[a].push(eIdx);
      vertEdges[b].push(eIdx);
    } else {
      edges[eIdx].faces.push(fIdx);
    }
    return eIdx;
  }

  const faceEdgeIndices = new Array<number[]>(numF);
  for (let f = 0; f < numF; f++) {
    const loop = faces[f].v;
    const k = loop.length;
    const eLoop = new Array<number>(k);
    for (let i = 0; i < k; i++) {
      const u = loop[i];
      const v = loop[(i + 1) % k];
      vertFaces[u].push(f);
      eLoop[i] = getEdgeIdx(u, v, f);
    }
    faceEdgeIndices[f] = eLoop;
  }

  for (let e = 0; e < edges.length; e++) {
    const ed = edges[e];
    const va = vertices[ed.a];
    const vb = vertices[ed.b];
    if (ed.faces.length === 2) {
      const f1 = facePoints[ed.faces[0]];
      const f2 = facePoints[ed.faces[1]];
      ed.ep = [
        0.25 * (va[0] + vb[0] + f1[0] + f2[0]),
        0.25 * (va[1] + vb[1] + f1[1] + f2[1]),
        0.25 * (va[2] + vb[2] + f1[2] + f2[2]),
      ];
    } else {
      ed.ep = [
        0.5 * (va[0] + vb[0]),
        0.5 * (va[1] + vb[1]),
        0.5 * (va[2] + vb[2]),
      ];
    }
  }

  // 3. Nuevas posiciones para los vértices originales
  const newVertices = new Array<[number, number, number]>(
    numV + numF + edges.length
  );

  for (let v = 0; v < numV; v++) {
    const orig = vertices[v];
    const adjF = vertFaces[v];
    const adjE = vertEdges[v];
    const boundaryEdges = adjE.filter((eIdx) => edges[eIdx].faces.length !== 2);

    if (boundaryEdges.length > 0) {
      if (boundaryEdges.length === 2) {
        const e0 = edges[boundaryEdges[0]];
        const e1 = edges[boundaryEdges[1]];
        const n0 = vertices[e0.a === v ? e0.b : e0.a];
        const n1 = vertices[e1.a === v ? e1.b : e1.a];
        newVertices[v] = [
          0.75 * orig[0] + 0.125 * (n0[0] + n1[0]),
          0.75 * orig[1] + 0.125 * (n0[1] + n1[1]),
          0.75 * orig[2] + 0.125 * (n0[2] + n1[2]),
        ];
      } else {
        newVertices[v] = [orig[0], orig[1], orig[2]];
      }
    } else {
      const n = adjF.length;
      if (n < 3) {
        newVertices[v] = [orig[0], orig[1], orig[2]];
      } else {
        let fx = 0,
          fy = 0,
          fz = 0;
        for (let i = 0; i < n; i++) {
          const fp = facePoints[adjF[i]];
          fx += fp[0];
          fy += fp[1];
          fz += fp[2];
        }
        fx /= n;
        fy /= n;
        fz /= n;

        let rx = 0,
          ry = 0,
          rz = 0;
        const m = adjE.length;
        for (let i = 0; i < m; i++) {
          const ed = edges[adjE[i]];
          const va = vertices[ed.a];
          const vb = vertices[ed.b];
          rx += 0.5 * (va[0] + vb[0]);
          ry += 0.5 * (va[1] + vb[1]);
          rz += 0.5 * (va[2] + vb[2]);
        }
        rx /= m;
        ry /= m;
        rz /= m;

        newVertices[v] = [
          (fx + 2 * rx + (n - 3) * orig[0]) / n,
          (fy + 2 * ry + (n - 3) * orig[1]) / n,
          (fz + 2 * rz + (n - 3) * orig[2]) / n,
        ];
      }
    }
  }

  for (let f = 0; f < numF; f++) {
    newVertices[numV + f] = facePoints[f];
  }
  const edgeOffset = numV + numF;
  for (let e = 0; e < edges.length; e++) {
    newVertices[edgeOffset + e] = edges[e].ep;
  }

  // 4. División de cada polígono en quads hijos
  const newFaces: PolyFace[] = [];
  for (let f = 0; f < numF; f++) {
    const loop = faces[f].v;
    const eLoop = faceEdgeIndices[f];
    const k = loop.length;
    const fPtIdx = numV + f;
    const mat = faces[f].mat;
    for (let i = 0; i < k; i++) {
      const vIdx = loop[i];
      const eNextIdx = edgeOffset + eLoop[i];
      const ePrevIdx = edgeOffset + eLoop[(i - 1 + k) % k];
      newFaces.push({ v: [vIdx, eNextIdx, fPtIdx, ePrevIdx], mat });
    }
  }

  return { vertices: newVertices, faces: newFaces };
}

/**
 * Reconstruye el stack de modificadores de Blender (Mirror en X + Merge + Subdivision Surface
 * Catmull-Clark + Shade Smooth) sobre un nodo del GLB (ya sea un Mesh individual o un Group
 * multi-material como Cabeza, Cuerpo, Orejas o Cola).
 */
function reconstructBlenderModifiersOnNode(
  meshes: THREE.Mesh[],
  isMirrored: boolean,
  subdivLevels: number
) {
  const vertices: [number, number, number][] = [];
  const vertMap = new Map<string, number>();

  function getOrAddVert(x: number, y: number, z: number): number {
    if (isMirrored && Math.abs(x) < 0.001) {
      x = 0;
    }
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    let idx = vertMap.get(key);
    if (idx === undefined) {
      idx = vertices.length;
      vertices.push([x, y, z]);
      vertMap.set(key, idx);
    }
    return idx;
  }

  let faces: PolyFace[] = [];

  meshes.forEach((mesh, matSlot) => {
    const geo = mesh.geometry;
    const posAttr = geo.attributes.position;
    if (!posAttr) return;

    const rawVerts: [number, number, number][] = [];
    for (let i = 0; i < posAttr.count; i++) {
      rawVerts.push([posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)]);
    }

    const idxAttr = geo.index;
    const triCount = idxAttr ? idxAttr.count : posAttr.count;
    const tris: [number, number, number][] = [];

    for (let i = 0; i < triCount; i += 3) {
      const ia = idxAttr ? idxAttr.getX(i) : i;
      const ib = idxAttr ? idxAttr.getX(i + 1) : i + 1;
      const ic = idxAttr ? idxAttr.getX(i + 2) : i + 2;
      const va = rawVerts[ia];
      const vb = rawVerts[ib];
      const vc = rawVerts[ic];

      // Descartamos caras residuales del lado -X antes de espejar el lado +X
      if (isMirrored && (va[0] < -0.005 || vb[0] < -0.005 || vc[0] < -0.005)) {
        continue;
      }

      const a = getOrAddVert(va[0], va[1], va[2]);
      const b = getOrAddVert(vb[0], vb[1], vb[2]);
      const c = getOrAddVert(vc[0], vc[1], vc[2]);
      if (a !== b && b !== c && c !== a) {
        tris.push([a, b, c]);
      }
    }

    // Reconstruimos los quads originales de Blender a partir de pares de triángulos consecutivos
    for (let t = 0; t < tris.length; ) {
      if (t + 1 < tris.length) {
        const t1 = tris[t];
        const t2 = tris[t + 1];
        let quad: number[] | null = null;
        for (let i = 0; i < 3 && !quad; i++) {
          const u = t1[i];
          const v = t1[(i + 1) % 3];
          const w = t1[(i + 2) % 3];
          for (let j = 0; j < 3; j++) {
            if (t2[j] === v && t2[(j + 1) % 3] === u) {
              const opp = t2[(j + 2) % 3];
              if (opp !== w) {
                quad = [w, u, opp, v];
                break;
              }
            }
          }
        }
        if (quad) {
          faces.push({ v: quad, mat: matSlot });
          t += 2;
          continue;
        }
      }
      faces.push({ v: tris[t], mat: matSlot });
      t += 1;
    }
  });

  // Aplicamos el Mirror Modifier en X = 0 con Merge/Clipping
  if (isMirrored) {
    const origFaceCount = faces.length;
    for (let f = 0; f < origFaceCount; f++) {
      const face = faces[f];
      const mirroredLoop: number[] = [];
      for (let k = face.v.length - 1; k >= 0; k--) {
        const [vx, vy, vz] = vertices[face.v[k]];
        mirroredLoop.push(getOrAddVert(-vx, vy, vz));
      }
      faces.push({ v: mirroredLoop, mat: face.mat });
    }
  }

  // Aplicamos Catmull-Clark Subdivision Surface
  let currentVerts = vertices;
  let currentFaces = faces;
  for (let step = 0; step < subdivLevels; step++) {
    const res = catmullClarkStep(currentVerts, currentFaces);
    currentVerts = res.vertices;
    currentFaces = res.faces;
  }

  // Calculamos normales suaves unificadas (Shade Smooth) compartidas entre materiales adyacentes
  const numV = currentVerts.length;
  const normals = new Float32Array(numV * 3);

  for (let f = 0; f < currentFaces.length; f++) {
    const loop = currentFaces[f].v;
    const v0 = currentVerts[loop[0]];
    for (let i = 1; i < loop.length - 1; i++) {
      const v1 = currentVerts[loop[i]];
      const v2 = currentVerts[loop[i + 1]];
      const ax = v1[0] - v0[0],
        ay = v1[1] - v0[1],
        az = v1[2] - v0[2];
      const bx = v2[0] - v0[0],
        by = v2[1] - v0[1],
        bz = v2[2] - v0[2];
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;

      const triVerts = [loop[0], loop[i], loop[i + 1]];
      for (let k = 0; k < 3; k++) {
        const vi = triVerts[k] * 3;
        normals[vi] += nx;
        normals[vi + 1] += ny;
        normals[vi + 2] += nz;
      }
    }
  }

  for (let v = 0; v < numV; v++) {
    const vi = v * 3;
    const nx = normals[vi],
      ny = normals[vi + 1],
      nz = normals[vi + 2];
    const len = Math.hypot(nx, ny, nz) || 1;
    normals[vi] = nx / len;
    normals[vi + 1] = ny / len;
    normals[vi + 2] = nz / len;
  }

  // Reconstruimos la BufferGeometry de cada primitiva de material
  const flatPositions = new Float32Array(numV * 3);
  for (let v = 0; v < numV; v++) {
    flatPositions[v * 3] = currentVerts[v][0];
    flatPositions[v * 3 + 1] = currentVerts[v][1];
    flatPositions[v * 3 + 2] = currentVerts[v][2];
  }

  const sharedPosAttr = new THREE.BufferAttribute(flatPositions, 3);
  const sharedNormAttr = new THREE.BufferAttribute(normals, 3);

  meshes.forEach((mesh, matSlot) => {
    const indices: number[] = [];
    for (let f = 0; f < currentFaces.length; f++) {
      const face = currentFaces[f];
      if (face.mat !== matSlot) continue;
      const loop = face.v;
      for (let i = 1; i < loop.length - 1; i++) {
        indices.push(loop[0], loop[i], loop[i + 1]);
      }
    }

    const newGeo = new THREE.BufferGeometry();
    newGeo.setAttribute('position', sharedPosAttr);
    newGeo.setAttribute('normal', sharedNormAttr);
    newGeo.setIndex(indices);
    newGeo.computeBoundingBox();
    newGeo.computeBoundingSphere();
    mesh.geometry = newGeo;
  });
}

/**
 * Anillos orbitales Cyber-OS detrás del avatar para mantener la estética espacial del Hero.
 */
function CyberOrbitalRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.18;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.14;
    }
  });

  return (
    <group>
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

      <mesh position={[0, 0.35, -0.45]}>
        <circleGeometry args={[0.92, 64]} />
        <meshBasicMaterial color="#43cbb4" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

/**
 * Fallback visual en caso de carga o error de red.
 */
function CyberRobotBust() {
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.04;
    }
    if (eyesRef.current) {
      const pulse = 1 + Math.sin(t * 3.5) * 0.08;
      eyesRef.current.scale.set(1, pulse, 1);
    }
  });

  return (
    <group>
      <CyberOrbitalRings />
      <group ref={headRef} position={[0, 0.78, 0]}>
        <mesh position={[0, 0.08, 0]} scale={[0.92, 1.08, 0.92]}>
          <sphereGeometry args={[0.52, 48, 48]} />
          <meshStandardMaterial color="#11131f" roughness={0.28} metalness={0.82} />
        </mesh>
        <RoundedBox args={[0.68, 0.24, 0.16]} radius={0.06} smoothness={4} position={[0, 0.1, 0.41]}>
          <meshStandardMaterial color="#05070d" roughness={0.12} metalness={0.95} />
        </RoundedBox>
        <group ref={eyesRef} position={[0, 0.1, 0.5]}>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.17, 0.024, 0.02]} />
            <meshStandardMaterial color="#43cbb4" emissive="#43cbb4" emissiveIntensity={3.2} />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.17, 0.024, 0.02]} />
            <meshStandardMaterial color="#43cbb4" emissive="#43cbb4" emissiveIntensity={3.2} />
          </mesh>
        </group>
      </group>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.19, 0.23, 0.28, 32]} />
        <meshStandardMaterial color="#0b0d17" roughness={0.4} metalness={0.75} />
      </mesh>
      <group position={[0, -0.82, 0]}>
        <RoundedBox args={[1.42, 1.75, 0.68]} radius={0.32} smoothness={6}>
          <meshStandardMaterial color="#10121e" roughness={0.3} metalness={0.82} />
        </RoundedBox>
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
      </group>
    </group>
  );
}

/**
 * Subcomponente <AnimatedAvatar />:
 * - Carga el modelo local `/models/Zorrito.glb` con useGLTF de @react-three/drei.
 * - Aplica automáticamente Mirror + Merge + Subdivision Surface (Catmull-Clark) + Shade Smooth
 *   para que el modelo luzca exactamente igual que en el Viewport de Blender.
 */
export function AnimatedAvatar({
  url = '/models/Zorrito.glb',
  position = [1.45, -0.22, 0],
  scale = 1.18,
}: AnimatedAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Object3D | null>(null);

  const gltf = useGLTF(url);

  const clonedScene = useMemo(() => {
    const root = gltf.scene.clone(true);

    // Recorremos cada objeto raíz de la escena (Cabeza, Cola, Corbata, Cuerpo, Orejas, Plano)
    root.children.forEach((node) => {
      const nodeMeshes: THREE.Mesh[] = [];
      node.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          // Desactivamos receiveShadow sobre el propio personaje para eliminar las rayas de shadow-acne
          m.castShadow = false;
          m.receiveShadow = false;
          const mat = m.material as THREE.MeshStandardMaterial | undefined;
          if (mat) {
            mat.side = THREE.DoubleSide;
            mat.flatShading = false;
            mat.needsUpdate = true;
          }
          nodeMeshes.push(m);
        }
      });

      if (nodeMeshes.length === 0) return;

      // Calculamos el boundingBox combinado y total de triángulos del nodo
      const combinedBox = new THREE.Box3();
      let totalVertices = 0;
      nodeMeshes.forEach((m) => {
        m.geometry.computeBoundingBox();
        if (m.geometry.boundingBox) {
          combinedBox.union(m.geometry.boundingBox);
        }
        totalVertices += m.geometry.attributes.position?.count || 0;
      });

      const isCola = node.name.toLowerCase().includes('cola');
      const isHalfMesh =
        !isCola && combinedBox.min.x >= -0.05 && combinedBox.max.x > 0.05;

      // Si el nodo tiene pocos vértices (< 1500, es decir la jaula base sin subdividir de Blender),
      // aplicamos 2 niveles de subdivisión Catmull-Clark; si ya está subdividido (ej. Plano), 0 niveles (solo Mirror + Smooth Normals).
      const subdivLevels = totalVertices < 1500 ? 2 : 0;

      reconstructBlenderModifiersOnNode(nodeMeshes, isHalfMesh, subdivLevels);
    });

    return root;
  }, [gltf.scene]);

  const { actions, names } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    tailRef.current = clonedScene.getObjectByName('Cola') || null;
  }, [clonedScene]);

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

  // Animación Idle continua (flotación suave, giro sutil hacia la cámara y movimiento de cola)
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.045;
    }

    if (characterRef.current) {
      characterRef.current.rotation.y = -0.24 + Math.sin(t * 0.85) * 0.12;
      characterRef.current.rotation.z = Math.sin(t * 1.1) * 0.018;
    }

    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 3.2) * 0.14;
      tailRef.current.rotation.y = Math.cos(t * 2.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <CyberOrbitalRings />

      {/* Modelo 3D Zorrito.glb con subdivisión Catmull-Clark y sombreado suave */}
      <group
        ref={characterRef}
        position={[0, 0.38, 0]}
        scale={scale}
        dispose={null}
      >
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload('/models/Zorrito.glb');

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
