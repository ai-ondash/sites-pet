# 📸 포토펫 파이프라인 — 아티스트 없이 실사풍 펫 만들기

포토펫(`kind: 'photo'`)은 **AI가 생성한 실사풍 이미지/영상**을 상태별로 크로스페이드하며
숨쉬기·시선 패럴랙스·클릭 하트로 "살아있는 초상화"처럼 보여주는 캐릭터입니다.
3D 모델링/리깅이 없으므로 **아티스트 없이** 만들 수 있습니다.

> 트레이드오프: 자유롭게 돌려보는 실시간 3D가 아니라 정면 초상화/영상입니다.
> 대신 픽셀 자체가 AI 실사라 사실적으로 보입니다.

---

## 1. 폴더 & 등록 구조

```
public/photopets/<petId>/idle.(png|jpg|webp|mp4|webm)
                         happy....
                         sleepy....
```

`src/data/characters.js` 에 항목 추가:

```js
{
  id: 'aipup', kind: 'photo', name: '아리', species: 'AI 강아지', emoji: '🐕',
  tagline: '...', accent: '#d8a76a',
  assetBase: 'photopets/aipup/', defaultState: 'idle',
  states: [
    { key: 'idle',   label: '🙂 평온', type: 'image', src: 'idle.webp'  },
    { key: 'happy',  label: '😄 행복', type: 'video', src: 'happy.webm' }, // 영상도 가능
    { key: 'sleepy', label: '😴 졸림', type: 'image', src: 'sleepy.webp' },
    { key: 'play',   label: '🎾 신남', type: 'image', src: 'play.webp'  },
  ],
}
```

- `type: 'image'` → `<img>`, `type: 'video'` → 자동재생·무한루프·무음 `<video>`.
- 그 외 코드 변경 불필요 — 갤러리 카드·플레이 페이지·상태 버튼이 자동 구성됩니다.

---

## 2. 이미지 생성 (실사풍)

**추천 툴**: Flux.1 [dev/pro], Midjourney v6+, Stable Diffusion XL, Google Imagen, DALL·E 3.

**핵심 = 같은 강아지로 보이게(일관성)**. 아래 중 하나로 캐릭터를 고정하세요.
- 같은 **seed** + 같은 상세 묘사(품종·색·마킹·눈색) 반복
- **character reference**(Midjourney `--cref`, Flux/SDXL의 IP-Adapter/reference)
- 먼저 기준 이미지 1장 → 나머지 상태는 **image-to-image / inpainting**으로 표정만 변경

**프롬프트 템플릿** (정면 상반신, 배경 단순, 세로 구도):
```
photorealistic portrait of a fluffy golden retriever puppy, {STATE},
looking at camera, front view, upper body, studio soft light, shallow depth of field,
clean warm gradient background, high detail fur, 85mm, vertical 9:11
```
`{STATE}` 예시:
- idle: `calm relaxed expression, mouth closed`
- happy: `happy open mouth, tongue out, bright eyes`
- sleepy: `sleepy half-closed eyes, drowsy`
- play: `excited playful expression, ears up`

**팁**
- 구도(정면·상반신·세로)를 상태마다 동일하게 → 크로스페이드가 자연스러움.
- 배경을 단순 그라디언트로 → 프레임에 넣었을 때 깔끔.
- 출력은 `webp`(권장) 또는 `jpg`로, 폭 900~1200px면 충분.

---

## 3. 동작 영상 생성 (선택 — "살아있는" 느낌 강화)

정지 이미지도 앱에서 숨쉬기·패럴랙스로 움직이지만, 실제 모션이 필요하면 **image-to-video**:

**추천 툴**: Runway Gen-3, Kling, Luma Dream Machine, Pika, Google Veo, Hailuo.

- 위에서 만든 상태 이미지를 입력으로 넣고 2~4초 **루프**를 생성.
- 프롬프트 예: `the puppy breathes gently and blinks, subtle head tilt, tail wag, camera still, seamless loop`
- 결과를 **webm(VP9)** 또는 **mp4(H.264)** 로, 720p·2~4초·5MB 이하 권장.
- 변환 예: `ffmpeg -i in.mp4 -c:v libvpx-vp9 -b:v 0 -crf 34 -an out.webm`
- 매니페스트에서 해당 상태를 `type: 'video'` 로 지정.

---

## 4. 체크리스트

- [ ] 상태별 에셋을 `public/photopets/<petId>/` 에 저장
- [ ] `characters.js` 에 `kind:'photo'` 항목 추가(`assetBase`, `states`)
- [ ] 정면·세로 구도 통일, 배경 단순
- [ ] 이미지 `webp`, 영상 `webm/mp4`(720p·수 MB)
- [ ] `npm run build` 후 확인

> 저작권: 생성 서비스의 상업적 사용 약관을 확인하세요. 실제 반려동물 사진을 학습/합성할 때 초상권/동의도 확인.
