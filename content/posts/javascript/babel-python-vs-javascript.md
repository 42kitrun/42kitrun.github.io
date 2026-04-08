---
title: 이름이 같은 두 Babel — Python vs JavaScript
date: 2026-04-08
updated: 2026-04-08
tags:
  - python
  - javascript
  - react-native
  - babel
  - i18n
  - transpiler
  - build-tools
  - localization
  - frontend
  - dependency-management
summary: "같은 이름이지만 목적이 전혀 다른 Python Babel(국제화)과 JavaScript Babel(트랜스파일러)을 비교"
devto: false
devto_id:
devto_url:
---
# 이름이 같은 두 Babel — Python vs JavaScript

의존성을 정리하다 Python 프로젝트에서 쓰던 `babel`이 눈에 띄었다.  
React Native의 Babel과 이름은 같지만 완전히 다른 라이브러리다.

---

## Python Babel — 국제화(i18n) 라이브러리

날짜, 숫자, 통화, 언어 등을 로케일에 맞게 표현해 주는 라이브러리.

```bash
pip install babel
```

```python
from babel.dates import format_date
from babel.numbers import format_currency
from datetime import date

format_date(date(2026, 4, 8), locale='ko_KR')   # '2026년 4월 8일'
format_date(date(2026, 4, 8), locale='en_US')   # 'April 8, 2026'
format_currency(1234.5, 'USD', locale='ko_KR')  # 'US$1,234.50'
```

```
소스 코드
  │
  ▼
Python Babel
  │
  ├─ 날짜/시간  →  "2026년 4월 8일"  /  "April 8, 2026"
  ├─ 숫자/통화  →  "1,234.50"  /  "1.234,50"
  └─ 메시지     →  .po / .mo 파일로 번역 관리
```

---

## JavaScript Babel — 트랜스파일러

최신 JS 문법(ES6+)과 JSX를 구형 엔진이 이해할 수 있는 코드로 변환하는 도구.  
React Native 프로젝트에서는 자동으로 포함된다.

```bash
npm install --save-dev @babel/core @babel/preset-env
```

```js
// 변환 전 (ES6+ / JSX)
const greet = (name) => `Hello, ${name}!`;
const el = <Text style={styles.text}>{greet('World')}</Text>;

// 변환 후 (구형 JS)
var greet = function(name) { return "Hello, " + name + "!"; };
var el = React.createElement(Text, { style: styles.text }, greet('World'));
```

```
소스 코드 (ES6+, JSX, TypeScript)
  │
  ▼
JavaScript Babel
  │
  ├─ JSX         →  React.createElement(...)
  ├─ Arrow fn    →  function() {}
  ├─ Template    →  문자열 연결
  └─ 최신 문법   →  구형 브라우저/엔진 호환 코드
```

---

## 한눈에 비교

| | Python Babel | JavaScript Babel |
|--|--|--|
| **목적** | 국제화 (i18n) | 코드 트랜스파일 |
| **설치** | `pip install babel` | `npm install @babel/core` |
| **주요 역할** | 로케일별 날짜/숫자/번역 | JSX·최신 JS → 구형 JS 변환 |
| **동작 시점** | 런타임 | 빌드 타임 |
| **React Native** | 무관 | 빌드 필수 구성 요소 |
| **관련 여부** | 완전히 별개 프로젝트 | 완전히 별개 프로젝트 |

---

## 정리

```
Python  → Babel = 언어/지역 형식 변환기 (런타임)
JS/RN   → Babel = 코드 문법 변환기    (빌드타임)
```

이름이 같아서 혼동하기 쉽지만, 탄생 배경도 목적도 전혀 다르다.  
Python 프로젝트에서 `babel`을 보면 i18n을, React Native에서 보면 빌드 도구를 떠올리면 된다.

---

→ 관련 글: [[mobile/react-native-hermes-runtime|React Native의 Hermes 런타임이란?]]
