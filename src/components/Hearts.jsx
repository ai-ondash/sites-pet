import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const POOL = 16
const SPAWN = 7
const DURATION = 1.1

/**
 * 캐릭터를 쓰다듬을(클릭) 때 튀어오르는 하트 이펙트.
 * trigger 값이 바뀔 때마다 하트 한 무더기를 새로 띄운다. (풀 재사용)
 */
export default function Hearts({ trigger, origin = [0, 1.4, 0] }) {
  const refs = useRef([])
  const state = useRef(
    Array.from({ length: POOL }, () => ({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, rot: 0, rs: 0 })),
  )

  useEffect(() => {
    if (!trigger) return
    let spawned = 0
    for (const s of state.current) {
      if (s.life > 0) continue
      s.life = 1
      s.x = origin[0] + (Math.random() - 0.5) * 0.6
      s.y = origin[1] + (Math.random() - 0.5) * 0.2
      s.z = origin[2] + (Math.random() - 0.5) * 0.4
      s.vx = (Math.random() - 0.5) * 0.6
      s.vy = 1.1 + Math.random() * 0.6
      s.rot = (Math.random() - 0.5) * 0.8
      s.rs = (Math.random() - 0.5) * 3
      if (++spawned >= SPAWN) break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    state.current.forEach((s, i) => {
      const g = refs.current[i]
      if (!g) return
      if (s.life <= 0) {
        g.visible = false
        return
      }
      s.life -= dt / DURATION
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.rot += s.rs * dt
      const env = Math.sin(Math.max(0, s.life) * Math.PI) // 0→1→0
      g.visible = true
      g.position.set(s.x, s.y, s.z)
      g.rotation.z = s.rot
      g.scale.setScalar(0.0001 + env * 0.22)
    })
  })

  return (
    <group>
      {Array.from({ length: POOL }, (_, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} visible={false}>
          <mesh position={[-0.12, 0.08, 0]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color="#ff5d84" emissive="#ff5d84" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.12, 0.08, 0]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color="#ff5d84" emissive="#ff5d84" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.23, 0.3, 12]} />
            <meshStandardMaterial color="#ff5d84" emissive="#ff5d84" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
