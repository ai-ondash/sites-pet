import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Stage from '../components/Stage.jsx'
import Character from '../components/Character.jsx'
import Dog from '../components/Dog.jsx'
import { getCharacter } from '../data/characters.js'

const DOG_EXPRESSIONS = [
  { key: 'happy', label: '😄 행복' },
  { key: 'sad', label: '😢 슬픔' },
  { key: 'surprised', label: '😮 놀람' },
  { key: 'sleepy', label: '😴 졸림' },
  { key: 'love', label: '🥰 사랑' },
]

export default function Play() {
  const { id } = useParams()
  const character = getCharacter(id)

  // 로봇 상태
  const [emote, setEmote] = useState(null)
  // 강아지 상태
  const [expression, setExpression] = useState('happy')
  const [pose, setPose] = useState('idle')
  const [trick, setTrick] = useState(null)

  if (!character) return <Navigate to="/" replace />

  return (
    <div className="play">
      <Stage camera={{ position: [4, 3, 7], fov: 50 }} target={[0, 1, 0]}>
        {id === 'robot' && (
          <Character emote={emote} onEmoteEnd={() => setEmote(null)} />
        )}
        {id === 'dog' && (
          <Dog
            position={[0, 0, 0]}
            expression={expression}
            pose={pose}
            trick={trick}
            onTrickDone={() => setTrick(null)}
          />
        )}
      </Stage>

      {/* 상단 바 */}
      <div className="play__topbar">
        <Link to="/" className="play__back">← 목록</Link>
        <div className="play__name">
          <span>{character.emoji}</span> {character.name}
          <span className="play__species">· {character.species}</span>
        </div>
      </div>

      {/* 로봇 컨트롤 */}
      {id === 'robot' && (
        <div className="hud">
          <div className="hud__hint">
            이동: <b>W A S D</b> / 방향키 &nbsp;·&nbsp; 달리기: <b>Shift</b> &nbsp;·&nbsp; 시점: 드래그
          </div>
          <div className="hud__buttons">
            <button onClick={() => setEmote('Wave')}>👋 인사</button>
            <button onClick={() => setEmote('Dance')}>💃 춤</button>
            <button onClick={() => setEmote('Jump')}>⬆️ 점프</button>
            <button onClick={() => setEmote('Yes')}>✅ 끄덕</button>
          </div>
        </div>
      )}

      {/* 강아지 컨트롤 */}
      {id === 'dog' && (
        <div className="dogpanel dogpanel--center">
          <div className="dogpanel__label">🐶 표정</div>
          <div className="dogpanel__row">
            {DOG_EXPRESSIONS.map((e) => (
              <button
                key={e.key}
                className={expression === e.key ? 'is-active' : ''}
                onClick={() => setExpression(e.key)}
              >
                {e.label}
              </button>
            ))}
          </div>
          <div className="dogpanel__label">🦴 액션</div>
          <div className="dogpanel__row">
            <button className={pose === 'idle' ? 'is-active' : ''} onClick={() => setPose('idle')}>🧍 대기</button>
            <button className={pose === 'walk' ? 'is-active' : ''} onClick={() => setPose('walk')}>🚶 걷기</button>
            <button className={pose === 'sit' ? 'is-active' : ''} onClick={() => setPose('sit')}>🐕‍🦺 앉아</button>
            <button onClick={() => setTrick('jump')}>🦘 점프</button>
            <button onClick={() => setTrick('spin')}>🌀 빙글</button>
          </div>
        </div>
      )}
    </div>
  )
}
