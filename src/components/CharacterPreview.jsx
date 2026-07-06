import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import RobotModel from './RobotModel.jsx'
import Dog from './Dog.jsx'
import Cat from './Cat.jsx'

function Turntable({ speed = 0.5, children }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })
  return <group ref={ref}>{children}</group>
}

/**
 * 갤러리 카드용 미리보기 — 배경 투명, 캐릭터가 천천히 회전.
 */
export default function CharacterPreview({ id }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [2.6, 1.8, 3.4], fov: 45 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.8, 0)}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#ffffff', '#8090b0', 0.8]} />
        <directionalLight castShadow position={[4, 6, 3]} intensity={1.8} />

        <Turntable speed={0.6}>
          {id === 'robot' && <RobotModel clip="Idle" />}
          {id === 'dog' && <Dog expression="happy" pose="idle" position={[0, 0, 0]} />}
          {id === 'cat' && <Cat expression="happy" pose="idle" position={[0, 0, 0]} />}
        </Turntable>

        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={6} blur={2.5} far={4} />
      </Suspense>
    </Canvas>
  )
}
