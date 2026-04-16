---
title: 소스맵(Sourcemap)이란? — 빌드 코드와 원본 코드를 잇는 다리
date: 2026-04-02
updated: 2026-04-02
tags:
  - javascript
  - build-tools
  - security
  - devops
  - compilation
  - debugging
  - build-process
  - deployment
  - web
summary: "소스맵 파일의 역할과 구조를 이해하고, 프로덕션에서 소스맵 노출이 왜 보안 문제인지 설명"
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---
# 소스맵(Sourcemap)이란? — 빌드 코드와 원본 코드를 잇는 다리

_written by Claude-Code_

최근 Claude Code에서 소스맵 파일이 배포 패키지에 포함되어 내부 소스 코드가 노출되는 사고가 있었다.  
소스맵이 무엇인지, 왜 문제가 되는지 정리한다.

---

## 1. 왜 소스맵이 필요한가?

JavaScript/TypeScript 코드는 배포 전에 이런 변환을 거친다:

```
원본 코드 (가독성 있음)          →   배포 코드 (압축/난독화)
src/auth/login.ts               →   dist/bundle.min.js
```

압축된 배포 코드에서 에러가 발생하면 스택 트레이스가 이렇게 보인다:

```
TypeError: Cannot read properties of undefined
    at a.b (bundle.min.js:1:48291)   ← 어떤 파일인지, 몇 번째 줄인지 알 수 없음
```

소스맵이 있으면 브라우저 DevTools가 이걸 원본 코드로 복원해 준다:

```
TypeError: Cannot read properties of undefined
    at loginUser (src/auth/login.ts:42:8)   ← 파일명과 줄 번호가 정확히 표시됨
```

---

## 2. 소스맵 파일의 구조

소스맵은 `.map` 확장자를 가진 JSON 파일이다.

```json
{
  "version": 3,
  "file": "bundle.min.js",
  "sources": [
    "src/auth/login.ts",
    "src/utils/crypto.ts"
  ],
  "mappings": "AAAA,SAAS,SAAS,CAAC,IAAI...",
  "sourcesContent": [
    "// src/auth/login.ts 원본 코드 전체",
    "// src/utils/crypto.ts 원본 코드 전체"
  ]
}
```

주요 필드:

| 필드 | 설명 |
|------|------|
| `sources` | 원본 파일 경로 목록 |
| `mappings` | 압축 코드 위치 → 원본 위치 매핑 (Base64 VLQ 인코딩) |
| `sourcesContent` | **원본 소스 코드 전체 내용** (옵션이지만 대개 포함됨) |

`sourcesContent` 필드가 핵심이다. 이 필드에 원본 파일의 전체 소스 코드가 문자열로 들어있다.

---

## 3. 소스맵이 노출되면 무슨 일이 생기나?

소스맵은 개발자의 디버깅 도구다. 그런데 이 파일이 외부에 공개된 서버에 그대로 올라가면 어떻게 될까?

```
bundle.min.js      → 난독화되어 있음, 해석 어려움
bundle.min.js.map  → 원본 소스 코드가 그대로 들어있음
```

공격자가 `.map` 파일에 접근하면:

- **내부 파일 구조** 파악 가능 (`src/auth/`, `src/utils/` 등 경로 노출)
- **비즈니스 로직** 분석 가능 (알고리즘, 인증 흐름 등)
- **보안 취약점** 찾기가 훨씬 쉬워짐 (코드를 읽을 수 있으니)
- **하드코딩된 민감 정보** 발견 가능 (API 엔드포인트, 내부 도메인 등)

---

## 4. Claude Code 소스맵 유출 사례

Claude Code는 Node.js/TypeScript로 만들어진 CLI 앱이다.  
배포 패키지 안에 `.map` 파일이 포함되어 있었고, 이를 통해 Anthropic의 내부 소스 코드 구조가 드러났다.

```
npm 패키지 (공개됨)
├── dist/
│   ├── index.js           ← 압축된 코드
│   └── index.js.map       ← 원본 소스 코드 포함 (의도치 않게 포함됨)
```

이런 실수는 빌드 설정에서 소스맵 파일을 배포 대상에서 제외하지 않았을 때 발생한다.

---

## 5. 올바른 소스맵 운영 방법

### 개발 환경 — 소스맵 켜기

```js
// webpack.config.js (dev)
module.exports = {
  devtool: 'eval-source-map',  // 빠르고 상세한 소스맵
}
```

브라우저 DevTools에서 원본 코드를 바로 볼 수 있어 디버깅이 편리해진다.

### 프로덕션 환경 — 소스맵 분리 또는 제외

```js
// webpack.config.js (prod)
module.exports = {
  devtool: false,              // 소스맵 완전 비활성화
  // 또는
  devtool: 'hidden-source-map' // 파일은 만들되, 번들에서 참조 제거
}
```

`hidden-source-map`은 `.map` 파일을 생성하되, 번들 코드에서 해당 파일을 가리키는 주석을 제거한다.  
그 후 `.map` 파일을 Sentry 같은 에러 모니터링 서비스에만 업로드하고, 공개 서버에는 올리지 않는다.

```
[ 권장 프로덕션 플로우 ]

빌드
 │
 ├─ bundle.min.js       → CDN/서버 배포 (공개)
 └─ bundle.min.js.map   → Sentry 업로드만 (비공개), 서버에는 올리지 않음
```

---

## 6. 빠른 확인 방법

배포된 사이트에 소스맵이 노출되어 있는지 확인하려면:

1. 브라우저 DevTools → Sources 탭에서 원본 파일 구조가 보이는지 확인
2. `bundle.min.js`의 마지막 줄에 아래 주석이 있으면 소스맵이 연결된 것:
   ```
   //# sourceMappingURL=bundle.min.js.map
   ```
3. 해당 `.map` URL에 직접 접근해서 응답이 오는지 확인

---

## 정리

```
소스맵 = 빌드된 코드 ↔ 원본 코드 사이의 위치 매핑 정보

개발 환경 → 소스맵 켜기  (디버깅 필수)
프로덕션  → 소스맵 끄거나, 에러 모니터링 서비스에만 비공개 업로드
```

소스맵 자체는 개발 생산성을 높이는 유용한 도구다.  
문제는 보안을 고려하지 않고 그대로 배포하는 것이다.

---

→ 관련 글: [[infrastructure/dev-vs-production-environment|개발 환경 vs 프로덕션 환경, 무엇이 다른가?]]
