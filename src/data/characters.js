// 애완 캐릭터 레지스트리 (메타데이터만 — 실제 3D 컴포넌트는 페이지에서 id로 분기)
export const CHARACTERS = [
  {
    id: 'robot',
    name: '로비',
    species: '로봇',
    emoji: '🤖',
    tagline: '함께 뛰어노는 활발한 로봇 친구',
    description: 'WASD로 자유롭게 걷고 달리며, 인사·춤·점프 같은 동작을 보여줘요.',
    accent: '#f5b301',
    abilities: ['걷기 / 달리기', '인사 · 춤', '점프 · 끄덕'],
  },
  {
    id: 'dog',
    name: '몽이',
    species: '강아지',
    emoji: '🐶',
    tagline: '표정이 풍부한 귀여운 강아지',
    description: '행복·슬픔·놀람·졸림·사랑 표정과 앉기·점프·빙글 같은 재롱을 부려요.',
    accent: '#c9915f',
    abilities: ['표정 5종', '앉기 · 걷기', '점프 · 빙글'],
  },
]

export const getCharacter = (id) => CHARACTERS.find((c) => c.id === id)
