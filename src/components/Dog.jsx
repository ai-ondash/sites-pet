import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 코드로 만든 귀여운 스타일라이즈드 강아지.
 * - 표정(expression): happy / sad / surprised / sleepy / love / neutral
 * - 자세(pose): idle / walk / sit  (지속 상태)
 * - 묘기(trick): jump / spin       (1회 재생 후 pose로 복귀)
 * 모든 움직임은 프리미티브 지오메트리 + useFrame 로 절차적으로 애니메이션한다.
 */

// 표정별 목표 파라미터 (매 프레임 부드럽게 보간)
const EXPRESSIONS = {
  neutral:   { eye: 1.0,  ear: 0.0,  mouth: 0.12, tongue: 0, head: 0.0,   brow: 0.0,  wag: 4,  cheek: 0 },
  happy:     { eye: 1.0,  ear: 0.15, mouth: 1.0,  tongue: 1, head: 0.02,  brow: 0.1,  wag: 13, cheek: 0.3 },
  sad:       { eye: 0.55, ear: -0.9, mouth: 0.0,  tongue: 0, head: -0.22, brow: -0.35, wag: 0, cheek: 0 },
  surprised: { eye: 1.45, ear: 0.45, mouth: 0.55, tongue: 0, head: 0.06,  brow: 0.3,  wag: 3,  cheek: 0 },
  sleepy:    { eye: 0.08, ear: -0.5, mouth: 0.0,  tongue: 0, head: -0.14, brow: -0.05, wag: 1, cheek: 0 },
  love:      { eye: 0.12, ear: 0.2,  mouth: 0.8,  tongue: 1, head: 0.04,  brow: 0.15, wag: 17, cheek: 0.6 },
}

// 색상
const FUR = '#c9915f'
const FUR_DARK = '#a9713f'
const CREAM = '#f2ddbd'
const NOSE = '#2c2622'
const EYE = '#241d18'
const TONGUE = '#ff7d8f'
const CHEEK = '#ff9db0'

const damp = (cur, target, lambda, dt) =>
  THREE.MathUtils.damp(cur, target, lambda, dt)

