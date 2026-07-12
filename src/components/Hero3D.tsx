'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, Float, ContactShadows, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

function RotatingContainer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate slowly on the Y axis
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* The main container body (sleek cylinder) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.6, 3.5, 64]} />
        <meshStandardMaterial 
            color="#040A07" 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={2}
        />
      </mesh>
      
      {/* Gold Accent Rim Top */}
      <mesh position={[0, 1.76, 0]}>
        <cylinderGeometry args={[1.82, 1.82, 0.05, 64]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Gold Accent Rim Bottom */}
      <mesh position={[0, -1.76, 0]}>
        <cylinderGeometry args={[1.62, 1.62, 0.05, 64]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
      </mesh>

      {/* Premium Food Lid */}
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[1.85, 1.85, 0.3, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* Front Logo Badge */}
      <group position={[0, 0, 1.73]}>
        {/* Badge Background to look like a stamp/plate */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} />
          <meshStandardMaterial color="#040A07" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Gold Outer Ring */}
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[0.45, 0.02, 16, 64]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
        </mesh>

        {/* Gold 'F' */}
        <Text
          position={[0, 0, 0.025]}
          fontSize={0.55}
          color="#d4af37"
          font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PweD.woff"
          fontWeight={700}
          anchorX="center"
          anchorY="middle"
        >
          F
        </Text>
      </group>

      {/* Back Logo Badge */}
      <group position={[0, 0, -1.73]} rotation={[0, Math.PI, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} />
          <meshStandardMaterial color="#040A07" metalness={0.9} roughness={0.1} />
        </mesh>
        
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[0.45, 0.02, 16, 64]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
        </mesh>

        <Text
          position={[0, 0, 0.025]}
          fontSize={0.55}
          color="#d4af37"
          font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PweD.woff"
          fontWeight={700}
          anchorX="center"
          anchorY="middle"
        >
          F
        </Text>
      </group>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas shadows camera={{ position: [0, 2, 7], fov: 45 }}>
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#d4af37" />
        
        {/* Environment map for realistic reflections */}
        <Environment preset="city" />

        {/* PresentationControls allows the user to click and drag to look around the object slightly */}
        <PresentationControls 
          global 
          rotation={[0.13, 0.1, 0]} 
          polar={[-0.4, 0.2]} 
          azimuth={[-1, 0.75]}
        >
          <Float speed={2} rotationIntensity={0.2} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
            <RotatingContainer />
          </Float>
        </PresentationControls>

        {/* Soft shadow directly underneath the object */}
        <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#d4af37" />
      </Canvas>
    </div>
  );
}
