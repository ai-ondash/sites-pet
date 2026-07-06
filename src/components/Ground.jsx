import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 간단한 격자 무늬 지면. 원한다면 .glb 지형 모델로 교체하세요.
 */
export default function Ground() {
  const grid = useMemo(
    () => new THREE.GridHelper(60, 60, '#8aa0c8', '#b9c8e6'),
    [],
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#e7eefc" roughness={0.9} metalness={0} />
      </mesh>
      <primitive object={grid} position={[0, 0.02, 0]} />
    </group>
  )
}
