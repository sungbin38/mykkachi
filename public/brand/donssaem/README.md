# 돈쌤 캐릭터

승인된 카피바라 캐릭터를 바탕으로 만든 사이트 에셋입니다. 생성은 내장 `image_gen` 도구를 사용했고, 웹 배포용 WebP 변환과 아이콘 리사이징은 sharp를 사용했습니다.

- `approved-v1.png` / `.webp`: 사용자가 승인한 보라색 배경 원본, 소셜 프로필과 별빛 색감의 기준 이미지.
- `share-v2.jpg`: 링크 카드용 1200×630 가로 이미지. 원본의 보라색 배경을 좌우로 확장하고 캐릭터 전체가 중앙에 들어오도록 구성. Open Graph와 Twitter에서 함께 사용.
- `mascot-v1.png` / `.webp`: 배경을 분리한 캐릭터, 홈페이지 메인, 공통 로고와 보조 영역. 홈페이지의 별빛 배경은 CSS로 이어지며 캐릭터에는 별도 이미지 배경을 두지 않습니다. 원형 로고에서는 추가 확대 없이 전체 이미지를 표시.
- `icon-v1.png`: 사이트 아이콘.
- `reading-v1.webp`: 책을 읽는 돈쌤, 리포트와 기초 사주 노트.
- `conversation-v1.webp`: 카피바라와 대화하는 돈쌤, 관계 노트.
- `journey-v1.webp`: 길을 걷는 돈쌤, 일과 운의 흐름 노트.

## 별밤 테마 v2

- `reading-v2.webp`: 보라색 별빛과 따뜻한 책상 조명의 독서 장면.
- `conversation-v2.webp`: 별밤 호숫가에서 마주 앉아 이야기를 나누는 장면.
- `journey-v2.webp`: 달과 별빛 아래 오솔길을 걷는 장면.
- 위 세 삽화는 모두 1536×1024이며, 홈페이지 리포트·노트와 한국어/번체중국어 전체 노트의 본문·공유 이미지에 공통 적용합니다. 내장 `image_gen`으로 편집하고 sharp로 WebP 최적화했으며 v1 원본은 보존합니다.

## 생성 프롬프트

### 공유 이미지 v2

내장 `image_gen`으로 `approved-v1.png`를 편집하고, sharp로 1200×630 JPEG를 최적화했습니다. 원본 파일은 보존합니다.

Use case: identity-preserve. Asset type: website Open Graph link-preview image. Edit target: the attached approved-v1.png square artwork of DON SSAEM capybara on purple starry background. Create a LANDSCAPE 1.91:1 canvas, ideally 1536x800, by extending ONLY the existing purple starry background to the left and right. Keep the EXACT original full-body capybara, face, pose, fur, teal Korean jacket, white collar, gold button and book unchanged. Retain original violet lighting, stars and purple floor. Center the original artwork and character. Fit the ENTIRE character from ears to feet within the central square safe area, with generous padding: character top around 14% canvas height, feet around 86%, character width <= 40% canvas width, so landscape social previews never crop head or feet. The new side areas should seamlessly continue the existing purple starry backdrop, no frames or panels. Do not zoom in. No text, logos, additional characters or objects.

### 1

Use case: background-extraction. Input image is the exact approved DON SSAEM capybara mascot. Edit ONLY background: remove the entire purple starry background and floor, deliver genuine transparent alpha. Preserve the original 3D caramel capybara identity exactly: long squared muzzle, small relaxed eyes, small ears, realistic short fur, compact full body, dark teal Korean wrap jacket with ivory collar and single small gold button, cream book held under arm. Keep same three-quarter pose facing left, silhouette, face and proportions. Gently neutralize purple rim light for use on a pale mint website. No added objects, no text. Full character visible with a little breathing room. High quality 3D rendering.

### 2

Use case: stylized-concept. Input image is the approved DON SSAEM capybara character identity reference. Create a landscape 3:2 editorial 3D illustration for this Korean saju consultation website. Preserve recognizably the same caramel capybara long boxy muzzle, tiny relaxed eyes, small ears, short fur, dark teal Korean wrap jacket, ivory collar and small gold button. The capybara sits at a simple light oak desk reading an open cream book carefully, one paw gently on the page. A ceramic tea cup and a few paper sheets nearby. Calm spacious mint-gray studio background, soft daylight from left, beautifully detailed soft 3D materials, premium friendly film quality, no exaggerated smile. Character placed slightly right of center with breathing room. No text, letters, numbers, writing, magpie, sparkles or purple background.

### 3

Use case: stylized-concept. Editorial 3D illustration, landscape 3:2. Reference image identifies the exact approved DON SSAEM capybara: caramel short fur, elongated boxy muzzle, tiny relaxed eyes, small ears, teal Korean wrap jacket with ivory collar and small gold button. Preserve this identity. Premium soft detailed 3D materials, quiet thoughtful welcoming mood, restrained natural mint and teal palette with warm caramel fur, soft daylight. No text, watermarks, symbols, magpies, purple, or sparkles. Scene: Don Ssaem on the right sits beside another simple uncostumed brown capybara on the left, both facing gently toward one another with room between them, beneath a small tree by a still pond. Intimate thoughtful conversation, listening, a few smooth stones and fresh leaves, wide uncluttered airy composition, characters large enough to recognize at thumbnail size, background soft out of focus.

### 4

