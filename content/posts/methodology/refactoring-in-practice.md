---
title: 리팩토링이란 무엇인가 — 정의, 유형, 실무적 유효성
date: 2026-04-20
updated: 2026-04-20
tags:
  - refactoring
  - code-quality
  - dead-code
  - duplication
  - abstraction
  - code-smell
  - clean-code
  - technical-debt
  - dry
  - extract-function
  - mobile
  - react-native
  - lymphedema
  - iCON
summary: "리팩토링의 정의와 버그 픽스와의 차이, 대표적인 유형 다섯 가지, 실무에서 리팩토링이 왜 필요한지 효과성 기준으로 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# 리팩토링이란 무엇인가 — 정의, 유형, 실무적 유효성

_written by Claude-Code_

## 배경

React Native 앱의 한/영 버전 파편화를 해소하는 작업을 하다가, 작업 항목이 두 종류로 나뉜다는 것을 확인했다.

영어 화면에 한국어 문구가 하드코딩된 것은 **버그 픽스**였다. 동작이 잘못됐기 때문이다. 반면 다음 세 가지는 성격이 달랐다.

- `saveMeasurementForSync` 공통 함수로 추출 → 한/영 양쪽에 중복 존재하던 저장 로직을 하나로
- 더미 저장 함수, 미사용 route 제거 → 동작에 영향 없이 불필요한 코드 삭제
- 한/영 구조 정렬 → 기능은 동일하지만 코드 일관성 확보

이 세 가지는 동작을 고친 게 아니었다. 구조를 정돈한 것이었다. 이것이 리팩토링이다.

---

## 리팩토링(Refactoring)의 정의

> 외부에서 관찰 가능한 동작을 바꾸지 않으면서, 내부 코드 구조를 개선하는 작업.

마틴 파울러(Martin Fowler)가 정의한 리팩토링의 핵심은 **불변 조건**이다: 리팩토링 전후에 기능이 달라지면 리팩토링이 아니다.

### 버그 픽스와의 차이

| 구분 | 리팩토링 | 버그 픽스 |
|------|----------|-----------|
| 목적 | 구조 개선 | 잘못된 동작 수정 |
| 동작 변화 | 없음 | 있음 (틀린 것 → 맞는 것) |
| 테스트 | 기존 테스트 통과 유지 | 실패하던 테스트가 통과로 바뀜 |
| 예시 | 중복 함수 추출 | 한국어 문구 → 영어로 교체 |

두 작업을 동시에 하는 것은 위험하다. 리팩토링 중에 버그를 같이 고치면, 어떤 변경이 어떤 결과를 낳았는지 추적하기 어려워진다. 가능하면 분리해서 커밋한다.

---

## 대표적인 리팩토링 유형

### 1. 중복 제거 (DRY — Don't Repeat Yourself)

같은 로직이 두 곳 이상에 있을 때 하나로 추출한다. 수정할 때 한 곳만 고치면 되고, 한쪽만 고쳐서 불일치가 생기는 상황을 막는다.

```tsx
// Before: 한/영 각각에 저장 로직이 중복
// ko/Home1_17Screen.tsx
await Storage.setItem('measurement', data);
await uploadToServer(data);

// en/Home1_17Screen.tsx
await Storage.setItem('measurement', data);
await uploadToServer(data);

// After: 공통 함수로 추출
import { saveMeasurementForSync } from '@/shared/sync';
await saveMeasurementForSync(data);
```

### 2. 불필요한 코드 제거 (Dead Code / Dummy Code)

실행 경로에 닿지 않거나, 개발 중 임시로 넣었다가 잊혀진 코드를 제거한다. 이런 코드는 읽는 사람을 혼란스럽게 하고, 나중에 실수로 활성화될 위험이 있다.

```tsx
// Before: 더미 저장 함수가 홈 화면에 잔존
const setDummyValues = async () => {
  await Storage.setItem('height', '170');
  await Storage.setItem('weight', '65');
};

// After: 제거
```

미사용 import, 주석 처리된 코드 블록, 도달 불가능한 조건문도 같은 범주다.

### 3. 함수/모듈 추출 (Extract Function)

하나의 함수가 너무 많은 일을 하거나, 특정 로직이 반복된다면 별도 함수나 모듈로 분리한다. 함수 이름이 의도를 설명하면 주석 없이도 코드를 읽을 수 있다.

