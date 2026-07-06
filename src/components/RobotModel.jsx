import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

const MODEL_URL = import.meta.env.BASE_URL + 'models/character.glb'

/**
 * 로봇 glb 를 불러와 지정한 클립을 재생하는 가벼운 표시용 모델.
 * (이동/카메라/키보드 없음 — 미리보기·소개용)
 */
export default function RobotModel({ clip = 'Idle', scale = 0.35, ...props }) {
  const group = useRef()
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    actions[clip]?.reset().play()
  }, [scene, actions, clip])

  return (
    <group ref={group} {...props}>
      <primitive object={scene} scale={scale} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
