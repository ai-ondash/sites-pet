import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Stage from '../components/Stage.jsx'
import Character from '../components/Character.jsx'
import Dog from '../components/Dog.jsx'
import Cat from '../components/Cat.jsx'
import { getCharacter } from '../data/characters.js'

// creature id → 3D 컴포넌트
const CREATURES = { dog: Dog, cat: Cat }

export default function Play() {
  const { id } = useParams()
  const character = getCharacter(id)

  // 로봇 상태
  const [emote, setEmote] = useState(null)
  // creature 상태
  const [expression, setExpression] = useState('happy')
  const [pose, setPose] = useState('idle')
  const [trick, setTrick] = useState(null)

  if (!character) return <Navigate to="/" replace />

  const Creature = CREATURES[id]

  return (
    <div className="play">
      <Stage camera={{ position: [4, 3, 7], fov: 50 }} target={[0, 1, 0]}>
        {character.kind === 'robot' && (
          <Character emote={emote} onEmoteEnd={() => setEmote(null)} />
        )}
        {character.kind === 'creature' && Creature && (
          <Creature
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
      {character.kind === 'robot' && (
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

      {/* creature 컨트롤 (강아지·고양이 공용, 설정 기반) */}
      {character.kind === 'creature' && (
        <div className="dogpanel dogpanel--center">
          <div className="dogpanel__label">{character.emoji} 표정</div>
          <div className="dogpanel__row">
            {character.expressions.map((e) => (
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
            {character.poses.map((p) => (
              <button
                key={p.key}
                className={pose === p.key ? 'is-active' : ''}
                onClick={() => setPose(p.key)}
              >
                {p.label}
              </button>
            ))}
            {character.tricks.map((tk) => (
              <button key={tk.key} onClick={() => setTrick(tk.key)}>
                {tk.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
