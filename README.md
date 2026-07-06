# 🐾 Sites Pet · 3D

React Three Fiber 기반 3D 웹 스타터. **절차적 하늘/별/구름 배경 + 애니메이션 캐릭터 + WASD 조작**이 바로 동작합니다.

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

카드를 누르면 해당 캐릭터 플레이 페이지로 이동하고, 좌상단 **← 목록**으로 돌아옵니다.
새 캐릭터는 `src/data/characters.js`에 항목을 추가하고 `Play.jsx`/`CharacterPreview.jsx`에
`id` 분기를 더하면 됩니다.

## 조작

### 로봇 캐릭터
- **이동**: `W A S D` 또는 방향키 (카메라 정면 기준)
- **달리기**: `Shift`
- **시점**: 마우스 드래그로 회전 / 휠로 줌 (모바일 터치 지원)
- **동작 버튼**: 인사 👋 · 춤 💃 · 점프 ⬆️ · 끄덕 ✅

### 강아지 컴패니언 (코드로 제작한 스타일라이즈드 강아지)
우하단 패널에서 조작:
- **표정**: 😄 행복 · 😢 슬픔 · 😮 놀람 · 😴 졸림 · 🥰 사랑
  (눈 뜸/감음·귀 방향·입/혀·눈썹·볼터치·자동 깜빡임이 표정마다 다르게 애니메이션)
- **액션**: 🧍 대기(호흡) · 🚶 걷기(다리 스윙) · 🐕‍🦺 앉아 · 🦘 점프 · 🌀 빙글(1회 회전)
- 꼬리는 표정(기분)에 따라 흔들리는 속도가 달라집니다.

## 구조

```
public/models/character.glb   ← 로봇 3D 에셋 (애니메이션 13종 포함)
src/
  App.jsx                     ← 라우터 (HashRouter: 홈 / 플레이)
  data/characters.js          ← 캐릭터 레지스트리(메타데이터)
  pages/
    Home.jsx                  ← 소개 갤러리
    Play.jsx                  ← 캐릭터별 플레이 화면 + 컨트롤
  components/
    Stage.jsx                 ← 플레이용 공용 3D 무대(배경/조명/지형/카메라)
    CharacterPreview.jsx      ← 갤러리 카드용 회전 미리보기
    Character.jsx             ← 로봇 (로드 + 이동/회전 + 애니메이션 상태머신)
    RobotModel.jsx            ← 로봇 표시용 경량 모델(미리보기/소개용)
    Dog.jsx                   ← 강아지 (프리미티브 절차적 제작 + 표정/액션 애니메이션)
    Ground.jsx                ← 지면
    Loader.jsx                ← 로딩 진행률
  hooks/useKeyboard.js        ← 키보드 입력
```

## 캐릭터 애니메이션 목록

현재 샘플 모델(RobotExpressive)에 포함된 클립:
`Idle`, `Walking`, `Running`, `Dance`, `Jump`, `Wave`, `Yes`, `No`, `Punch`, `ThumbsUp`, `Sitting`, `Standing`, `Death`

## 내 캐릭터로 교체하기

1. [Mixamo](https://www.mixamo.com) 에서 캐릭터 + 애니메이션(Idle, Walking, Running 등)을 받아 **glTF(.glb)** 로 export
   (또는 Blender에서 직접 제작 후 glb export, [Ready Player Me](https://readyplayer.me) 아바타 등)
2. `public/models/character.glb` 를 교체
3. `src/components/Character.jsx` 의 애니메이션 클립 이름(`'Idle'`, `'Walking'` …)을
   새 모델의 클립 이름에 맞게 수정
4. 크기가 안 맞으면 `<primitive ... scale={0.35} />` 값 조정

> 팁: 콘솔에서 `animations.map(a => a.name)` 를 찍어보면 클립 이름을 확인할 수 있습니다.

## 배경 커스터마이징

`src/components/Experience.jsx` 에서:
- `<Sky />` : 태양 위치/대기 산란 조절
- `<Stars />`, `<Cloud />` : 별·구름
- `<Environment preset="sunset" />` : `dawn`, `night`, `forest`, `city` 등으로 변경
- `<fog />` : 안개 색/거리
- 지형을 `.glb` 모델로 바꾸려면 `Ground.jsx` 를 `useGLTF` 로딩으로 교체

## 배포 (GitHub Pages)

`.github/workflows/deploy.yml` 이 포함되어 있어, 이 브랜치에 push 하면 자동으로
빌드 후 GitHub Pages 에 배포됩니다.

**최초 1회 설정** (저장소 소유자가 해야 함):

1. GitHub 저장소 → **Settings → Pages** 이동
2. **Build and deployment → Source** 를 **`GitHub Actions`** 로 선택
3. 저장 후, 다음 push(또는 Actions 탭에서 `Deploy to GitHub Pages` 수동 실행)부터 배포됨

배포 주소: **https://ai-ondash.github.io/sites-pet/**

> `vite.config.js` 의 `base: '/sites-pet/'` 는 프로젝트 페이지 경로에 맞춘 값입니다.
> 저장소 이름이 바뀌면 이 값과 `deploy.yml` 의 브랜치명도 함께 수정하세요.
> 런타임에서 `.glb` 등 정적 파일을 불러올 땐 반드시 `import.meta.env.BASE_URL` 을
> 앞에 붙여야 합니다 (하드코딩된 `/models/...` 경로는 배포 시 404).

## 에셋 라이선스

샘플 캐릭터 `RobotExpressive.glb` 는 three.js 예제 에셋(CC-BY, by Tomás Laulhé / Don McCurdy)입니다.
상용 배포 시 본인 에셋으로 교체하세요.
