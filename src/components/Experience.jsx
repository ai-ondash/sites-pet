import { Sky, Stars, OrbitControls, ContactShadows } from '@react-three/drei'
import Character from './Character.jsx'
import Dog from './Dog.jsx'
import Ground from './Ground.jsx'

/**
 * 3D 씬 전체: 배경(하늘/별/구름) + 조명 + 지형 + 캐릭터 + 강아지
 */
export default function Experience({ emote, onEmoteEnd, dog }) {
  return (
    <>
      {/* ---------- 배경 ---------- */}
      {/* 절차적 하늘 (에셋 불필요) */}
      <Sky sunPosition={[10, 6, -8]} turbidity={6} rayleigh={2} />
      <Stars radius={120} depth={40} count={2000} factor={3} fade speed={0.5} />
      <fog attach="fog" args={['#cfe0ff', 18, 55]} />

      {/* ---------- 조명 (에셋/네트워크 불필요) ---------- */}
      <ambientLight intensity={0.6} />
      {/* 하늘색↔지면색 환경광으로 HDRI 없이도 자연스러운 음영 */}
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

      {/* ---------- 지형 & 그림자 ---------- */}
      <Ground />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={40} blur={2} far={10} />

      {/* ---------- 캐릭터 ---------- */}
      <Character emote={emote} onEmoteEnd={onEmoteEnd} />

      {/* ---------- 강아지 (표정·액션 컴패니언) ---------- */}
      <Dog
        position={[2.2, 0, 0.4]}
        expression={dog.expression}
        pose={dog.pose}
        trick={dog.trick}
        onTrickDone={dog.onTrickDone}
      />

      {/* 마우스로 시점 회전/줌 (모바일 터치 지원) */}
      <OrbitControls
        makeDefault
        target={[0, 1, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={18}
        enablePan={false}
      />
    </>
  )
}
