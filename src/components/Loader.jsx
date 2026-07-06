import { useProgress } from '@react-three/drei'

/**
 * 3D 에셋 로딩 진행률 표시 오버레이
 */
export default function Loader() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="loader">
      <div className="loader__spinner" />
      <div className="loader__text">불러오는 중… {Math.round(progress)}%</div>
    </div>
  )
}
