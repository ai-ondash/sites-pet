import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { CHARACTERS } from '../data/characters.js'
import CharacterPreview from '../components/CharacterPreview.jsx'

/**
 * 홈 — 애완 캐릭터 소개 갤러리. 카드를 고르면 해당 캐릭터와 노는 페이지로 이동.
 */
export default function Home() {
  return (
    <div className="home">
      <header className="home__hero">
        <div className="home__logo">🐾 Sites Pet</div>
        <h1 className="home__title">나만의 3D 펫과 놀아보세요</h1>
        <p className="home__subtitle">
          함께 놀 친구를 골라보세요. 카드를 누르면 그 친구와 바로 놀 수 있어요.
        </p>
      </header>

      <div className="home__grid">
        {CHARACTERS.map((c) => (
          <Link
            key={c.id}
            to={`/play/${c.id}`}
            className="petcard"
            style={{ '--accent': c.accent }}
          >
            <div className="petcard__stage">
              {c.kind === 'photo' ? (
                <img
                  className="petcard__photo"
                  src={import.meta.env.BASE_URL + c.assetBase + (c.states.find((s) => s.key === c.defaultState) || c.states[0]).src}
                  alt={c.name}
                />
              ) : (
                <Suspense fallback={<div className="petcard__loading">불러오는 중…</div>}>
                  <CharacterPreview id={c.id} />
                </Suspense>
              )}
            </div>
            <div className="petcard__body">
              <div className="petcard__name">
                <span className="petcard__emoji">{c.emoji}</span> {c.name}
                <span className="petcard__species">· {c.species}</span>
              </div>
              <div className="petcard__tagline">{c.tagline}</div>
              <div className="petcard__abilities">
                {c.abilities.map((a) => (
                  <span key={a} className="petcard__chip">{a}</span>
                ))}
              </div>
              <div className="petcard__cta">놀러가기 →</div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="home__footer">
        React Three Fiber로 만든 3D 펫 놀이터
      </footer>
    </div>
  )
}
