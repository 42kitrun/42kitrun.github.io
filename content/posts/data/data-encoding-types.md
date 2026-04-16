---
title: "[데이터 변환 이해 2편] 인코딩 유형 — 문자 인코딩, Base64, URL 인코딩"
date: 2026-04-03
updated: 2026-04-03
tags:
  - encoding
  - base64
  - utf-8
  - web
  - data-formats
  - data-transformation
  - fundamentals
  - http
  - api
summary: "문자 인코딩, Base64, URL 인코딩의 목적과 동작 원리를 실무 중심으로 정리하고, 언제 어떤 인코딩을 써야 하는지 판단 기준을 제공한다"
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

# [데이터 변환 이해 2편] 인코딩 유형 — 문자 인코딩, Base64, URL 인코딩

_written by Claude-Code_

← [[data/data-transformation-concepts|1편: 인코딩 · 암호화 · 해시 — 세 개념의 차이]]

---

## 인코딩이 필요한 이유

컴퓨터는 모든 데이터를 숫자(바이트)로 저장한다.  
문제는 **같은 숫자를 다르게 해석하는 시스템이 섞일 때** 발생한다.

```
시스템 A                          시스템 B
"가" → [0xB0 0xA1] 전송 →  → [0xB0 0xA1] 수신 → "??" (EUC-KR인 줄 몰랐음)
```

인코딩은 "이 바이트가 무엇을 의미하는가"를 약속하는 규칙이다.

---

## 1. 문자 인코딩

### ASCII

영어권 컴퓨터의 초기 표준. 7비트, 128개 문자만 표현.

```
'A' = 65 = 0x41
'a' = 97 = 0x61
'0' = 48 = 0x30
```

한국어, 일본어, 이모지 → 표현 불가.

### EUC-KR

한국어를 위해 만든 인코딩. 한글 한 글자 = 2바이트.

```
'가' = 0xB0 0xA1
'나' = 0xB3 0xAA
```

Windows 한국어 환경의 레거시 기본값.  
EUC-KR 파일을 UTF-8 환경에서 열면 **깨진 한글**이 나온다.

### UTF-8 (현재 표준)

전 세계 모든 문자를 표현. 1~4바이트 가변 길이.

```
영어  'A'  → 1바이트  [0x41]              ← ASCII와 동일
한글  '가' → 3바이트  [0xEA 0xB0 0x80]
이모지 '😀' → 4바이트 [0xF0 0x9F 0x98 0x80]
```

**현재 거의 모든 웹·API의 표준.**  
새로 만드는 시스템은 UTF-8 외에 이유가 없다.

### UTF-16

한 글자 = 2바이트 또는 4바이트. Windows 내부, Java, JavaScript 문자열.

```
'A'  → [0x00 0x41]    ← 영어도 2바이트 사용
'가' → [0xAC 0x00]
```

영어 텍스트가 많으면 UTF-8보다 용량이 크다.  
파일 저장·네트워크 전송에는 UTF-8이 효율적.

### 실무 판단

```
텍스트 데이터를 다룰 때
  새 프로젝트           → UTF-8 고정
  레거시 파일 읽기 실패 → EUC-KR 시도
  Java/JS 내부 처리    → UTF-16 (런타임이 알아서 처리)
  API 요청/응답        → UTF-8 + Content-Type 헤더 명시
```

---

## 2. Base64

### 왜 필요한가

이메일, HTTP, XML 같은 프로토콜은 **텍스트 기반**으로 설계됐다.  
이미지·파일 같은 바이너리 데이터를 그대로 넣으면 중간 시스템에서 손상된다.

```
바이너리 데이터: [0xFF 0xD8 0xFF 0xE0 ...]  (JPEG 파일)
               ↓ Base64 인코딩
텍스트 데이터:  "/9j/4AAQSkZJRgAB..."      (안전하게 전송 가능)
```

### 동작 원리