export default function Dog({
  expression = 'happy',
  pose = 'idle',
  trick = null,
  onTrickDone,
  position = [0, 0, 0],
  onClick,
}) {
  // 애니메이션 대상 refs
  const root = useRef()        // bob / jump / spin 적용되는 내부 그룹
  const head = useRef()
  const earL = useRef()
  const earR = useRef()
  const eyeL = useRef()
  const eyeR = useRef()
  const browL = useRef()
  const browR = useRef()
  const mouth = useRef()
  const tongue = useRef()
  const cheekL = useRef()
  const cheekR = useRef()
  const tail = useRef()
  const legFL = useRef()
  const legFR = useRef()
  const legBL = useRef()
  const legBR = useRef()

  // 부드러운 보간용 현재값
  const cur = useMemo(
    () => ({ eye: 1, ear: 0, mouth: 0.1, tongue: 0, head: 0, brow: 0, cheek: 0, sit: 0, walk: 0 }),
    [],
  )
  const clock = useRef(0)
  const blink = useRef({ next: 2, amount: 0 })
  const trickState = useRef({ kind: null, t: 0 })

  // trick 트리거 감지
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

    // ---- 표정 파라미터 보간 ----
    cur.eye = damp(cur.eye, expr.eye, 10, dt)
    cur.ear = damp(cur.ear, expr.ear, 8, dt)
    cur.mouth = damp(cur.mouth, expr.mouth, 10, dt)
    cur.tongue = damp(cur.tongue, expr.tongue, 10, dt)
    cur.head = damp(cur.head, expr.head, 8, dt)
    cur.brow = damp(cur.brow, expr.brow, 8, dt)
    cur.cheek = damp(cur.cheek, expr.cheek, 8, dt)
    cur.sit = damp(cur.sit, isSit ? 1 : 0, 8, dt)
    cur.walk = damp(cur.walk, isWalk ? 1 : 0, 10, dt)

    // ---- 자동 깜빡임 ----
    blink.current.next -= dt
    if (blink.current.next <= 0) {
      blink.current.amount = 1
      blink.current.next = 2.5 + Math.random() * 3
    }
    blink.current.amount = Math.max(0, blink.current.amount - dt * 8)
    const blinkFactor = 1 - blink.current.amount * 0.9

    // ---- 눈: 세로 스케일로 뜨고 감음 ----
    const eyeOpen = Math.max(0.05, cur.eye * blinkFactor)
    if (eyeL.current) eyeL.current.scale.y = eyeOpen
    if (eyeR.current) eyeR.current.scale.y = eyeOpen

    // ---- 눈썹 (감정) ----
    if (browL.current) browL.current.rotation.z = cur.brow
    if (browR.current) browR.current.rotation.z = -cur.brow

    // ---- 입 / 혀 ----
    if (mouth.current) mouth.current.scale.y = 0.15 + cur.mouth * 0.9
    if (tongue.current) {
      tongue.current.visible = cur.tongue > 0.05
      tongue.current.scale.setScalar(0.5 + cur.tongue * 0.6)
    }

    // ---- 볼터치 (행복/사랑) ----
    const cheekMat = cheekL.current && cheekL.current.material
    if (cheekMat) {
      cheekL.current.material.opacity = cur.cheek
      cheekR.current.material.opacity = cur.cheek
    }

    // ---- 귀: 위(양수)로 쫑긋 / 아래(음수)로 축 처짐 + 살짝 흔들림 ----
    const earWiggle = Math.sin(t * 6) * 0.05 * cur.walk
    if (earL.current) earL.current.rotation.x = -cur.ear + earWiggle
    if (earR.current) earR.current.rotation.x = -cur.ear - earWiggle

    // ---- 머리: 표정 기울기 + idle 갸웃 ----
    if (head.current) {
      head.current.rotation.x = cur.head
      head.current.rotation.z = Math.sin(t * 1.3) * 0.04 * (1 - cur.walk)
    }

    // ---- 꼬리: 표정에 따른 속도로 살랑살랑 ----
    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * (expr.wag || 3)) * 0.6
      tail.current.rotation.x = -0.5 - cur.sit * 0.3
    }

    // ---- 다리: 걷기 스윙 (앞뒤 교차) ----
    const swing = Math.sin(t * 9) * 0.7 * cur.walk
    const foldBack = cur.sit * 1.25 // 앉으면 뒷다리 접힘
    if (legFL.current) legFL.current.rotation.x = swing
    if (legFR.current) legFR.current.rotation.x = -swing
    if (legBL.current) legBL.current.rotation.x = -swing + foldBack
    if (legBR.current) legBR.current.rotation.x = swing + foldBack

    // ---- 자세: 몸통 위치/기울기 ----
    let baseY = 0
    let pitch = 0
    // idle 호흡 + walk 바운스
    const breathe = Math.sin(t * 2) * 0.02 * (1 - cur.walk)
    const bounce = Math.abs(Math.sin(t * 9)) * 0.06 * cur.walk
    baseY += breathe + bounce
    // 앉기: 뒤로 살짝 젖히고 낮춤
    pitch += cur.sit * 0.32
    baseY -= cur.sit * 0.12

    // ---- trick: jump / spin (1회) ----
    let spinY = 0
    const ts = trickState.current
    if (ts.kind === 'jump') {
      const DUR = 0.7
      ts.t += dt
      const p = Math.min(1, ts.t / DUR)
      baseY += Math.sin(p * Math.PI) * 0.9
      pitch -= Math.sin(p * Math.PI) * 0.15
      if (p >= 1) { trickState.current = { kind: null, t: 0 }; onTrickDone && onTrickDone() }
    } else if (ts.kind === 'spin') {
      const DUR = 0.8
      ts.t += dt
      const p = Math.min(1, ts.t / DUR)
      spinY = p * Math.PI * 2
      baseY += Math.sin(p * Math.PI) * 0.15
      if (p >= 1) { trickState.current = { kind: null, t: 0 }; onTrickDone && onTrickDone() }
    }

    g.position.y = baseY
    g.rotation.x = pitch
    g.rotation.y = spinY
  })

  return (
    <group position={position} onClick={onClick} onPointerDown={onClick}>
      <group ref={root}>
        {/* ===== 몸통 ===== */}
        <mesh castShadow position={[0, 0.62, 0]} scale={[0.62, 0.5, 0.82]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
        {/* 배(크림색) */}
        <mesh position={[0, 0.5, 0.12]} scale={[0.45, 0.34, 0.5]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>

        {/* ===== 다리 (엉덩이 피벗에서 스윙) ===== */}
        {[
          { ref: legFL, pos: [-0.3, 0.42, 0.34] },
          { ref: legFR, pos: [0.3, 0.42, 0.34] },
          { ref: legBL, pos: [-0.3, 0.42, -0.34] },
          { ref: legBR, pos: [0.3, 0.42, -0.34] },
        ].map((l, i) => (
          <group key={i} ref={l.ref} position={l.pos}>
            <mesh castShadow position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.12, 0.24, 6, 12]} />
              <meshStandardMaterial color={FUR} roughness={0.85} />
            </mesh>
            {/* 발(크림색) */}
            <mesh position={[0, -0.4, 0.02]} scale={[1, 0.7, 1.15]}>
              <sphereGeometry args={[0.13, 16, 12]} />
              <meshStandardMaterial color={CREAM} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* ===== 꼬리 ===== */}
        <group ref={tail} position={[0, 0.72, -0.62]} rotation={[-0.5, 0, 0]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <capsuleGeometry args={[0.07, 0.3, 6, 10]} />
            <meshStandardMaterial color={FUR} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.1, 14, 12]} />
            <meshStandardMaterial color={CREAM} roughness={0.9} />
          </mesh>
        </group>

        {/* ===== 머리 ===== */}
        <group ref={head} position={[0, 1.0, 0.5]}>
          <mesh castShadow scale={[0.46, 0.44, 0.44]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={FUR} roughness={0.85} />
          </mesh>

          {/* 주둥이 */}
          <mesh position={[0, -0.08, 0.4]} scale={[0.28, 0.24, 0.28]}>
            <sphereGeometry args={[1, 24, 18]} />
            <meshStandardMaterial color={CREAM} roughness={0.9} />
          </mesh>
          {/* 코 */}
          <mesh position={[0, -0.02, 0.62]}>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial color={NOSE} roughness={0.5} />
          </mesh>
          {/* 입 (세로 스케일로 벌어짐) */}
          <mesh ref={mouth} position={[0, -0.2, 0.52]}>
            <boxGeometry args={[0.16, 0.12, 0.02]} />
            <meshStandardMaterial color={NOSE} roughness={0.6} />
          </mesh>
          {/* 혀 */}
          <mesh ref={tongue} position={[0, -0.28, 0.55]} visible={false}>
            <sphereGeometry args={[0.09, 14, 10]} />
            <meshStandardMaterial color={TONGUE} roughness={0.6} />
          </mesh>

          {/* 눈 (세로 스케일로 깜빡/감음) */}
          {[
            { ref: eyeL, x: -0.18, bref: browL },
            { ref: eyeR, x: 0.18, bref: browR },
          ].map((e, i) => (
            <group key={i} position={[e.x, 0.1, 0.34]}>
              {/* 눈알+하이라이트를 한 그룹으로 묶어 openness 스케일을 함께 받게 함 */}
              <group ref={e.ref}>
                <mesh>
                  <sphereGeometry args={[0.1, 16, 14]} />
                  <meshStandardMaterial color={EYE} roughness={0.3} />
                </mesh>
                {/* 하이라이트 (바깥쪽 위, 좌우 대칭) */}
                <mesh position={[e.x < 0 ? -0.035 : 0.035, 0.045, 0.09]}>
                  <sphereGeometry args={[0.03, 10, 8]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
                </mesh>
              </group>
              {/* 눈썹 */}
              <mesh ref={e.bref} position={[0, 0.16, 0.02]}>
                <boxGeometry args={[0.14, 0.03, 0.03]} />
                <meshStandardMaterial color={FUR_DARK} roughness={0.8} />
              </mesh>
            </group>
          ))}

          {/* 볼터치 */}
          <mesh ref={cheekL} position={[-0.26, -0.04, 0.3]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color={CHEEK} transparent opacity={0} roughness={0.9} />
          </mesh>
          <mesh ref={cheekR} position={[0.26, -0.04, 0.3]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color={CHEEK} transparent opacity={0} roughness={0.9} />
          </mesh>

          {/* 귀 (윗부분 피벗에서 회전) */}
          <group ref={earL} position={[-0.42, 0.18, 0]}>
            <mesh castShadow position={[0, -0.22, 0]} rotation={[0, 0, 0.15]}>
              <capsuleGeometry args={[0.1, 0.34, 6, 10]} />
              <meshStandardMaterial color={FUR_DARK} roughness={0.85} />
            </mesh>
          </group>
          <group ref={earR} position={[0.42, 0.18, 0]}>
            <mesh castShadow position={[0, -0.22, 0]} rotation={[0, 0, -0.15]}>
              <capsuleGeometry args={[0.1, 0.34, 6, 10]} />
              <meshStandardMaterial color={FUR_DARK} roughness={0.85} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
