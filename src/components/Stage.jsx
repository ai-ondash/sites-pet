import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Stars, OrbitControls, ContactShadows } from '@react-three/drei'
import Ground from './Ground.jsx'
import Loader from './Loader.jsx'

// 배경 테마 프리셋
export const THEMES = {
  day: {
    sky: { sunPosition: [10, 6, -8], turbidity: 6, rayleigh: 2, mieCoefficient: 0.005 },
    fog: ['#cfe0ff', 18, 55],
    ambient: 0.6,
    hemi: ['#dcebff', '#5b6b8c', 0.9],
    dir: { color: '#ffffff', intensity: 2 },
    stars: 0,
  },
  sunset: {
    sky: { sunPosition: [-6, 1.2, -10], turbidity: 10, rayleigh: 3, mieCoefficient: 0.02 },
    fog: ['#ffd2a6', 16, 52],
    ambient: 0.5,
    hemi: ['#ffcaa0', '#5b4a6c', 0.8],
    dir: { color: '#ffb27a', intensity: 1.7 },
    stars: 400,
  },
  night: {
    sky: { sunPosition: [0, -6, -10], turbidity: 12, rayleigh: 0.5, mieCoefficient: 0.003 },
    fog: ['#131a34', 16, 50],
    ambient: 0.28,
    hemi: ['#33436e', '#0a0e1e', 0.7],
    dir: { color: '#9db4ff', intensity: 0.55 },
    stars: 2600,
  },
}

/**
 * 플레이 페이지용 공용 3D 무대 (배경 테마 전환 지원).
 */
export default function Stage({ children, camera, target = [0, 1, 0], theme = 'day' }) {
  const t = THEMES[theme] || THEMES.day
  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={camera}>
        <Suspense fallback={null}>
          <Sky distance={4500} {...t.sky} />
          {t.stars > 0 && (
            <Stars radius={140} depth={50} count={t.stars} factor={4} fade speed={0.6} />
          )}
          <fog attach="fog" args={t.fog} />

          <ambientLight intensity={t.ambient} />
          <hemisphereLight args={t.hemi} />
          <directionalLight
            castShadow
            position={[8, 12, 6]}
            color={t.dir.color}
            intensity={t.dir.intensity}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />

          <Ground />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={40} blur={2} far={10} />

          {children}

          <OrbitControls
            makeDefault
            target={target}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3}
            maxDistance={18}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}
