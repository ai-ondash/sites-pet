import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './components/Experience.jsx'
import Loader from './components/Loader.jsx'
import './ui.css'

export default function App() {
  // 버튼으로 트리거하는 1회성 동작(emote). null이면 대기.
  const [emote, setEmote] = useState(null)

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4, 3, 6], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Experience emote={emote} onEmoteEnd={() => setEmote(null)} />
        </Suspense>
      </Canvas>

      <Loader />

      {/* 2D UI 오버레이 */}
      <div className="hud">
        <div className="hud__title">🐾 Sites Pet · 3D</div>
        <div className="hud__hint">
          이동: <b>W A S D</b> / 방향키 &nbsp;·&nbsp; 달리기: <b>Shift</b>
        </div>
        <div className="hud__buttons">
          <button onClick={() => setEmote('Wave')}>👋 인사</button>
          <button onClick={() => setEmote('Dance')}>💃 춤</button>
          <button onClick={() => setEmote('Jump')}>⬆️ 점프</button>
          <button onClick={() => setEmote('Yes')}>✅ 끄덕</button>
        </div>
      </div>
    </>
  )
}