```tsx
// Before: 화면 컴포넌트 안에 저장 + 업로드 + 이동이 모두 혼재
const handleSubmit = async () => {
  const data = collectData();
  await Storage.setItem('key', JSON.stringify(data));
  try {
    await fetch('/api/upload', { method: 'POST', body: JSON.stringify(data) });
  } catch (e) {}
  navigation.navigate('Result');
};

// After: 저장/동기화 책임을 분리
const handleSubmit = async () => {
  const data = collectData();
  const saved = await saveMeasurementForSync(data);
  if (saved) navigation.navigate('Result');
  triggerMeasurementSyncInBackground();
};
```

### 4. 이름 개선 (Rename)

변수명, 함수명, 파일명이 역할을 정확히 설명하지 않으면 읽는 사람이 추론에 시간을 쓴다. 이름 하나를 바꾸는 것도 리팩토링이다.

```tsx
// Before: 역할이 불분명한 이름
const getValues = async () => { ... };
const x = await getData();

// After: 의도가 드러나는 이름
const loadUserProfile = async () => { ... };
const profile = await loadUserProfile();
```

### 5. 구조 정렬 (Structural Alignment)

두 모듈, 두 버전, 또는 유사한 기능을 하는 두 컴포넌트가 서로 다른 구조를 가지면 유지보수 비용이 높아진다. 기능은 같고 구조만 다를 때 하나의 패턴으로 맞추는 것도 리팩토링이다.

한/영 화면의 초기화 흐름, 저장 방식, route 이동 순서를 동일한 구조로 맞춘 것이 여기에 해당한다.

---

## 실무적 유효성: 왜 리팩토링을 해야 하는가

### 버그가 숨기 어려워진다

코드가 중복되면 버그도 중복된다. 한쪽을 고쳐도 다른 쪽은 그대로다. 공통 함수가 하나라면 버그는 한 곳에서만 발생하고 한 곳에서만 고친다.

더미 코드나 죽은 코드가 쌓이면 실제 동작 경로를 파악하기 어렵다. 코드가 단순할수록 이상 동작을 빠르게 찾는다.

### 새 기능 추가 비용이 낮아진다

기능을 추가할 때마다 중복된 코드를 모두 수정해야 한다면, 추가 비용이 복제 수에 비례해서 늘어난다. 추상화가 되어 있으면 한 곳만 수정한다.

### 코드를 읽는 시간이 줄어든다

읽기 쉬운 코드는 이해 시간이 짧다. 이름이 명확하고, 함수가 한 가지 일만 하고, 불필요한 코드가 없으면 맥락 파악이 빠르다. 코드를 작성하는 시간보다 읽는 시간이 훨씬 많다는 점을 고려하면 이 효과는 누적된다.

### 팀 온보딩 비용이 낮아진다

새 팀원이 코드를 처음 볼 때 중복, 더미 코드, 불일관한 구조가 있으면 "이게 실제로 쓰이는 코드인가?" 를 판단하는 데 시간을 쓴다. 정돈된 코드는 의도를 빠르게 전달한다.

---

## 언제 하면 좋은가

리팩토링은 별도 스프린트를 잡아서 하는 작업이 아니다. 개발 흐름 안에 자연스럽게 끼워 넣는 것이 현실적이다.

**기능 완성 직후**: 방금 만든 코드가 동작하는 것을 확인한 다음, 중복이나 복잡한 부분을 정리한다. 기억이 가장 선명한 시점이다.

**버그 수정 직후**: 버그를 고치면서 해당 코드를 이미 읽은 상태다. 구조적 문제가 보이면 이어서 정리한다.

**리뷰 전**: PR을 올리기 전에 자신의 코드를 다시 읽으면서 불필요한 코드, 모호한 이름, 중복을 제거한다. 리뷰어의 시간을 아끼고 피드백 품질도 올라간다.

---

## 마무리

리팩토링은 코드를 예쁘게 만드는 작업이 아니다. 미래에 기능을 추가하거나 버그를 고칠 때 드는 비용을 낮추는 투자다.

오늘 공통 함수를 추출하고 더미 코드를 제거한 시간이, 다음 기능을 추가할 때 두 버전을 동시에 수정하거나 잘못된 코드를 추적하는 시간을 아껴준다.

파편화가 어떻게 생기고 어떻게 해소하는지는 [[rn-localization-version-drift|React Native 다국어 앱에서 버전 파편화가 조용히 생기는 이유]]에서, 공통 함수로 추출한 동기화 설계 원칙은 [[health-data-sync-strategy|의료 데이터 동기화 설계 전략]]에서 이어서 볼 수 있다.
