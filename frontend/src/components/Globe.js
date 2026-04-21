import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
import { useEffect, useState } from "react";

// Convert lat/lng → 3D position di bola
function latLngToVector3(lat, lng, radius = 1.82) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

function Earth({ threats }) {
  const texture = useLoader(
    TextureLoader,
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
  );

  return (
    <>
      {/* 🌍 EARTH */}
      <mesh>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* 🔴 ATTACK POINTS */}
      {threats.map((t, i) => {
        if (!t.lat || !t.lng) return null;

        const pos = latLngToVector3(t.lat, t.lng);
        const color =
          t.threat === "malicious"
            ? "#ef4444"
            : t.threat === "suspicious"
            ? "#f59e0b"
            : "#22c55e";

        return (
          <group key={i} position={pos}>
            {/* titik solid */}
            <mesh>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* glow outer */}
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export default function Globe() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    const fetchThreats = () => {
      fetch("/api/threats")
        .then((res) => res.json())
        .then((data) => {
          console.log("🌍 Threats loaded:", data); // 🔍 debug
          setThreats(data);
        })
        .catch((err) => console.error("Threats fetch error:", err));
    };

    fetchThreats();
    const interval = setInterval(fetchThreats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <Earth threats={threats} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  );
}