---
title: React 기능 구조와 훅 완전 정리 — useState부터 useMemo까지
date: 2026-04-16
updated: 2026-04-16
tags:
  - react
  - react-native
  - hooks
  - useState
  - useEffect
  - useMemo
  - useCallback
  - useRef
  - useContext
  - javascript
  - frontend
  - component
  - virtual-dom
  - performance
  - optimization
summary: "React 기능 전체 구조와 훅의 등장 배경, 대표 훅 실무 사용법을 핵심만 정리. React Native도 동일한 훅을 그대로 사용한다."
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---
# React 기능 구조와 훅 완전 정리 — useState부터 useMemo까지

_written by Claude-Code_

---

> 배경 : 임시코드, 테스트코드, 디버깅용 코드, 안쓰는 코드를 제거/정리하는 과정에서 useMemo로 로직을 효율화하자는 codex의 제안이 있었다. 이에 **React 기능 구조와 훅** 에 대해 글을 작성한다.


## 1. 왜 React가 등장했나?

jQuery 시대엔 "버튼 클릭 → DOM을 직접 찾아서 수정"했다.  
앱이 커질수록 **상태와 UI가 따로 놀기 시작**했고, 버그 추적이 지옥이 됐다.

```
[기존 방식]
상태 변경 → 개발자가 직접 DOM 업데이트
  → 어디서 뭘 바꿨는지 추적 어려움

[React 방식]
상태 변경 → React가 자동으로 UI 동기화
  → 개발자는 "상태"만 관리하면 됨
```

> **핵심 철학: UI = f(state)**  
> 상태(state)가 정해지면 UI는 자동으로 결정된다.

---

## 2. React 기능 전체 구조

```
React
  │
  ├── 컴포넌트 (Component)
  │     UI를 재사용 가능한 조각으로 나누는 단위
  │     function Button() { return <button>클릭</button> }
  │
  ├── JSX
  │     JS 안에서 HTML처럼 쓰는 문법
  │     실제로는 React.createElement() 호출로 변환됨
  │
  ├── Props
  │     부모 → 자식 방향으로 데이터를 내려보내는 방법
  │     <Button label="저장" onClick={handleSave} />
  │
  ├── 훅 (Hooks) ★
  │     함수 컴포넌트에서 React 기능을 빌려 쓰는 도구
  │     useState, useEffect, useMemo 등
  │
  ├── Context
  │     Props 없이 멀리 있는 컴포넌트까지 데이터 전달
  │     전역 상태 (테마, 로그인 유저 등)
  │
  └── Virtual DOM
        실제 DOM 대신 메모리에서 변경점 비교
        최소한의 부분만 실제 DOM에 반영 → 성능 최적화
```

실무에서 매일 쓰는 것: **컴포넌트 + JSX + Props + 훅** 이 4가지가 코드의 90%다.

---

## 3. 훅이란?

React 16.8(2019)에 도입. 클래스 컴포넌트 없이도 상태와 생명주기를 쓸 수 있게 됐다.

```js
// 훅 이전 — 클래스 필수
class Counter extends React.Component {
  state = { count: 0 }
  componentDidMount() { /* 마운트 후 실행 */ }
  render() { return <div>{this.state.count}</div> }
}

// 훅 이후 — 함수로 동일하게
function Counter() {
  const [count, setCount] = useState(0)   // 상태
  useEffect(() => { /* 마운트 후 실행 */ }, [])
  return <div>{count}</div>
}
```

**규칙:**
- 이름이 항상 `use`로 시작
- 컴포넌트 최상단에서만 호출 (if문·반복문 안 금지)
- React 함수 컴포넌트 안에서만 사용

---

## 4. 대표 훅

### ⭐ useState — 상태 관리

가장 기본. 값이 바뀌면 컴포넌트를 다시 렌더링한다.

```js
const [count, setCount] = useState(0)
//     현재값   변경함수   초기값

setCount(count + 1)  // 호출하면 화면 자동 업데이트
```

---

### ⭐ useEffect — 부수효과 처리

