import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Stars, OrbitControls, ContactShadows } from '@react-three/drei'
import Ground from './Ground.jsx'
import Loader from './Loader.jsx'

/**
 * 플레이 페이지용 공용 3D 무대: 하늘/별 배경 + 조명 + 지면 + 그림자 + 궤도 카메라.
 * children 으로 선택된 캐릭터를 받는다.
 */
export default function Stage({ children, camera, target = [0, 1, 0] }) {
  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={camera}>
        <Suspense fallback={null}>
          <Sky sunPosition={[10, 6, -8]} turbidity={6} rayleigh={2} />
          <Stars radius={120} depth={40} count={2000} factor={3} fade speed={0.5} />
          <fog attach="fog" args={['#cfe0ff', 18, 55]} />

          <ambientLight intensity={0.6} />
          <hemisphereLight args={['#dcebff', '#5b6b8c', 0.9]} />
          <directionalLight
            castShadow
            position={[8, 12, 6]}
            intensity={2}
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
