import { useEffect, useRef, useState } from 'react'

const asset = (character, src) => import.meta.env.BASE_URL + character.assetBase + src

/**
 * 미디어 기반 '포토펫' — AI로 생성한 실사풍 이미지/영상을 상태별로 크로스페이드하며
 * 숨쉬기(미세 스케일)·시선 패럴랙스·클릭 하트로 살아있는 초상화처럼 보여준다.
 * 3D가 아니라 2D DOM 컴포넌트.
 */
export default function PhotoPet({ character, state, onPet }) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [hearts, setHearts] = useState([])
  const videoRefs = useRef({})
  const heartId = useRef(0)

  const states = character.states
  const activeSrc = (states.find((s) => s.key === state) || states[0]).src

  // 활성 상태의 영상만 재생, 나머지는 정지
  useEffect(() => {
    states.forEach((s) => {
      const v = videoRefs.current[s.key]
      if (!v) return
      if (s.key === state) v.play?.().catch(() => {})
      else v.pause?.()
    })
  }, [state, states])

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height
    setParallax({ x: -dx * 14, y: -dy * 14 })
  }
  const onLeave = () => setParallax({ x: 0, y: 0 })

  const pet = () => {
    // 하트 몇 개 무작위로 띄우기
    const batch = Array.from({ length: 6 }, () => ({
      id: heartId.current++,
      left: 30 + Math.random() * 40,
      dx: (Math.random() - 0.5) * 60,
      delay: Math.random() * 0.15,
    }))
    setHearts((h) => [...h, ...batch])
    onPet && onPet()
  }

  return (
    <div className="photopet">
      {/* 뒤 배경: 현재 이미지를 크게 흐리게 (앰비언트) */}
      <div
        className="photopet__ambient"
        style={{ backgroundImage: `url(${asset(character, activeSrc)})` }}
      />

      <div
        className="photopet__frame"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={pet}
        style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
      >
        <div className="photopet__stack">
          {states.map((s) => {
            const isActive = s.key === state
            const url = asset(character, s.src)
            return (
              <div
                key={s.key}
                className={`photopet__layer ${isActive ? 'is-active' : ''}`}
              >
                {s.type === 'video' ? (
                  <video
                    ref={(el) => (videoRefs.current[s.key] = el)}
                    className="photopet__media"
                    src={url}
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img className="photopet__media" src={url} alt={s.label} />
                )}
              </div>
            )
          })}
        </div>

        {/* 클릭 하트 */}
        <div className="photopet__hearts">
          {hearts.map((h) => (
            <span
              key={h.id}
              className="photopet__heart"
              style={{ left: `${h.left}%`, '--dx': `${h.dx}px`, animationDelay: `${h.delay}s` }}
              onAnimationEnd={() =>
                setHearts((list) => list.filter((x) => x.id !== h.id))
              }
            >
              ❤
            </span>
          ))}
        </div>

        <div className="photopet__hint">🖐️ 클릭해서 쓰다듬기</div>
      </div>
    </div>
  )
}
