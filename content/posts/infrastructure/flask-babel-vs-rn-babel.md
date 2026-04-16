---
title: 이름이 같은 두 Babel — Flask-Babel vs React Native Babel
date: 2026-04-08
updated: 2026-04-12
tags:
  - python
  - flask
  - javascript
  - react-native
  - babel
  - flask-babel
  - i18n
  - transpiler
  - build-tools
  - localization
  - frontend
  - backend
  - jinja2
  - metro
  - nowinseoul
summary: 같은 이름이지만 목적이 전혀 다른 Flask-Babel(서버 사이드 i18n)과 React Native Babel(빌드 타임 트랜스파일러)을 비교한다.
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

# 이름이 같은 두 Babel — Flask-Babel vs React Native Babel

_written by Claude-Code_

Flask 프로젝트에서 `Flask-Babel`, React Native 프로젝트에서 `@babel/core` — 이름에 Babel이 붙지만 공통점은 이름뿐이다.

---

## Flask-Babel — 서버 사이드 국제화(i18n) 확장

```
서버 사이드(Server-side) - 서버에서 처리한다는 뜻
🌟 클라이언트 사이드 i18n(react-i18next 같은 것)은 반대로 브라우저에서 번역한다.

국제화(i18n, Internationalization) — 앱이 여러 나라 언어/형식을 지원할 수 있게 만드는 작업
(Internationalization → 첫 글자 I + 중간 18글자 + 마지막 글자 n → i18n)

-> 서버가 HTTP 요청을 받았을 때, 사용자의 언어 설정을 보고 서버에서 알맞은 언어·날짜·숫자 형식으로 바꿔서 응답하는 것

  구체적으로:
브라우저 요청
 Accept-Language: ko-KR   ──▶  Flask 서버  ──▶  "안녕하세요"
 Accept-Language: en-US   ──▶  Flask 서버  ──▶  "Hello"
 Accept-Language: ja-JP   ──▶  Flask 서버  ──▶  "こんにちは"
```

Python [Babel](https://babel.pocoo.org) 라이브러리를 Flask의 **요청 컨텍스트**와 통합한 확장.  
날짜·숫자·통화 형식 변환과 `.po`/`.mo` 기반 다국어 번역을 제공한다.

```bash
pip install flask-babel
```

```python
from flask import Flask, request
from flask_babel import Babel, gettext as _

app = Flask(__name__)
babel = Babel(app)

@babel.localeselector
def get_locale():
    return request.accept_languages.best_match(['ko', 'en', 'ja'])

@app.route('/')
def index():
    return _('Hello, World!')  # 로케일에 맞는 번역 반환
```

```
HTTP 요청 (Accept-Language: ko)
  │
  ▼
Flask-Babel (로케일 감지)
  │
  ├─ 날짜/시간  →  "2026년 4월 12일"  /  "April 12, 2026"
  ├─ 숫자/통화  →  "₩1,234"  /  "$1,234"
  └─ 메시지     →  messages/ko/LC_MESSAGES/messages.mo
                   → "안녕하세요, 세상!"
```

**핵심 특징:**
- 동작 시점: **런타임** (요청마다 로케일 결정)
- 로케일 감지 출처: URL 파라미터, `Accept-Language` 헤더, 세션, 사용자 설정 등 자유롭게 커스터마이징
- Jinja2 템플릿에서 `{{ _('text') }}` 로 바로 사용
- 번역 파일 관리: `flask babel extract` → `flask babel init` → `.po` 편집 → `flask babel compile` → `.mo` 생성

---

## React Native Babel — 빌드 타임 트랜스파일러

JSX, ES6+, TypeScript를 **Hermes/V8/JSC**가 이해할 수 있는 레거시 JS로 변환하는 도구.  
Metro 번들러가 빌드 과정에서 자동으로 실행한다.

```bash
# RN 프로젝트 생성 시 자동 포함
npm install --save-dev @babel/core babel-preset-react-native
```

```js
// 변환 전 (개발자가 작성하는 코드)
const greet = (name) => `Hello, ${name}!`;
const el = <Text style={styles.text}>{greet('World')}</Text>;

// 변환 후 (Hermes/엔진이 실행하는 코드)
var greet = function(name) { return "Hello, " + name + "!"; };
var el = React.createElement(Text, { style: styles.text }, greet('World'));
```

```
소스 코드 (JSX / ES6+ / TypeScript)
  │
  ▼
Metro 번들러 → Babel 트랜스파일
  │
  ├─ JSX          →  React.createElement(...)
  ├─ Arrow fn     →  function() {}
  ├─ Template     →  문자열 연결
  ├─ Optional ?. →  조건 분기 코드
  └─ TypeScript   →  타입 제거 후 JS
  │
  ▼
번들 JS (Hermes 엔진에서 실행)
```

**핵심 특징:**
- 동작 시점: **빌드 타임** (앱 실행 중엔 Babel 없음)
- 런타임 오버헤드: **0** — 변환 결과물만 남음
- 설정 파일: 프로젝트 루트의 `babel.config.js`
- RN 전용 프리셋: `babel-preset-react-native` (또는 `metro-react-native-babel-preset`)

---

## 핵심 비교

| | Flask-Babel | RN Babel |
|--|:-----------:|:--------:|
| **역할** | 다국어 i18n / l10n | JSX·최신 JS 트랜스파일 |
| **동작 시점** | 런타임 | 빌드 타임 |
| **실행 위치** | 서버 | 개발 머신 (Metro) |
| **요청 의존** | 요청마다 로케일 결정 | 요청과 무관 |
| **런타임 오버헤드** | 있음 (번역 조회) | 없음 |
| **설정 방법** | `babel.localeselector` 함수 | `babel.config.js` |
| **번역 파일** | `.po` / `.mo` | 없음 |
| **기반 라이브러리** | Python Babel | `@babel/core` |
| **공통점** | 이름만 같음 | 이름만 같음 |

---

## 구조 요약

```
[Flask-Babel]
브라우저 요청 → Flask 앱 → 로케일 감지 → 번역/포맷 적용 → 응답
                                  ↑
                           Accept-Language 헤더 / 세션

[RN Babel]
개발자 코드 → Metro + Babel → 번들 JS → Hermes 엔진 → 화면 렌더링
              (빌드 타임 1회)
```

---

## 정리

> **Flask-Babel** → 서버가 요청을 받을 때마다 언어를 바꿔 응답하는 런타임 i18n 도구  
> **RN Babel** → 개발자가 편하게 쓴 최신 문법을 엔진이 읽을 수 있게 바꿔주는 빌드 도구

같은 이름 때문에 헷갈리지만 목적, 동작 시점, 실행 환경이 모두 다르다.

---

→ 관련 글: [[mobile/react-native-hermes-runtime|React Native의 Hermes 런타임이란?]]
