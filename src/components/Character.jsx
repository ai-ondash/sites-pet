import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useKeyboard } from '../hooks/useKeyboard.js'

const WALK_SPEED = 2.2
const RUN_SPEED = 5.0
const TURN_SPEED = 10
const FADE = 0.25

// base 경로(dev='/', Pages='/sites-pet/')를 붙여야 배포 환경에서도 로드됨
const MODEL_URL = import.meta.env.BASE_URL + 'models/character.glb'

export default function Character({ emote, onEmoteEnd, onClick }) {
  const group = useRef()
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, mixer } = useAnimations(animations, group)
  const keys = useKeyboard()
  const { controls } = useThree()

  // 현재 재생 중인 이동 상태(Idle/Walking/Running) 추적
  const current = useRef('Idle')
  const velocity = useMemo(() => new THREE.Vector3(), [])
  const camForward = useMemo(() => new THREE.Vector3(), [])
  const camRight = useMemo(() => new THREE.Vector3(), [])
  const moveDir = useMemo(() => new THREE.Vector3(), [])
  const camera = useThree((s) => s.camera)

  // 그림자 켜기 + 시작 애니메이션
  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    actions['Idle']?.reset().play()
  }, [scene, actions])

  // 이동 상태 전환 (Idle <-> Walking <-> Running)
  const setState = (name) => {
    if (current.current === name || !actions[name]) return
    actions[current.current]?.fadeOut(FADE)
    actions[name].reset().fadeIn(FADE).play()
    current.current = name
  }

  // 버튼 emote (1회성): Wave, Dance, Jump, Yes ...
  useEffect(() => {
    if (!emote || !actions[emote]) return
    const action = actions[emote]
    const prev = current.current
    actions[prev]?.fadeOut(FADE)
    action.reset()
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.fadeIn(FADE).play()

    const onFinished = (e) => {
      if (e.action !== action) return
      action.fadeOut(FADE)
      actions[prev]?.reset().fadeIn(FADE).play()
      current.current = prev
      mixer.removeEventListener('finished', onFinished)
      onEmoteEnd?.()
    }
    mixer.addEventListener('finished', onFinished)
    return () => mixer.removeEventListener('finished', onFinished)
  }, [emote, actions, mixer, onEmoteEnd])

  useFrame((_, delta) => {
    if (!group.current) return

    // 카메라 기준 이동 방향 계산 (W = 카메라 정면)
    camera.getWorldDirection(camForward)
    camForward.y = 0
    camForward.normalize()
    camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize()

    moveDir.set(0, 0, 0)
    if (keys.forward) moveDir.add(camForward)
    if (keys.backward) moveDir.sub(camForward)
    if (keys.right) moveDir.add(camRight)
    if (keys.left) moveDir.sub(camRight)

    const moving = moveDir.lengthSq() > 0
    const running = keys.run
    const speed = running ? RUN_SPEED : WALK_SPEED

    if (moving) {
      moveDir.normalize()
      velocity.copy(moveDir).multiplyScalar(speed * delta)
      group.current.position.add(velocity)

      // 진행 방향으로 부드럽게 회전
      const targetAngle = Math.atan2(moveDir.x, moveDir.z)
      const cur = group.current.rotation.y
      let diff = targetAngle - cur
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      group.current.rotation.y = cur + diff * Math.min(1, TURN_SPEED * delta)

      setState(running ? 'Running' : 'Walking')
    } else {
      setState('Idle')
    }

    // OrbitControls 타깃이 캐릭터를 따라가도록
    if (controls?.target) {
      controls.target.lerp(
        new THREE.Vector3(
          group.current.position.x,
          group.current.position.y + 1,
          group.current.position.z,
        ),
        Math.min(1, 6 * delta),
      )
      controls.update()
    }
  })

  return (
    <primitive
      ref={group}
      object={scene}
      scale={0.35}
      onClick={onClick}
      onPointerDown={onClick}
    />
  )
}

useGLTF.preload(MODEL_URL)
