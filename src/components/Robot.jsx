import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboard } from '../hooks/useKeyboard.js'

/**
 * 코드로 만든 스타일라이즈드 로봇(로비).
 * - interactive=true: WASD 이동 + 카메라 팔로우 + 걷기 애니메이션
 * - emote: Wave(인사) / Dance(춤) / Jump(점프) / Yes(끄덕)  (1회 재생)
 * 모든 지오메트리가 프리미티브라 코드에서 바로 수정 가능.
 */

const WALK_SPEED = 2.2
const RUN_SPEED = 5.0
const TURN_SPEED = 10

const BODY = '#f5b301'
const BODY_DK = '#d98e0a'
const JOINT = '#3a3a44'
const METAL = '#b9c0cc'
const VISOR = '#20232e'
const EYE = '#7ef0ff'

const EMOTES = { Wave: 1.6, Dance: 2.2, Jump: 0.7, Yes: 1.0 }
const damp = (c, t, l, dt) => THREE.MathUtils.damp(c, t, l, dt)

export default function Robot({
  emote,
  onEmoteEnd,
  onClick,
  position = [0, 0, 0],
  interactive = true,
}) {
  const root = useRef()   // 월드 이동/회전
  const body = useRef()   // bob/jump/dance 적용
  const head = useRef()
  const antenna = useRef()
  const armL = useRef()
  const armR = useRef()
  const legL = useRef()
  const legR = useRef()

  const keys = useKeyboard()
  const controls = useThree((s) => s.controls)
  const camera = useThree((s) => s.camera)

  const walkAmt = useRef(0)
  const clock = useRef(0)
  const emoteState = useRef({ kind: null, t: 0 })
  const velocity = useMemo(() => new THREE.Vector3(), [])
  const camF = useMemo(() => new THREE.Vector3(), [])
  const camR = useMemo(() => new THREE.Vector3(), [])
  const moveDir = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useEffect(() => {
    if (emote) emoteState.current = { kind: emote, t: 0 }
  }, [emote])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    clock.current += dt
    const t = clock.current
    const g = root.current
    if (!g) return

    // ---------- 이동 (interactive) ----------
    let walking = false
    if (interactive) {
      camera.getWorldDirection(camF)
      camF.y = 0
      camF.normalize()
      camR.crossVectors(camF, up).normalize()
      moveDir.set(0, 0, 0)
      if (keys.forward) moveDir.add(camF)
      if (keys.backward) moveDir.sub(camF)
      if (keys.right) moveDir.add(camR)
      if (keys.left) moveDir.sub(camR)

      if (moveDir.lengthSq() > 0) {
        walking = true
        moveDir.normalize()
        const speed = keys.run ? RUN_SPEED : WALK_SPEED
        velocity.copy(moveDir).multiplyScalar(speed * dt)
        g.position.add(velocity)
        const target = Math.atan2(moveDir.x, moveDir.z)
        let diff = target - g.rotation.y
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        g.rotation.y += diff * Math.min(1, TURN_SPEED * dt)
      }

      if (controls?.target) {
        controls.target.lerp(
          new THREE.Vector3(g.position.x, g.position.y + 1, g.position.z),
          Math.min(1, 6 * dt),
        )
        controls.update()
      }
    }

    walkAmt.current = damp(walkAmt.current, walking ? 1 : 0, 10, dt)
    const wa = walkAmt.current
    const running = interactive && keys.run && walking
    const gait = running ? 15 : 9

    // ---------- 기본(대기/걷기) 애니메이션 ----------
    const swing = Math.sin(t * gait) * (0.15 + wa * 0.7)
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    // 팔은 다리와 반대로
    let armLZ = 0.08, armRZ = -0.08
    let armLX = -swing * 0.6, armRX = swing * 0.6

    let bob = Math.abs(Math.sin(t * gait)) * 0.05 * wa + Math.sin(t * 2) * 0.02 * (1 - wa)
    let bodyRotZ = 0
    let headRotX = 0
    let baseY = 0

    // 안테나 흔들
    if (antenna.current) antenna.current.rotation.z = Math.sin(t * 3) * 0.12 + swing * 0.2

    // ---------- 이모트(1회) ----------
    const es = emoteState.current
    if (es.kind && EMOTES[es.kind]) {
      const DUR = EMOTES[es.kind]
      es.t += dt
      const p = Math.min(1, es.t / DUR)
      const env = Math.sin(p * Math.PI) // 0→1→0

      if (es.kind === 'Wave') {
        armRZ = -0.08 - env * 2.0
        armRX = Math.sin(p * Math.PI * 6) * 0.5 * env
      } else if (es.kind === 'Dance') {
        bodyRotZ = Math.sin(p * Math.PI * 6) * 0.28
        armLZ = 0.08 + env * 1.6
        armRZ = -0.08 - env * 1.6
        baseY += Math.abs(Math.sin(p * Math.PI * 6)) * 0.14 * env
        headRotX = Math.sin(p * Math.PI * 6) * 0.15
      } else if (es.kind === 'Jump') {
        baseY += Math.sin(p * Math.PI) * 0.9
        armLZ = 0.08 + env * 1.2
        armRZ = -0.08 - env * 1.2
      } else if (es.kind === 'Yes') {
        headRotX = Math.sin(p * Math.PI * 4) * 0.4
      }

      if (p >= 1) {
        emoteState.current = { kind: null, t: 0 }
        onEmoteEnd && onEmoteEnd()
      }
    }

    if (armL.current) { armL.current.rotation.z = armLZ; armL.current.rotation.x = armLX }
    if (armR.current) { armR.current.rotation.z = armRZ; armR.current.rotation.x = armRX }
    if (head.current) head.current.rotation.x = headRotX
    if (body.current) {
      body.current.position.y = baseY + bob
      body.current.rotation.z = bodyRotZ
    }
  })

  return (
    <group ref={root} position={position} onClick={onClick} onPointerDown={onClick}>
      {/* 다리 (엉덩이 피벗) */}
      <group ref={legL} position={[-0.17, 0.5, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.11, 0.3, 6, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.46, 0.04]} scale={[1, 0.6, 1.3]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color={BODY_DK} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      <group ref={legR} position={[0.17, 0.5, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.11, 0.3, 6, 12]} />
          <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.46, 0.04]} scale={[1, 0.6, 1.3]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color={BODY_DK} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* 몸통 + 위쪽 파츠 (bob/dance 적용) */}
      <group ref={body}>
        {/* 토르소 */}
        <mesh castShadow position={[0, 0.92, 0]}>
          <boxGeometry args={[0.62, 0.66, 0.44]} />
          <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.35} />
        </mesh>
        {/* 벨트 */}
        <mesh position={[0, 0.66, 0]}>
          <boxGeometry args={[0.64, 0.1, 0.46]} />
          <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.4} />
        </mesh>
        {/* 가슴 라이트 */}
        <mesh position={[0, 0.98, 0.23]}>
          <circleGeometry args={[0.08, 20]} />
          <meshStandardMaterial color={EYE} emissive={EYE} emissiveIntensity={0.8} />
        </mesh>

        {/* 팔 (어깨 피벗) */}
        <group ref={armL} position={[-0.37, 1.12, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.075, 0.3, 6, 12]} />
            <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        <group ref={armR} position={[0.37, 1.12, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.075, 0.3, 6, 12]} />
            <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* 머리 */}
        <group ref={head} position={[0, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.42, 0.42]} />
            <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.35} />
          </mesh>
          {/* 바이저 */}
          <mesh position={[0, 0.02, 0.21]}>
            <boxGeometry args={[0.42, 0.2, 0.04]} />
            <meshStandardMaterial color={VISOR} metalness={0.4} roughness={0.3} />
          </mesh>
          {/* 눈 */}
          <mesh position={[-0.1, 0.03, 0.235]}>
            <sphereGeometry args={[0.045, 14, 12]} />
            <meshStandardMaterial color={EYE} emissive={EYE} emissiveIntensity={1.1} />
          </mesh>
          <mesh position={[0.1, 0.03, 0.235]}>
            <sphereGeometry args={[0.045, 14, 12]} />
            <meshStandardMaterial color={EYE} emissive={EYE} emissiveIntensity={1.1} />
          </mesh>
          {/* 귀(사이드 볼트) */}
          <mesh position={[-0.27, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.06, 12]} />
            <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.27, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.06, 12]} />
            <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
          </mesh>
          {/* 안테나 (아래 피벗) */}
          <group ref={antenna} position={[0, 0.21, 0]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
              <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <sphereGeometry args={[0.045, 14, 12]} />
              <meshStandardMaterial color="#ff5d84" emissive="#ff5d84" emissiveIntensity={0.9} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
