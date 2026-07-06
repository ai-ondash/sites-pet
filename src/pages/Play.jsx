import { useRef, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Stage from '../components/Stage.jsx'
import Character from '../components/Character.jsx'
import Dog from '../components/Dog.jsx'
import Cat from '../components/Cat.jsx'
import Hearts from '../components/Hearts.jsx'
import { getCharacter } from '../data/characters.js'

const CREATURES = { dog: Dog, cat: Cat }

const THEME_BUTTONS = [
  { key: 'day', label: '☀️ 낮' },
  { key: 'sunset', label: '🌇 노을' },
  { key: 'night', label: '🌙 밤' },
]

export default function Play() {
  const { id } = useParams()
  const character = getCharacter(id)

  const [emote, setEmote] = useState(null)
  const [expression, setExpression] = useState('happy')
  const [pose, setPose] = useState('idle')
  const [trick, setTrick] = useState(null)
  const [theme, setTheme] = useState('day')
  const [petPulse, setPetPulse] = useState(0)
  const revertTimer = useRef(null)

  if (!character) return <Navigate to="/" replace />

  const Creature = CREATURES[id]

  // 캐릭터를 클릭(쓰다듬기)하면 반응 + 하트
  const pet = () => {
    setPetPulse((n) => n + 1)
    if (character.kind === 'robot') {
      setEmote('Yes')
    } else {
      setTrick('jump')
      setExpression('love')
      clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => setExpression('happy'), 1500)
    }
  }

  return (
    <div className="play">
      <Stage camera={{ position: [4, 3, 7], fov: 50 }} target={[0, 1, 0]} theme={theme}>
        {character.kind === 'robot' && (
          <Character emote={emote} onEmoteEnd={() => setEmote(null)} onClick={pet} />
        )}
        {character.kind === 'creature' && Creature && (
          <Creature
            position={[0, 0, 0]}
            expression={expression}
            pose={pose}
            trick={trick}
            onTrickDone={() => setTrick(null)}
            onClick={pet}
          />
        )}
        <Hearts trigger={petPulse} origin={[0, 1.5, 0]} />
      </Stage>

      {/* 상단 바 */}
      <div className="play__topbar">
        <Link to="/" className="play__back">← 목록</Link>
        <div className="play__name">
          <span>{character.emoji}</span> {character.name}
          <span className="play__species">· {character.species}</span>
        </div>
        <div className="play__themes">
          {THEME_BUTTONS.map((tb) => (
            <button
              key={tb.key}
              className={theme === tb.key ? 'is-active' : ''}
              onClick={() => setTheme(tb.key)}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* 쓰다듬기 안내 */}
      <div className="play__pethint">🖐️ 캐릭터를 클릭하면 쓰다듬을 수 있어요</div>

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

      {/* creature 컨트롤 (강아지·고양이 공용) */}
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