Use case: stylized-concept. Editorial 3D illustration, landscape 3:2. Reference image identifies the exact approved DON SSAEM capybara: caramel short fur, elongated boxy muzzle, tiny relaxed eyes, small ears, teal Korean wrap jacket with ivory collar and small gold button. Preserve this identity. Premium soft detailed 3D materials, quiet thoughtful welcoming mood, restrained natural mint and teal palette with warm caramel fur, soft daylight. No text, watermarks, symbols, magpies, purple, or sparkles. Scene: Don Ssaem carrying the same small cream book under one arm walks along a gently winding stone path through soft mint-green rolling hills. Three-quarter side view, whole body visible, quietly looking ahead. Dawn sky, few soft clouds, minimal plant life, a sense of moving at one's own pace, beautifully simple open landscape, character fairly prominent lower right, no buildings.

### reading v2 — 보라색 별밤 편집

```text
Mode: Built-in image_gen edit
Source: /Users/adapt/.codex/generated_images/01a116e1-33e9-7e91-a04f-2699e6131464/exec-62c1f4f0-44a7-44c2-a6bb-a5a3849a8d0a.png
Final: public/brand/donssaem/reading-v2.webp

Use case: lighting-weather
Asset type: finished illustration for the Don Ssaem saju consultation website, landscape image 1536x1024 pixels, exact 3:2 aspect ratio.
Input images: Image 1 (reading-v1.webp) is the edit target and MUST retain its scene and composition. Image 2 (approved-v1.png) is the approved same character identity and purple starlight lighting reference.
Primary request: Re-theme Image 1 from pale mint daylight to an elegant deep-purple and lavender nighttime atmosphere matching Image 2 and the website. Keep the same calm golden-brown capybara sitting at the wooden desk, its exact sleepy friendly facial structure, small dark eyes, long muzzle, furry ears, blue hanbok with white collar and small gold clasp, paws resting beside the open cream book, tea cup, wooden chair and desk. Preserve the framing and desk scene.
Scene/backdrop: Replace the pale mint room background with softly graded dark plum and violet (#21183f and #30254f), subtle lavender haze and sparse delicate warm starlight glints. A quiet dreamy evening reading space, not a noisy galaxy. The background is visibly purple throughout; no pale green or mint areas.
Lighting/mood: Warm soft off-camera desk-lamp illumination falls on the book, warm wooden desktop and golden fur; restrained lavender rim light on the character and shadow side. The cream book pages and face remain legible.
Style/medium: premium cinematic 3D character illustration with soft detailed fur, woven blue hanbok fabric, subtle natural wood grain, lovely soft depth of field. Retain the exact approved character design.
Constraints: No added characters, no visible lettering or symbols on book pages, no text, logo, watermark, border, rounded corners or UI. No new lamp prop necessary. Keep all key objects in the target composition intact. Full bleed exact 3:2 horizontal image.
```

### conversation v2 — 보라색 별밤 편집

```text
Use case: lighting-weather
Asset type: Donssaem website story illustration, landscape 1536x1024, 3:2.
Input images: Image 1 conversation-v1.webp is the edit target. Image 2 approved-v1.png is the approved character identity and purple starlit lighting reference.
Primary request: Transform the existing daytime riverside conversation into the same elegant purple starry night visual world as the reference. Preserve two capybaras quietly facing each other under the tree beside water, their exact placement, expressive faces and poses. Keep the right capybara Donssaem's long snout, golden-brown detailed fur, teal-blue Korean hanbok jacket, cream collar, gold button and book. Keep the left capybara naturally unclothed as in the target.
Scene/backdrop: Deep violet and plum night sky with sparse delicate lavender stars and tiny warm star glows, tree and lakeside foliage now in muted purple shadow, gentle reflections. Remove the mint-green/daylight feel. Face and fur remain warmly lit and clearly readable; soft lavender rim light.
Style: High-quality cinematic soft 3D illustration matching both provided images, tactile fur and cloth.
Constraints: Preserve character identities, expressions, poses and narrative composition. Show all feet. No extra characters, no text, no symbols, no watermark, no decorative frame. Output exactly one landscape 3:2 image.
```

### journey v2 — 보라색 별밤 편집

```text
Use case: lighting-weather
Asset type: Donssaem website story illustration, landscape 1536x1024, 3:2.
Input images: Image 1 journey-v1.webp is the edit target. Image 2 approved-v1.png is the approved character identity and purple starlit lighting reference.
Primary request: Transform the existing daytime journey scene into the same elegant purple starry night visual world as the reference. Preserve Donssaem walking on the gently winding stone path with his book, his existing placement and walking pose, full body and all feet. Keep the character's long snout, golden-brown detailed fur, teal-blue Korean hanbok jacket, cream collar, gold button and book exactly recognizable.
Scene/backdrop: Deep violet and plum night sky with sparse delicate lavender stars, a subtle moon glow at the distant horizon, soft layered lavender hills and vegetation in muted purple shadow, a few tiny warm firefly-like lights beside the path. Replace sunset and mint-green daylight entirely with purple night. Fur stays warm and readable with soft lavender rim light and gentle moonlight.
Style: High-quality cinematic soft 3D illustration matching both provided images, tactile fur and cloth, reassuring and quiet atmosphere.
Constraints: Preserve character identity, expression, pose, journey narrative and winding path composition. No extra characters, no text, no symbols, no watermark, no decorative frame. Output exactly one landscape 3:2 image.
```