렌더링 후 실행할 작업을 등록한다.  
API 호출, 이벤트 등록, 타이머, 구독 등.

```js
useEffect(() => {
  // 실행할 작업
  fetchData()

  return () => {
    // 정리(cleanup): 컴포넌트 제거 시 실행
    // 이벤트 해제, 타이머 취소 등
  }
}, [의존성배열])
```

| 의존성 배열 | 실행 시점 |
|---|---|
| 없음 | 매 렌더링마다 |
| `[]` | 마운트 시 딱 한 번 |
| `[value]` | `value`가 바뀔 때마다 |

> 실무 주의: 의존성 배열 빠뜨리면 무한 루프 발생

---

### ⭐ useMemo — 계산 결과 캐싱

**렌더링마다 반복되는 무거운 계산을 방지.**  
의존성이 바뀌지 않으면 이전 결과를 재사용한다.

```js
const result = useMemo(() => {
  return expensiveCalculation(data)  // 무거운 계산
}, [data])  // data가 바뀔 때만 재계산
```

```
useMemo 없을 때:
  렌더링마다 → expensiveCalculation 실행 → 느림

useMemo 있을 때:
  data 변경 없음 → 캐시된 결과 재사용 → 빠름
  data 변경됨   → 재계산 후 캐싱
```

> 모든 곳에 쓰면 오히려 역효과. **실제로 느린 계산에만** 적용.

---

### useCallback — 함수 캐싱

useMemo의 함수 버전. **자식 컴포넌트에 함수를 props로 넘길 때 불필요한 재생성 방지.**

```js
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])  // id가 바뀔 때만 함수 재생성
```

> useMemo는 값 캐싱, useCallback은 함수 캐싱. 본질은 같다.

---

### useRef — DOM 접근 & 값 유지

두 가지 용도로 쓴다.

```js
// 1. DOM 직접 접근
const inputRef = useRef(null)
<input ref={inputRef} />
inputRef.current.focus()  // 포커스 강제 이동

// 2. 렌더링 없이 값 유지 (타이머 ID, 이전 값 저장 등)
const timerRef = useRef(null)
timerRef.current = setTimeout(...)
```

> useState와 달리 값이 바뀌어도 **렌더링을 유발하지 않는다.**

---

### useContext — 전역 데이터 접근

Props를 여러 단계 내려보내지 않고 어디서든 바로 접근.

```js
// 1. Context 생성
const ThemeContext = createContext('light')

// 2. 제공
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 3. 어디서든 사용
const theme = useContext(ThemeContext)  // 'dark'
```

---

## 5. 훅 선택 기준

```
값을 기억하고 화면을 바꾸고 싶다     → useState
렌더링 후 무언가 실행하고 싶다       → useEffect
무거운 계산 결과를 캐싱하고 싶다     → useMemo   ★ 성능 최적화
함수를 캐싱해서 자식 재렌더링 방지   → useCallback
DOM에 직접 접근하거나 값만 유지      → useRef
멀리 있는 컴포넌트에 데이터 전달     → useContext
```

---

## 6. React와 React Native의 관계

```
React (웹)
  └── React Native (모바일)
        ↑
        React의 훅을 그대로 사용
        (useState, useEffect, useMemo 등 동일)
```

훅은 **완전히 동일**하고, 렌더링 대상만 다르다.

| | React (웹) | React Native (모바일) |
|---|---|---|
| 훅 | `useState`, `useEffect` … | 동일 |
| UI 컴포넌트 | `<div>`, `<span>`, `<button>` | `<View>`, `<Text>`, `<TouchableOpacity>` |
| 스타일 | CSS | `StyleSheet.create({})` |
| 내비게이션 | React Router | React Navigation |

> React를 배우면 React Native도 **훅·컴포넌트 개념은 그대로 적용**된다.

---

## 참고

- [[javascript/how-javascript-runs|자바스크립트는 어떻게 실행되는가]]
- [[mobile/how-react-native-runs|React Native는 어떻게 실행되는가]]
- [[mobile/react-native-hermes-runtime|React Native Hermes 런타임]]
