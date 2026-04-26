---
title: Metro 번들러와 React Native 앱 실행 구조 — 디버그 vs 프로덕션
date: '2026-04-09'
updated: '2026-04-26'
tags:
  - react-native
  - metro
  - bundler
  - javascript
  - hermes
  - jsi
  - bridge
  - android
  - ios
  - mobile
  - debug
  - production
  - fast-refresh
  - yoga
  - shadow-thread
  - native-modules
  - operating-system
  - build-process
  - lymphedema
  - icon
related_projects: []
summary: Metro 번들러의 역할부터 디버그·프로덕션 모드의 차이, 모바일 OS에서 JS가 화면에 그려지기까지의 전체 흐름을 정리
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# Metro 번들러와 React Native 앱 실행 구조 — 디버그 vs 프로덕션

_written by Claude-Code_

## Metro란?

Metro는 React Native 전용 JavaScript 번들러다. 여러 JS 파일을 하나의 번들로 묶고, 개발 중에는 변경 사항을 실기기에 실시간으로 전달한다.

---

## 디버그 모드 — Metro 서버를 통한 실행

### 전체 흐름

```
PC (개발 환경)
├── JS 소스 코드
├── Metro (localhost:8081)
└── ADB / USB

        USB 또는 Wi-Fi
              ↕

실기기
├── Native shell (APK 설치됨)
└── JS 번들 ← Metro에서 HTTP로 수신
```

### 단계별 동작

**① Metro 서버 시작**

```bash
npx react-native start
```

- `localhost:8081`에서 HTTP 서버 실행
- 소스 파일 변경 감시 시작

**② 앱 빌드 & 설치**

```bash
npx react-native run-android
```

- Native 코드(Java/Kotlin)만 컴파일
- JS 번들은 포함하지 않음
- ADB로 APK를 실기기에 설치 후 실행

**③ 앱 실행 시 번들 요청**

앱이 켜지는 순간:

```
실기기 → HTTP GET http://PC_IP:8081/index.bundle
                         ↓
              Metro가 JS 파일을 번들링해서 응답
                         ↓
              실기기 JS 엔진이 번들 수신 후 실행
```

**④ 코드 수정 → Fast Refresh**

```
개발자 코드 수정
      ↓
Metro가 변경 감지
      ↓
변경 모듈만 WebSocket으로 전송
      ↓
앱 재시작 없이 화면 갱신
```

> "번들이 갱신되지 않았다"는 것은 Metro가 변경을 감지하지 못하거나 캐시된 번들을 그대로 사용해 코드 수정이 앱에 반영되지 않은 상태를 말한다.
> 해결: `npx react-native start --reset-cache`

---

## 프로덕션 모드 — 번들이 앱 안에 포함

```bash
npx react-native build-android --mode=release
```

빌드 시점에 Metro가 모든 JS를 하나의 파일로 묶고, APK 안에 포함시킨다.

```
APK 내부
├── index.android.bundle  ← 빌드 때 Metro가 생성
├── assets/
└── native 코드 (Java/Kotlin)
```

설치된 앱은 Metro 서버 없이 패키지 내 번들을 직접 실행한다.

---

## 디버그 vs 프로덕션 비교

| 항목 | 디버그 | 프로덕션 |
|------|--------|----------|
| JS 번들 위치 | Metro 서버 (PC) | APK 내부 |
| Metro 서버 필요 | ✅ 필요 | ❌ 불필요 |
| JS 엔진 최적화 | 미적용 (인터프리터) | Hermes AOT 컴파일 |
| 소스맵 | 포함 (디버깅용) | 제거 또는 난독화 |
| 성능 | 느림 | 빠름 |
| Fast Refresh | ✅ 지원 | ❌ 없음 |
| 코드 노출 위험 | 낮음 (PC에 있음) | 번들 난독화 필요 |

### 각 모드에서 고려할 것

**디버그 모드**
- PC와 실기기가 같은 네트워크에 있어야 함 (Wi-Fi 연결 시)
- Metro 캐시가 오래되면 `--reset-cache`로 초기화
- 성능 측정은 디버그 모드에서 하지 말 것 — 실제 성능과 차이가 큼

**프로덕션 모드**
- JS 번들 난독화(minify) 설정 확인
- Hermes 엔진 활성화 여부 확인 — 시작 속도와 메모리 효율에 직결
- 소스맵은 별도 보관 (크래시 리포트 분석용)
- 번들 크기 최적화 (tree-shaking, 불필요한 패키지 제거)

---

## 모바일 앱 실행 구조 — OS부터 화면까지

### 레이어 구조

```
┌──────────────────────────────────────┐
│              Hardware                │
│       CPU / GPU / RAM / 센서         │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│           OS Kernel                  │
│  (Android: Linux / iOS: XNU Darwin)  │
│  프로세스·메모리·드라이버 관리        │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│         OS 미들웨어 프레임워크         │
│  Android: ART 런타임, Java Framework  │
│  iOS: Foundation, UIKit              │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│         React Native 앱 프로세스      │
│                                      │
│  ┌────────────┐    ┌───────────────┐  │
│  │ Native 스레드│   │  JS 스레드    │  │
│  │ UI 렌더링  │◄──►│  Hermes 엔진  │  │
│  │ 카메라/GPS │    │  JS 번들 실행 │  │
│  └────────────┘    └───────────────┘  │
│         ↕  Bridge / JSI              │
│  ┌────────────────────────────────┐   │
│  │         Shadow 스레드          │   │
│  │   레이아웃 계산 (Yoga 엔진)    │   │
│  └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

### JS 코드가 화면에 그려지는 흐름

```
JS 코드: <View style={{ width: 100 }}>
      ↓
JS 스레드: React가 컴포넌트 트리 계산
      ↓
Shadow 스레드: Yoga로 실제 픽셀 위치 계산
      ↓
Native 스레드: Android View / iOS UIView 생성
      ↓
OS가 GPU에 렌더링 명령 → 화면 출력
```

### 핵심 구성요소

| 구성요소 | 역할 |
|----------|------|
| **Hermes** | JS 번들을 실행하는 JS 엔진. 프로덕션에서 AOT 컴파일로 빠른 시작 |
| **Bridge / JSI** | JS ↔ Native 간 통신 채널. JSI는 Bridge보다 직접 호출로 빠름 |
| **Yoga** | Facebook이 만든 레이아웃 엔진. Flexbox를 네이티브 px로 변환 |
| **Shadow 스레드** | Yoga 계산 전담. UI 스레드 블로킹 방지 |
| **Native 스레드** | OS API 호출, 실제 UI 컴포넌트 생성·렌더링 |

---

## 정리

Metro는 개발 중에만 필요한 도구다. 출시 앱은 빌드 시 생성된 번들을 그대로 실행한다. 코드 한 줄이 화면에 나타나기까지 JS 스레드 → Shadow 스레드 → Native 스레드 → OS 렌더링의 과정을 거친다. 디버그 모드는 이 과정에서 Metro가 JS를 실시간 공급하고, 프로덕션은 번들이 앱 안에 고정되어 있다는 것이 핵심 차이다.

관련 글: [[how-react-native-runs|HW부터 React Native까지 — 모바일 앱 실행 구조]] · [[react-native-hermes-runtime|React Native Hermes 런타임]] · [[react-native-build-ecosystem|React Native 빌드 생태계 핵심 용어 정리]]
