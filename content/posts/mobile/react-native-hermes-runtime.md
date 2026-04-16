---
title: React Native에서 Hermes란? 런타임, JSC 차이, 실행 흐름까지
date: 2026-04-05
updated: 2026-04-05
tags:
  - react-native
  - hermes
  - javascript
  - runtime
  - jsc
  - mobile
  - lymphedema
  - iCON
summary: "React Native에서 Hermes가 무엇인지, 런타임 개념, JSC와의 차이, JS 코드가 앱에서 실행되는 전체 흐름을 핵심만 정리"
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

# React Native에서 Hermes란? 런타임, JSC 차이, 실행 흐름까지

_written by Claude-Code_

React Native를 보다 보면 `Hermes`, `런타임`, `JSC`라는 말을 자주 보게 된다.  
이 셋은 결국 **React Native 앱 안에서 JavaScript가 어떻게 실행되는가**를 설명하는 핵심 개념이다.

---

## 1. Hermes가 뭐야?

`Hermes`는 **React Native용으로 최적화된 JavaScript 엔진**이다.  
쉽게 말하면, 앱 안에서 JavaScript 코드를 실제로 실행해 주는 프로그램이다.

주요 목적은 단순하다.

- 앱 시작 속도 개선
- 메모리 사용량 절감
- 모바일 환경에 맞는 가벼운 실행

도식으로 보면:

```text
React Native 앱
   │
   ├─ 화면 코드 작성: JavaScript / TypeScript
   │
   ▼
Hermes
   │
   └─ JS 코드를 읽고 실행함
```

즉, **Hermes는 React Native 앱의 JS 실행기**라고 보면 된다.

---

## 2. 런타임이 뭐야?

`런타임(runtime)`은 **코드가 실제로 돌아가는 실행 환경**이다.

코드는 파일 안에 적혀 있을 때는 그냥 텍스트다.  
그 코드를 읽고, 계산하고, 메모리를 관리하고, 결과를 내는 환경이 있어야 실제 동작한다.

```text
코드 작성
   │
   ▼
실행 환경 필요
   │
   ▼
런타임이 코드 실행
```

React Native에서는 보통 이 역할을 `Hermes`나 `JSC(JavaScriptCore)` 같은 JS 엔진이 맡는다.

정리하면:

- 코드 = 지시서
- 런타임 = 그 지시서를 실제 수행하는 실행 환경

---

## 3. Hermes와 JSC(JavaScriptCore) 차이

둘 다 JavaScript를 실행하는 엔진이지만, 지향점이 조금 다르다.

| 항목 | Hermes | JSC(JavaScriptCore) |
|------|--------|---------------------|
| 만든 곳 | Meta | Apple |
| 주 용도 | React Native 최적화 | Safari 및 범용 JS 실행 |
| React Native 적합성 | 높음 | 기본은 가능하지만 RN 특화는 아님 |
| 앱 시작 속도 | 보통 더 유리 | 상대적으로 불리할 수 있음 |
| 메모리 사용량 | 보통 더 적음 | 상대적으로 더 클 수 있음 |
| 현재 RN 흐름 | 많이 기본 선택 | 레거시/특수 경우 검토 |

핵심 비교:

```text
Hermes
  = React Native 앱 실행에 맞춰 가볍고 빠르게 설계

JSC
  = 범용 JavaScript 엔진
```

실무적으로는 보통 이렇게 이해하면 충분하다.

- 최신 React Native 프로젝트는 `Hermes`를 더 많이 사용
- 특별한 호환성 이슈나 레거시 사정이 있으면 `JSC`를 검토

---

## 4. React Native에서 JS 코드가 앱에서 실행되는 전체 흐름

React Native 코드는 브라우저에서 실행되는 것이 아니라, **앱 내부의 JS 엔진**에서 실행된다.

전체 흐름은 아래처럼 보면 된다.

```text
1. 개발자가 React Native 코드 작성
   │
   ▼
2. Metro가 JS 번들 생성
   │
   ▼
3. Hermes 또는 JSC가 JS 실행
   │
   ▼
4. React Native가 필요한 네이티브 기능 호출
   │
   ▼
5. iOS/Android 네이티브 UI로 화면 표시
```

조금 더 구체적으로 보면:

```text
JavaScript 코드
  function App() {
    return <Text>Hello</Text>
  }
        │
        ▼
[ Metro ]
  여러 JS 파일을 앱용 번들로 묶음
        │
        ▼
[ Hermes / JSC ]
  번들을 읽고 JS 실행
        │
        ▼
[ React Native Runtime ]
  JS 결과를 네이티브 UI 명령으로 변환
        │
        ▼
[ iOS / Android ]
  실제 Text, View, Button 같은 네이티브 컴포넌트 렌더링
```

중요한 점은 이것이다.

- React Native는 UI를 웹뷰로 그리지 않는다
- JS는 JS 엔진에서 실행된다
- 실제 화면은 iOS/Android의 네이티브 UI가 그린다

즉:

```text
JS가 비즈니스 로직과 UI 선언을 담당
네이티브가 실제 화면을 그림
```

---

## 5. 한 번에 정리

```text
Hermes = React Native용 JS 엔진
런타임 = 코드를 실제로 실행하는 환경
JSC = 다른 JS 엔진

React Native 실행 흐름:
코드 작성
  → Metro 번들링
  → Hermes/JSC 실행
  → React Native가 네이티브에 전달
  → iOS/Android 화면 출력
```

한 줄 요약:

> React Native에서 `Hermes`는 JavaScript를 실행하는 엔진이고, `런타임`은 그 실행 환경이며, `JSC`는 Hermes의 대안 엔진이다. 그리고 React Native 앱은 JS 코드가 엔진에서 실행된 뒤 네이티브 UI로 연결되어 화면에 표시된다.
