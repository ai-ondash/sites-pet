import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 코드로 만든 귀여운 스타일라이즈드 고양이.
 * - 표정: happy / grumpy / curious / sleepy / love / neutral
 * - 자세: idle / walk / sit
 * - 묘기: jump(점프) / purr(갸르릉 — 몸을 떨며 만족)
 */

const EXPRESSIONS = {
  neutral:   { eye: 1.0,  ear: 0.0,  mouth: 0.1, head: 0.0,   brow: 0.0,  tail: 3,  cheek: 0 },
  happy:     { eye: 1.0,  ear: 0.15, mouth: 0.5, head: 0.02,  brow: 0.1,  tail: 8,  cheek: 0.3 },
  grumpy:    { eye: 0.5,  ear: -0.8, mouth: 0.0, head: -0.05, brow: -0.45, tail: 13, cheek: 0 },
  curious:   { eye: 1.35, ear: 0.35, mouth: 0.2, head: 0.14,  brow: 0.25, tail: 5,  cheek: 0 },
  sleepy:    { eye: 0.07, ear: -0.35, mouth: 0.0, head: -0.13, brow: -0.05, tail: 1, cheek: 0 },
  love:      { eye: 0.12, ear: 0.2,  mouth: 0.5, head: 0.04,  brow: 0.15, tail: 11, cheek: 0.6 },
}

const FUR = '#9aa1b3'
const FUR_DARK = '#6f7688'
const CREAM = '#eaedf5'
const NOSE = '#e79bb0'
const EYE = '#39a86e'
const PUPIL = '#1c221b'
const CHEEK = '#ff9db0'
const WHISKER = '#f2f4fa'

const damp = (c, t, l, dt) => THREE.MathUtils.damp(c, t, l, dt)