3바이트(24비트)를 4개의 6비트 그룹으로 나누고,  
각 그룹을 `A-Z`, `a-z`, `0-9`, `+`, `/` 64개 문자 중 하나로 매핑한다.

```
입력:  "Man"
바이트: 77    97    110
2진수: 01001101 01100001 01101110
       ──────────────────────────
6비트: 010011  010110  000101  101110
         19      22       5      46
         T       W        F      u
출력:  "TWFu"
```

크기는 원본의 약 **33% 증가**.

### 실무 사용처

```
HTML에 이미지 직접 삽입
  <img src="data:image/png;base64,iVBORw0KGgo...">

JWT (JSON Web Token)
  Header.Payload.Signature
  각 부분이 Base64URL 인코딩 (URL-safe: +→-, /→_)

이메일 첨부파일 (MIME)
  Content-Transfer-Encoding: base64

API JSON 응답에 바이너리 포함
  {"image": "/9j/4AAQSkZJRgAB..."}
```

### Base64는 암호화가 아니다

```python
import base64
base64.b64decode("/9j/4AAQSkZJRgAB...")  # 즉시 복원 가능
```

Base64로 인코딩된 데이터는 **누구나 바로 복원**할 수 있다.  
비밀번호나 민감 데이터에 Base64를 쓰는 것은 보안이 아니다.

---

## 3. URL 인코딩 (Percent Encoding)

### 왜 필요한가

URL에서 특수문자는 구조적 의미를 가진다.

```
https://example.com/search?q=hello world&type=all
                                  ↑
                            공백이 URL을 깨뜨림
```

공백, `&`, `=`, `#`, `?` 등은 URL 구조에서 예약된 문자다.  
이 문자들을 URL에 포함하려면 인코딩이 필요하다.

### 동작 원리

```
변환 규칙: % + 바이트의 16진수 두 자리

공백 (0x20)  → %20
'&'  (0x26)  → %26
'='  (0x3D)  → %3D
'가' (UTF-8: 0xEA 0xB0 0x80) → %EA%B0%80
```

```
인코딩 전: "검색어 테스트&page=1"
인코딩 후: "%EA%B2%80%EC%83%89%EC%96%B4%20%ED%85%8C%EC%8A%A4%ED%8A%B8%26page%3D1"
```

### + vs %20

HTML 폼에서 공백은 `+`로 인코딩된다 (application/x-www-form-urlencoded).  
URL 경로에서는 `%20`을 써야 한다.

```
폼 전송:   q=hello+world       (+ = 공백)
URL 경로: /files/hello%20world (%20 = 공백)
```

### 실무 사용처

```python
# Python
from urllib.parse import quote, urlencode

quote("검색어 테스트")
# '%EA%B2%80%EC%83%89%EC%96%B4%20%ED%85%8C%EC%8A%A4%ED%8A%B8'

urlencode({"q": "검색어", "page": 1})
# 'q=%EA%B2%80%EC%83%89%EC%96%B4&page=1'
```

```javascript
// JavaScript
encodeURIComponent("검색어 테스트")
// '%EA%B2%80%EC%83%89%EC%96%B4%20%ED%85%8C%EC%8A%A4%ED%8A%B8'

// encodeURI vs encodeURIComponent
// encodeURI:          URL 전체 인코딩, ://?& 는 남김
// encodeURIComponent: 쿼리 파라미터 값 인코딩, 특수문자 전부 인코딩
```

---

## 인코딩 선택 기준 요약

```
상황                              인코딩
────────────────────────────────────────────────
텍스트 저장/전송                  UTF-8
바이너리 → 텍스트 변환            Base64
URL에 특수문자·한글 포함          URL 인코딩 (percent encoding)
JWT 생성                          Base64URL (Base64 변형)
레거시 한국어 파일 읽기           EUC-KR 시도
```

---

→ [[security/data-encryption-types|3편: 암호화 유형 — 대칭키, 비대칭키, 해시 함수]]
