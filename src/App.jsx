import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './components/Experience.jsx'
import Loader from './components/Loader.jsx'
import './ui.css'

const EXPRESSIONS = [
  { key: 'happy', label: '😄 행복' },
  { key: 'sad', label: '😢 슬픔' },
  { key: 'surprised', label: '😮 놀람' },
  { key: 'sleepy', label: '😴 졸림' },
  { key: 'love', label: '🥰 사랑' },
]

export default function App() {
  // 로봇 캐릭터: 버튼으로 트리거하는 1회성 동작(emote)
  const [emote, setEmote] = useState(null)

  // 강아지 상태: 표정 / 자세 / 묘기
  const [expression, setExpression] = useState('happy')
  const [pose, setPose] = useState('idle')
  const [trick, setTrick] = useState(null)

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4, 3, 7], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Experience
            emote={emote}
            onEmoteEnd={() => setEmote(null)}
            dog={{
              expression,
              pose,
              trick,
              onTrickDone: () => setTrick(null),
            }}
          />
        </Suspense>
      </Canvas>

      <Loader />

      {/* 로봇 조작 안내 + 버튼 (좌하단) */}
      <div className="hud">
        <div className="hud__title">🐾 Sites Pet · 3D</div>
        <div className="hud__hint">
          로봇 이동: <b>W A S D</b> / 방향키 &nbsp;·&nbsp; 달리기: <b>Shift</b>
        </div>
        <div className="hud__buttons">
          <button onClick={() => setEmote('Wave')}>👋 인사</button>
          <button onClick={() => setEmote('Dance')}>💃 춤</button>
          <button onClick={() => setEmote('Jump')}>⬆️ 점프</button>
          <button onClick={() => setEmote('Yes')}>✅ 끄덕</button>
        </div>
      </div>

      {/* 강아지 조작 패널 (우하단) */}
      <div className="dogpanel">
        <div className="dogpanel__label">🐶 강아지 표정</div>
        <div className="dogpanel__row">
          {EXPRESSIONS.map((e) => (
            <button
              key={e.key}
              className={expression === e.key ? 'is-active' : ''}
              onClick={() => setExpression(e.key)}
            >
              {e.label}
            </button>
          ))}
        </div>

        <div className="dogpanel__label">🦴 강아지 액션</div>
        <div className="dogpanel__row">
          <button
            className={pose === 'idle' ? 'is-active' : ''}
            onClick={() => setPose('idle')}
          >
            🧍 대기
          </button>
          <button
            className={pose === 'walk' ? 'is-active' : ''}
            onClick={() => setPose('walk')}
          >
            🚶 걷기
          </button>
          <button
            className={pose === 'sit' ? 'is-active' : ''}
            onClick={() => setPose('sit')}
          >
            🐕‍🦺 앉아
          </button>
          <button onClick={() => setTrick('jump')}>🦘 점프</button>
          <button onClick={() => setTrick('spin')}>🌀 빙글</button>
        </div>
      </div>
    </>
  )
}
