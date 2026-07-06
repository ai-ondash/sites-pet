# 🐾 Sites Pet · 3D

React Three Fiber 기반 3D 펫 놀이터. **소개 갤러리 → 캐릭터 선택 → 함께 노는 페이지** 구조이며,
모든 캐릭터(로봇·강아지·고양이)는 **프리미티브 지오메트리로 코드로 제작**되어 있어 언제든 코드로 수정할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속.

## 페이지 구조 (라우팅)

정적 호스팅(GitHub Pages)에서 새로고침 404가 안 나도록 **HashRouter**를 사용합니다.

| 경로 | 설명 |
|------|------|
| `#/` | 홈 — 애완 캐릭터 소개 갤러리. 각 카드에 회전하는 3D 미리보기. |
| `#/play/robot` | 로비(로봇)와 노는 페이지 |
| `#/play/dog` | 몽이(강아지)와 노는 페이지 |
| `#/play/cat` | 나비(고양이)와 노는 페이지 |

카드를 누르면 해당 캐릭터 플레이 페이지로 이동하고, 좌상단 **← 목록**으로 돌아옵니다.

## 공통 조작 (플레이 페이지)

- **쓰다듬기**: 캐릭터를 클릭하면 하트가 튀어오르고 반응해요.
- **배경 테마**: 우상단에서 ☀️ 낮 · 🌇 노을 · 🌙 밤 전환.
- **시점**: 마우스 드래그로 회전 / 휠로 줌 (모바일 터치 지원).

### 로비 (로봇)
- **이동**: `W A S D` / 방향키 · **달리기**: `Shift`
- **동작**: 인사 👋 · 춤 💃 · 점프 ⬆️ · 끄덕 ✅

### 몽이 (강아지)
- **표정**: 😄 행복 · 😢 슬픔 · 😮 놀람 · 😴 졸림 · 🥰 사랑
- **액션**: 🧍 대기 · 🚶 걷기 · 🐕‍🦺 앉아 · 🦘 점프 · 🌀 빙글

### 나비 (고양이)
- **표정**: 😸 행복 · 😾 새침 · 🙀 호기심 · 😴 졸림 · 😻 사랑
- **액션**: 🧍 대기 · 🚶 걷기 · 🐈 앉아 · 🦘 점프 · 💗 갸르릉

표정마다 눈·귀·입·눈썹·볼터치·자동 깜빡임이 다르게 애니메이션되고, 꼬리는 기분에 따라 흔들림 속도가 달라집니다.

## 구조

```
src/
  App.jsx                     ← 라우터 (HashRouter: 홈 / 플레이)
  data/characters.js          ← 캐릭터 레지스트리(메타데이터 + 표정/자세/묘기 설정)
  pages/
    Home.jsx                  ← 소개 갤러리
    Play.jsx                  ← 캐릭터별 플레이 화면 + 컨트롤 + 테마/쓰다듬기
  components/
    Stage.jsx                 ← 플레이용 공용 3D 무대(배경 테마·조명·지면·카메라)
    CharacterPreview.jsx      ← 갤러리 카드용 회전 미리보기
    Robot.jsx                 ← 로봇 (프리미티브 제작 + 이동/이모트)
    Dog.jsx                   ← 강아지 (프리미티브 제작 + 표정/액션)
    Cat.jsx                   ← 고양이 (프리미티브 제작 + 표정/액션)
    Hearts.jsx                ← 쓰다듬기 하트 이펙트
    Ground.jsx                ← 지면
    Loader.jsx                ← 로딩 진행률
  hooks/useKeyboard.js        ← 키보드 입력
```

## 포토펫 (AI 생성 실사풍 캐릭터)

`kind: 'photo'` 캐릭터는 3D가 아니라 **AI로 생성한 실사풍 이미지/영상**을 상태별로
크로스페이드하며 숨쉬기·시선 패럴랙스·클릭 하트로 살아있는 초상화처럼 보여줍니다.
아티스트 없이 만들 수 있으며, 만드는 법(폴더 규칙·생성 툴·프롬프트)은
👉 **[docs/photopet-pipeline.md](docs/photopet-pipeline.md)** 참고.

- 에셋: `public/photopets/<id>/<state>.(webp|jpg|mp4|webm)`
- 등록: `src/data/characters.js` 의 `kind:'photo'` 항목(`assetBase`, `states`)
- 현재 `아리(aipup)` 는 **움직이는 플레이스홀더**(애니메이션 SVG 4종 + 샘플 `wag.webm` 영상)로
  동작을 시연 중입니다. AI 이미지/영상으로 교체하면 실사풍이 됩니다.
  (`type:'image'` 는 애니메이션 SVG, `type:'video'` 는 실제 webm 재생 경로를 보여줍니다.)

## 새 캐릭터 추가하기

모두 코드형이라 에셋 없이 캐릭터를 늘릴 수 있습니다.

1. `src/data/characters.js` 에 항목 추가 (creature면 `expressions`/`poses`/`tricks` 설정 포함).
2. 새 3D 컴포넌트 작성 (`Dog.jsx`/`Cat.jsx`를 참고 — 프리미티브 + `useFrame` 절차적 애니메이션).
3. `Play.jsx` 의 `CREATURES` 맵과 `CharacterPreview.jsx` 의 `id` 분기에 컴포넌트를 등록.

## 배경 테마 커스터마이징

`src/components/Stage.jsx` 의 `THEMES` 에서 `day`/`sunset`/`night` 각각의
하늘(`Sky`)·안개(`fog`)·조명(ambient/hemisphere/directional)·별(`Stars`) 값을 조절하세요.

## 배포 (GitHub Pages)

`.github/workflows/deploy.yml` 로 `main` 에 push 하면 자동 빌드 후 GitHub Pages 에 배포됩니다.
배포 주소: **https://ai-ondash.github.io/sites-pet/**

**최초 1회 저장소 설정**
- **Settings → Pages → Source** 를 **`GitHub Actions`** 로 지정.
- Pages 환경(`github-pages`)의 **배포 허용 브랜치**에 `main` 이 포함돼야 함(또는 제한 없음).

> `vite.config.js` 의 `base: '/sites-pet/'` 는 프로젝트 페이지 경로에 맞춘 값입니다.
> 저장소 이름이 바뀌면 이 값과 `deploy.yml` 의 브랜치명도 함께 수정하세요.
> 런타임에서 정적 파일을 불러올 땐 `import.meta.env.BASE_URL` 을 앞에 붙이세요.
