// 애완 캐릭터 레지스트리
// kind: 'robot'   → 이동(WASD) + 이모트
//       'creature'→ 표정 + 자세(pose) + 묘기(trick)  (강아지·고양이 공용 컨트롤)
export const CHARACTERS = [
  {
    id: 'robot',
    kind: 'robot',
    name: '로비',
    species: '로봇',
    emoji: '🤖',
    tagline: '함께 뛰어노는 활발한 로봇 친구',
    description: 'WASD로 자유롭게 걷고 달리며, 인사·춤·점프 같은 동작을 보여줘요.',
    accent: '#f5b301',
    abilities: ['걷기 / 달리기', '표정 4종', '점프 · 춤'],
  },
  {
    id: 'dog',
    kind: 'creature',
    name: '몽이',
    species: '강아지',
    emoji: '🐶',
    tagline: '표정이 풍부한 귀여운 강아지',
    description: '행복·슬픔·놀람·졸림·사랑 표정과 앉기·점프·빙글 같은 재롱을 부려요.',
    accent: '#c9915f',
    abilities: ['표정 5종', '앉기 · 걷기', '점프 · 빙글'],
    expressions: [
      { key: 'happy', label: '😄 행복' },
      { key: 'sad', label: '😢 슬픔' },
      { key: 'surprised', label: '😮 놀람' },
      { key: 'sleepy', label: '😴 졸림' },
      { key: 'love', label: '🥰 사랑' },
    ],
    poses: [
      { key: 'idle', label: '🧍 대기' },
      { key: 'walk', label: '🚶 걷기' },
      { key: 'sit', label: '🐕‍🦺 앉아' },
    ],
    tricks: [
      { key: 'jump', label: '🦘 점프' },
      { key: 'spin', label: '🌀 빙글' },
    ],
  },
  {
    id: 'cat',
    kind: 'creature',
    name: '나비',
    species: '고양이',
    emoji: '🐱',
    tagline: '도도하고 표정이 살아있는 고양이',
    description: '행복·새침·호기심·졸림·사랑 표정과 앉기·점프·갸르릉 재롱을 부려요.',
    accent: '#8b93a7',
    abilities: ['표정 5종', '앉기 · 걷기', '점프 · 갸르릉'],
    expressions: [
      { key: 'happy', label: '😸 행복' },
      { key: 'grumpy', label: '😾 새침' },
      { key: 'curious', label: '🙀 호기심' },
      { key: 'sleepy', label: '😴 졸림' },
      { key: 'love', label: '😻 사랑' },
    ],
    poses: [
      { key: 'idle', label: '🧍 대기' },
      { key: 'walk', label: '🚶 걷기' },
      { key: 'sit', label: '🐈 앉아' },
    ],
    tricks: [
      { key: 'jump', label: '🦘 점프' },
      { key: 'purr', label: '💗 갸르릉' },
    ],
  },
]

export const getCharacter = (id) => CHARACTERS.find((c) => c.id === id)
