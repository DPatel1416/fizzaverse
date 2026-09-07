"use client";
import { useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  InstancedMesh,
  Object3D,
  Shape,
  Vector3,
  SphereGeometry,
  LatheGeometry,
  Vector2,
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import { seeded } from "@/lib/quality";
import { fruitSurface } from "../materials/fruitSurface";
export function StrawberryModel() {
  const { body, seedPositions, leaf } = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0, -0.61, 0),
      new Vector3(0.09, -0.56, 0),
      new Vector3(0.22, -0.4, 0),
      new Vector3(0.34, -0.2, 0),
      new Vector3(0.415, 0.04, 0),
      new Vector3(0.42, 0.21, 0),
      new Vector3(0.35, 0.36, 0),
      new Vector3(0.22, 0.405, 0),
      new Vector3(0, 0.375, 0),
    ]);
    const profile = curve
      .getPoints(80)
      .map((p) => new Vector2(Math.max(0, p.x), p.y));
    const random = seeded(72);
    const seedPositions: Vector3[] = [];
    const radiusAt = (y: number) => {
      for (let i = 0; i < profile.length - 1; i++) {
        const a = profile[i],
          b = profile[i + 1];
        if (y >= a.y && y <= b.y)
          return a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y);
      }
      return 0.2;
    };
    for (let row = 0; row < 11; row++) {
      const y = -0.49 + row * 0.077,
        r = radiusAt(y),
        count = Math.max(5, Math.floor((2 * Math.PI * r) / 0.095));
      for (let i = 0; i < count; i++) {
        const angle =
          ((i + (row % 2) * 0.5) * Math.PI * 2) / count +
          (random() - 0.5) * 0.045;
        const yy = y + (random() - 0.5) * 0.018;
        const rr =
          radiusAt(yy) *
          (1 + 0.025 * Math.cos(angle * 3) + 0.014 * Math.sin(angle * 7));
        seedPositions.push(
          new Vector3(Math.sin(angle) * rr, yy, Math.cos(angle) * rr),
        );
      }
    }
    const body = new LatheGeometry(profile, 96);
    const p = body.attributes.position;
    const colors = [];
    const color = new Color();
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const angle = Math.atan2(x, z),
        r = Math.hypot(x, z),
        variation =
          1 + 0.025 * Math.cos(angle * 3) + 0.014 * Math.sin(angle * 7);
      x *= variation;
      z *= variation;
      let dent = 0;
      for (const seed of seedPositions) {
        const distance =
          (x - seed.x) ** 2 + (y - seed.y) ** 2 + (z - seed.z) ** 2;
        dent += 0.013 * Math.exp(-distance / 0.00055);
      }
      if (r > 0.02) {
        const scale = 1 - dent / r;
        x *= scale;
        z *= scale;
      }
      p.setXYZ(i, x, y, z);
      color.setHSL(
        0.985 + (y + 0.6) * 0.009,
        0.83,
        0.34 + 0.055 * Math.sin(angle * 2 + y * 5) + random() * 0.022,
      );
      colors.push(color.r, color.g, color.b);
    }
    body.setAttribute("color", new Float32BufferAttribute(colors, 3));
    body.computeVertexNormals();
    const vertices: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12,
        width = Math.sin(Math.PI * t) * 0.083;
      for (const side of [-1, 1])
        vertices.push(
          side * width,
          0.055 * Math.sin(t * Math.PI) - t * t * 0.065,
          t * 0.36,
        );
      if (i < 12) {
        const n = i * 2;
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
    const leaf = new BufferGeometry();
    leaf.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    leaf.setIndex(indices);
    leaf.computeVertexNormals();
    return { body, seedPositions, leaf };
  }, []);
  const seeds = useRef<InstancedMesh>(null);
  useEffect(() => {
    const o = new Object3D();
    seedPositions.forEach((position, i) => {
      o.position.copy(position).multiply(new Vector3(0.99, 1, 0.99));
      o.lookAt(new Vector3(position.x * 3, position.y - 0.1, position.z * 3));
      o.scale.set(0.008, 0.015, 0.004);
      o.updateMatrix();
      seeds.current!.setMatrixAt(i, o.matrix);
    });
    seeds.current!.instanceMatrix.needsUpdate = true;
  }, [seedPositions]);
  useEffect(
    () => () => {
      body.dispose();
      leaf.dispose();
    },
    [body, leaf],
  );
  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial
          vertexColors
          bumpMap={fruitSurface("berry")}
          bumpScale={0.006}
          roughness={0.43}
          clearcoat={0.28}
          clearcoatRoughness={0.35}
        />
      </mesh>
      <instancedMesh
        ref={seeds}
        args={[undefined, undefined, seedPositions.length]}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#bc8d45" roughness={0.66} />
      </instancedMesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          geometry={leaf}
          position={[0, 0.4, 0]}
          rotation={[-0.15 + (i % 3) * 0.1, (i * Math.PI * 2) / 7, 0.05]}
          scale={0.82 + (i % 3) * 0.12}
        >
          <meshStandardMaterial
            color={i % 2 ? "#416f27" : "#315d20"}
            roughness={0.72}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[0.025, 0.46, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.018, 0.027, 0.17, 8]} />
        <meshStandardMaterial color="#507332" roughness={0.8} />
      </mesh>
    </group>
  );
}
export function CitrusSlice({
  kind = "lemon",
}: {
  kind?: "lemon" | "lime" | "orange";
}) {
  const color =
    kind === "orange" ? "#ffa51f" : kind === "lime" ? "#9ebc25" : "#f7cb26";
  const pulp =
    kind === "orange" ? "#ffb23e" : kind === "lime" ? "#d5e077" : "#ffe579";
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.15, 64]} />
        <meshStandardMaterial
          color={color}
          bumpMap={fruitSurface("peel")}
          bumpScale={0.023}
          roughness={0.48}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.51, 0.51, 0.157, 64]} />
        <meshStandardMaterial color="#fff4c6" roughness={0.46} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 5, 0]}>
          <mesh>
            <cylinderGeometry
              args={[
                0.47,
                0.47,
                0.164,
                12,
                1,
                false,
                0.035,
                Math.PI / 5 - 0.07,
              ]}
            />
            <meshPhysicalMaterial
              color={pulp}
              bumpMap={fruitSurface("pulp")}
              bumpScale={0.012}
              roughness={0.3}
              clearcoat={0.5}
              transmission={0.06}
              thickness={0.1}
            />
          </mesh>
          {[0, 1, 2, 3].map((j) => (
            <mesh
              key={j}
              position={[
                Math.sin(0.12 + j * 0.1) * 0.28,
                0.086,
                Math.cos(0.12 + j * 0.1) * 0.28,
              ]}
              rotation={[0, -0.15, 0]}
              scale={[0.011, 0.004, 0.14]}
            >
              <sphereGeometry args={[1, 6, 4]} />
              <meshStandardMaterial color="#fff4b9" transparent opacity={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh>
        <cylinderGeometry args={[0.043, 0.043, 0.17, 16]} />
        <meshStandardMaterial color="#fff8dd" />
      </mesh>
    </group>
  );
}
export function CherryModel() {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0, 0.2, 0),
        new Vector3(0.03, 0.57, 0),
        new Vector3(0.23, 0.85, 0.04),
      ]),
    [],
  );
  return (
    <group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.24, side * 0.055, 0]}
          rotation={[0, 0, side * 0.2]}
        >
          <mesh scale={[1, 0.94, 1]}>
            <sphereGeometry args={[0.29, 28, 24]} />
            <meshPhysicalMaterial
              color={side === 1 ? "#a90c2b" : "#d01b37"}
              roughness={0.2}
              clearcoat={1}
            />
          </mesh>
          <mesh>
            <tubeGeometry args={[curve, 20, 0.016, 7, false]} />
            <meshStandardMaterial color="#577a31" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export function GrapeCluster() {
  const random = seeded(55);
  return (
    <group>
      {Array.from({ length: 13 }, (_, i) => {
        const row = Math.floor(i / 4),
          angle = i * 2.4;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * (0.29 - row * 0.055),
              0.45 - row * 0.3,
              Math.sin(angle) * 0.23,
            ]}
            scale={0.85 + random() * 0.25}
          >
            <sphereGeometry args={[0.23, 20, 16]} />
            <meshPhysicalMaterial
              color={new Color("#7d3996").offsetHSL(
                random() * 0.04,
                0,
                random() * 0.08,
              )}
              roughness={0.32}
              clearcoat={0.55}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 0.66, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.023, 0.035, 0.25, 8]} />
        <meshStandardMaterial color="#4b7030" />
      </mesh>
    </group>
  );
}
export function WatermelonSlice() {
  const shape = useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0.5);
    s.lineTo(-0.65, -0.4);
    s.quadraticCurveTo(0, -0.68, 0.65, -0.4);
    s.closePath();
    return s;
  }, []);
  return (
    <group>
      {[
        { s: 1, z: 0, c: "#3d893f", d: 0.21 },
        { s: 0.93, z: 0.023, c: "#e6ecb0", d: 0.21 },
        { s: 0.85, z: 0.046, c: "#f75372", d: 0.21 },
      ].map((o) => (
        <mesh key={o.c} scale={o.s} position={[0, 0, o.z]}>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: o.d,
                bevelEnabled: true,
                bevelSize: 0.02,
                bevelThickness: 0.015,
                bevelSegments: 3,
                steps: 1,
              },
            ]}
          />
          <meshPhysicalMaterial color={o.c} roughness={0.4} clearcoat={0.35} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[
            ((i % 3) - 1) * 0.18,
            -0.24 + Math.floor(i / 3) * 0.17,
            0.245,
          ]}
          scale={[0.018, 0.04, 0.012]}
          rotation={[0, 0, ((i % 3) - 1) * -0.4]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#482e32" />
        </mesh>
      ))}
    </group>
  );
}
