---
title: RN 앱 실행 모드 4가지 — 실제 앱, 디버그, Fast Refresh, 테스트
date: 2026-04-13
updated: 2026-04-13
tags:
  - react-native
  - metro
  - hermes
  - jest
  - fast-refresh
  - debug
  - testing
  - bundler
  - node
  - mobile
  - javascript
  - build-process
  - lymphedema
  - iCON
summary: "디버깅과 기능 개선을 반복하다 보면 마주치는 4가지 실행 모드 — 각각 완전히 다른 스택 위에서 동작한다"
devto: false
devto_id:
devto_url:
---

# RN 앱 실행 모드 4가지 — 실제 앱, 디버그, Fast Refresh, 테스트

앱을 고치다 보면 모드를 섞어 쓰게 된다. `npm test`도 돌리고, 기기에서 확인도 하고, 코드 저장하면 화면이 바뀌기도 한다. 이게 다 같은 방식으로 동작한다고 생각하기 쉬운데, **스택이 완전히 다르다.**

---

## 스택 구조 — 실제 앱 vs 테스트

![React Native 앱의 레이어 구조|697](/assets/posts/mobile/rn-execution-modes/rn_layer_stack.svg)

**실제 앱 실행** (왼쪽)과 **테스트 실행** (오른쪽)은 OS 위에 아예 다른 환경이 올라간다.

|            | 실제 앱 실행                 | 디버그 번들              | 테스트 실행 (`npm test`) |
| ---------- | ----------------------- | ------------------ | ------------------- |
| JS 실행 주체   | Hermes (AOT)            | Hermes (인터프리터)     | Node.js + Jest      |
| JS 번들 위치   | APK 내부                 | Metro 서버 (PC)      | 없음                  |
| Native 레이어 | 있음 (Java/Kotlin, Swift) | 있음                 | **없음**              |
| 실기기 필요     | 있음                      | 있음                 | 없음                  |
| 카메라, 센서 등  | Bridge/JSI로 직접 호출       | Bridge/JSI로 직접 호출  | mock으로 대체해야 함       |
| Source Map  | ❌                       | ✅                  | ❌                   |

테스트 환경에서 PNG 이미지나 `@react-navigation` 같은 라이브러리를 mock 처리해야 하는 이유가 여기에 있다. **Native 레이어 자체가 없으니 처리할 주체가 없다.**

---

## 4가지 실행 모드

### 1. 실제 앱 실행 (Production)

```bash
npx react-native build-android --mode=release
```

- JS 번들이 APK 안에 포함된 채로 배포
- Metro 서버 없음. 기기가 APK 내부 번들을 직접 실행
- Hermes가 AOT 컴파일로 빠르게 실행
- **성능 측정은 이 모드에서만 의미 있다**

### 2. 디버그 번들 (Debug Build)

```bash
npx react-native run-android
```

![Debug Build 스택 구조|697](/assets/posts/mobile/rn-execution-modes/debug_build_stack.svg)

- Metro 서버(`localhost:8081`)가 JS 번들을 실시간으로 제공
- 기기가 앱 시작 시 Metro에서 번들을 HTTP로 받아 실행
- Hermes는 인터프리터 모드 — 프로덕션보다 느림
- Flipper / DevTools로 로그·네트워크·레이아웃 검사 가능
- Source Map이 활성화되어 에러 발생 시 원본 파일·라인 추적 가능
- 개발 중 기본 모드. **PC와 기기가 같은 네트워크에 있어야 함**

### 3. Fast Refresh

코드를 저장하는 순간 자동으로 작동한다. 별도 명령 없음.

![Fast Refresh — Metro와 앱의 WebSocket 연결|697](/assets/posts/mobile/rn-execution-modes/fast_refresh_architecture.svg)

```
파일 저장
  → Metro Watcher가 변경 감지
  → 변경된 모듈만 재변환
  → WebSocket으로 기기에 push
  → Hermes가 해당 모듈만 교체 (앱 재시작 없음)
  → React 리렌더링 — state 유지됨
```

- **앱 전체를 재시작하지 않아** 입력값·네비게이션 상태가 유지된다
- 디버그 모드 전용. **프로덕션 APK에는 Metro도 WebSocket도 없다**
- 단, 전역 state나 `useEffect` 초기화가 필요한 변경은 수동으로 앱을 재시작해야 반영된다

### 4. 테스트 실행 (`npm test`)

```bash
npm test
```

- Node.js 위에 Jest가 올라가서 앱 코드를 실행
- Hermes 없음, Native 레이어 없음, 실기기 없음
- Native 기능에 의존하는 모듈은 **mock 없이 그냥 돌리면 바로 에러**

```js
// 이런 mock이 필요한 이유
jest.mock('@react-navigation/native', () => ({ ... }));
jest.mock('react-native-camera', () => ({ ... }));
```

---

## 한눈에 비교

| | 실제 앱 | 디버그 번들 | Fast Refresh | 테스트 |
|---|---|---|---|---|
| Metro 필요 | ❌ | ✅ | ✅ | ❌ |
| Hermes | ✅ (AOT) | ✅ (인터프리터) | ✅ | ❌ |
| Native 레이어 | ✅ | ✅ | ✅ | ❌ |
| 앱 재시작 | - | 필요 | 불필요 | - |
| 성능 | 빠름 | 느림 | - | - |

---

## 정리

- **기능 동작 확인** → 디버그 번들 + Fast Refresh
- **성능 측정** → 반드시 프로덕션 빌드
- **로직 단위 검증** → 테스트 (`npm test`)
- **배포** → 프로덕션 빌드 (APK/AAB)

관련 글: [[react-native-metro-debug-prod|Metro 번들러와 React Native 앱 실행 구조 — 디버그 vs 프로덕션]]
