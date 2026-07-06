import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Play from './pages/Play.jsx'
import './ui.css'

/**
 * GitHub Pages(정적 호스팅)에서 새로고침 404가 안 나도록 HashRouter 사용.
 *  /            → 캐릭터 소개 갤러리
 *  /play/:id    → 선택한 캐릭터와 노는 페이지
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:id" element={<Play />} />
      </Routes>
    </HashRouter>
  )
}