export default function Cat({
  expression = 'happy',
  pose = 'idle',
  trick = null,
  onTrickDone,
  position = [0, 0, 0],
  onClick,
}) {
  const root = useRef()
  const head = useRef()
  const earL = useRef()
  const earR = useRef()
  const eyeL = useRef()
  const eyeR = useRef()
  const browL = useRef()
  const browR = useRef()
  const mouth = useRef()
  const cheekL = useRef()
  const cheekR = useRef()
  const tail = useRef()
  const legFL = useRef()
  const legFR = useRef()
  const legBL = useRef()
  const legBR = useRef()

  const cur = useMemo(
    () => ({ eye: 1, ear: 0, mouth: 0.1, head: 0, brow: 0, cheek: 0, sit: 0, walk: 0 }),
    [],
  )
  const clock = useRef(0)
  const blink = useRef({ next: 2.5, amount: 0 })
  const trickState = useRef({ kind: null, t: 0 })

  useEffect(() => {
    if (trick) trickState.current = { kind: trick, t: 0 }
  }, [trick])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    clock.current += dt
    const t = clock.current
    const g = root.current
    if (!g) return

    const expr = EXPRESSIONS[expression] || EXPRESSIONS.neutral
    const isWalk = pose === 'walk'
    const isSit = pose === 'sit'

    cur.eye = damp(cur.eye, expr.eye, 10, dt)
    cur.ear = damp(cur.ear, expr.ear, 8, dt)
    cur.mouth = damp(cur.mouth, expr.mouth, 10, dt)
    cur.head = damp(cur.head, expr.head, 8, dt)
    cur.brow = damp(cur.brow, expr.brow, 8, dt)
    cur.cheek = damp(cur.cheek, expr.cheek, 8, dt)
    cur.sit = damp(cur.sit, isSit ? 1 : 0, 8, dt)
    cur.walk = damp(cur.walk, isWalk ? 1 : 0, 10, dt)

    // 깜빡임
    blink.current.next -= dt
    if (blink.current.next <= 0) {
      blink.current.amount = 1
      blink.current.next = 2.5 + Math.random() * 3
    }
    blink.current.amount = Math.max(0, blink.current.amount - dt * 8)

    // purr 중엔 눈을 지그시 감음
    const ts = trickState.current
    const purrSquint = ts.kind === 'purr' ? 0.5 : 0

    const eyeOpen = Math.max(0.05, cur.eye * (1 - blink.current.amount * 0.9) * (1 - purrSquint))
    if (eyeL.current) eyeL.current.scale.y = eyeOpen
    if (eyeR.current) eyeR.current.scale.y = eyeOpen

    if (browL.current) browL.current.rotation.z = cur.brow
    if (browR.current) browR.current.rotation.z = -cur.brow

    if (mouth.current) mouth.current.scale.y = 0.15 + cur.mouth * 0.7

    if (cheekL.current) {
      cheekL.current.material.opacity = cur.cheek
      cheekR.current.material.opacity = cur.cheek
    }

    // 귀: 양수=쫑긋/앞으로, 음수=뒤로 눕힘
    const earFlick = Math.sin(t * 5) * 0.05 * cur.walk
    if (earL.current) earL.current.rotation.x = -cur.ear + earFlick
    if (earR.current) earR.current.rotation.x = -cur.ear - earFlick

    if (head.current) {
      head.current.rotation.x = cur.head
      head.current.rotation.z = Math.sin(t * 1.2) * 0.05 * (1 - cur.walk)
    }

    // 꼬리: 길고 위로 말린 채 살랑 (기분따라 속도)
    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * (expr.tail || 3)) * 0.5
      tail.current.rotation.x = -1.1 + cur.sit * 0.3
    }

    // 다리 스윙
    const swing = Math.sin(t * 9) * 0.7 * cur.walk
    const fold = cur.sit * 1.3
    if (legFL.current) legFL.current.rotation.x = swing
    if (legFR.current) legFR.current.rotation.x = -swing
    if (legBL.current) legBL.current.rotation.x = -swing + fold
    if (legBR.current) legBR.current.rotation.x = swing + fold

    // 자세
    let baseY = 0
    let pitch = 0
    const breathe = Math.sin(t * 2) * 0.02 * (1 - cur.walk)
    const bounce = Math.abs(Math.sin(t * 9)) * 0.06 * cur.walk
    baseY += breathe + bounce
    pitch += cur.sit * 0.3
    baseY -= cur.sit * 0.1

    // 묘기
    let spinY = 0
    if (ts.kind === 'jump') {
      const DUR = 0.7
      ts.t += dt
      const p = Math.min(1, ts.t / DUR)
      baseY += Math.sin(p * Math.PI) * 0.95
      pitch -= Math.sin(p * Math.PI) * 0.12
      if (p >= 1) { trickState.current = { kind: null, t: 0 }; onTrickDone && onTrickDone() }
    } else if (ts.kind === 'purr') {
      const DUR = 1.6
      ts.t += dt
      const p = Math.min(1, ts.t / DUR)
      baseY += Math.sin(t * 40) * 0.012 // 갸르릉 진동
      if (p >= 1) { trickState.current = { kind: null, t: 0 }; onTrickDone && onTrickDone() }
    }

    g.position.y = baseY
    g.rotation.x = pitch
    g.rotation.y = spinY
  })

  return (
    <group position={position} onClick={onClick} onPointerDown={onClick}>
      <group ref={root}>
        {/* 몸통 (고양이는 좀 더 날씬) */}
        <mesh castShadow position={[0, 0.6, 0]} scale={[0.55, 0.48, 0.82]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.48, 0.1]} scale={[0.4, 0.32, 0.5]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>

        {/* 다리 */}
        {[
          { ref: legFL, pos: [-0.26, 0.4, 0.32] },
          { ref: legFR, pos: [0.26, 0.4, 0.32] },
          { ref: legBL, pos: [-0.26, 0.4, -0.32] },
          { ref: legBR, pos: [0.26, 0.4, -0.32] },
        ].map((l, i) => (
          <group key={i} ref={l.ref} position={l.pos}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.1, 0.22, 6, 12]} />
              <meshStandardMaterial color={FUR} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.36, 0.02]} scale={[1, 0.7, 1.1]}>
              <sphereGeometry args={[0.11, 16, 12]} />
              <meshStandardMaterial color={CREAM} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* 꼬리 (길고 위로 말림) */}
        <group ref={tail} position={[0, 0.7, -0.6]} rotation={[-1.1, 0, 0]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <capsuleGeometry args={[0.06, 0.5, 6, 10]} />
            <meshStandardMaterial color={FUR} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.58, 0]}>
            <sphereGeometry args={[0.075, 12, 10]} />
            <meshStandardMaterial color={FUR_DARK} roughness={0.85} />
          </mesh>
        </group>

        {/* 머리 */}
        <group ref={head} position={[0, 1.0, 0.46]}>
          <mesh castShadow scale={[0.42, 0.4, 0.4]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={FUR} roughness={0.85} />
          </mesh>

          {/* 주둥이(작게) */}
          <mesh position={[0, -0.1, 0.34]} scale={[0.26, 0.2, 0.22]}>
            <sphereGeometry args={[1, 24, 18]} />
            <meshStandardMaterial color={CREAM} roughness={0.9} />
          </mesh>
          {/* 코 */}
          <mesh position={[0, -0.04, 0.52]}>
            <coneGeometry args={[0.055, 0.06, 12]} />
            <meshStandardMaterial color={NOSE} roughness={0.5} />
          </mesh>
          {/* 입 */}
          <mesh ref={mouth} position={[0, -0.18, 0.46]}>
            <boxGeometry args={[0.12, 0.08, 0.02]} />
            <meshStandardMaterial color={FUR_DARK} roughness={0.6} />
          </mesh>

          {/* 수염 */}
          {[-1, 1].map((side) =>
            [-0.05, 0.02, 0.09].map((yy, j) => (
              <mesh
                key={`${side}-${j}`}
                position={[side * 0.26, -0.06 + yy, 0.36]}
                rotation={[0, 0, side * (0.1 - j * 0.12)]}
              >
                <boxGeometry args={[0.34, 0.008, 0.008]} />
                <meshStandardMaterial color={WHISKER} roughness={0.6} />
              </mesh>
            )),
          )}

          {/* 눈 (초록, 세로 슬릿 동공) */}
          {[
            { ref: eyeL, x: -0.17, bref: browL },
            { ref: eyeR, x: 0.17, bref: browR },
          ].map((e, i) => (
            <group key={i} position={[e.x, 0.08, 0.32]}>
              <mesh ref={e.ref}>
                <sphereGeometry args={[0.1, 16, 14]} />
                <meshStandardMaterial color={EYE} roughness={0.25} />
              </mesh>
              {/* 세로 동공 */}
              <mesh position={[0, 0, 0.07]}>
                <boxGeometry args={[0.028, 0.12, 0.02]} />
                <meshStandardMaterial color={PUPIL} roughness={0.3} />
              </mesh>
              {/* 하이라이트 */}
              <mesh position={[0.035, 0.04, 0.09]}>
                <sphereGeometry args={[0.025, 10, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
              </mesh>
              <mesh ref={e.bref} position={[0, 0.15, 0.02]}>
                <boxGeometry args={[0.13, 0.028, 0.03]} />
                <meshStandardMaterial color={FUR_DARK} roughness={0.8} />
              </mesh>
            </group>
          ))}

          {/* 볼터치 */}
          <mesh ref={cheekL} position={[-0.24, -0.03, 0.28]}>
            <circleGeometry args={[0.07, 16]} />
            <meshStandardMaterial color={CHEEK} transparent opacity={0} roughness={0.9} />
          </mesh>
          <mesh ref={cheekR} position={[0.24, -0.03, 0.28]}>
            <circleGeometry args={[0.07, 16]} />
            <meshStandardMaterial color={CHEEK} transparent opacity={0} roughness={0.9} />
          </mesh>

          {/* 뾰족 귀 (삼각뿔, 윗부분 피벗 회전) */}
          <group ref={earL} position={[-0.28, 0.32, 0]}>
            <mesh castShadow position={[0, 0.12, 0]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.15, 0.34, 4]} />
              <meshStandardMaterial color={FUR} roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, 0.1, 0.04]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.08, 0.2, 4]} />
              <meshStandardMaterial color={NOSE} roughness={0.85} flatShading />
            </mesh>
          </group>
          <group ref={earR} position={[0.28, 0.32, 0]}>
            <mesh castShadow position={[0, 0.12, 0]} rotation={[0, 0, -0.2]}>
              <coneGeometry args={[0.15, 0.34, 4]} />
              <meshStandardMaterial color={FUR} roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, 0.1, 0.04]} rotation={[0, 0, -0.2]}>
              <coneGeometry args={[0.08, 0.2, 4]} />
              <meshStandardMaterial color={NOSE} roughness={0.85} flatShading />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
