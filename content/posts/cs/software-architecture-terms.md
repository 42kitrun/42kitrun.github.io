---
title: 소프트웨어 아키텍처 용어 정리
date: 2026-03-28
updated: 2026-03-28
tags:
  - architecture
  - terminology
  - driver
  - library
  - middleware
  - fundamentals
  - systems
  - layers
  - design-patterns
summary: "드라이버, 라이브러리, 미들웨어, 어댑터 등 비슷하지만 다른 개념들을 명확하게 정리"
devto: false
devto_id:
devto_url:
---

# 소프트웨어 아키텍처 용어 정리

## 한 문장 요약

**모두 '중간에서 뭔가를 연결하거나 처리'하는 역할 - 하지만 용도와 위치가 다르다**

---

## 🎯 핵심 개념 비교

### 빠른 참조표

| 용어 | 역할 | 위치 | 예시 |
|------|------|------|------|
| **드라이버** | 다른 시스템과 통신 | 애플리케이션 ↔ 외부 시스템 | JDBC, psycopg2 |
| **라이브러리** | 재사용 가능한 코드 제공 | 애플리케이션 내부 | numpy, lodash |
| **미들웨어** | 요청/응답 가로채기 & 처리 | 웹 서버와 애플리케이션 사이 | Express 미들웨어 |
| **어댑터** | 서로 다른 인터페이스 연결 | 두 시스템 사이 | 멀티탭 (비유) |
| **매니저** | 특정 자원 관리 | 애플리케이션 내부 | 메모리 매니저 |
| **핸들러** | 특정 이벤트 처리 | 애플리케이션 내부 | 에러 핸들러 |

---

## 🚗 드라이버 (Driver)

### 정의
**외부 시스템(하드웨어/소프트웨어)과 통신하기 위한 소프트웨어**

### 구조

```
애플리케이션
  ↓ (Java 메서드 호출)
드라이버
  ├─ 프로토콜 변환
  ├─ 데이터 형식 변환
  ├─ 네트워크 통신 관리
  └─ 에러 처리
  ↓ (DB 프로토콜)
데이터베이스 엔진
```

### 예시

```javascript
// Node.js + PostgreSQL
const { Client } = require('pg');  // ← 드라이버

const client = new Client({
  host: 'localhost',
  user: 'postgres'
});

// 드라이버가 하는 일:
client.connect();
  // 1. TCP/IP 소켓 생성
  // 2. PostgreSQL 서버에 연결
  // 3. 인증 처리

await client.query('SELECT * FROM users');
  // 1. JavaScript 객체를 PostgreSQL 형식으로 변환
  // 2. 쿼리 전송
  // 3. 응답 수신
  // 4. PostgreSQL 데이터를 JavaScript 객체로 변환
```

### 드라이버의 특징

✅ **통신 프로토콜 이해**
- 상대방 시스템의 통신 규칙을 알고 있음
- JDBC, ODBC, PostgreSQL Wire Protocol 등

✅ **변환 기능**
- 프로그래밍 언어 ↔ 외부 시스템 형식
- Java 객체 ↔ SQL 데이터

✅ **연결 관리**
- 네트워크 연결 수립
- 타임아웃 관리
- 재연결 로직

### 드라이버 종류

```
데이터베이스 드라이버:
├─ JDBC (Java)
├─ psycopg2 (Python)
├─ mysql2 (Node.js)
└─ sqlc (Go)

USB 드라이버:
├─ 마우스 드라이버
├─ 키보드 드라이버
└─ 프린터 드라이버

그래픽 드라이버:
├─ NVIDIA CUDA (GPU)
├─ Intel Graphics
└─ AMD Radeon
```

---

## 📚 라이브러리 (Library)

### 정의
**재사용 가능한 코드 모음 (함수, 클래스, 모듈)**

### 구조

```
내 애플리케이션
  ├─ 내 코드
  ├─ 라이브러리 코드
  │  ├─ numpy (수치 계산)
  │  ├─ lodash (유틸리티)
  │  └─ axios (HTTP 요청)
  └─ 표준 라이브러리 (os, sys, path)
```

### 예시

```python
# Python
import numpy as np
import pandas as pd

# 라이브러리 사용
arr = np.array([1, 2, 3])
sum_result = np.sum(arr)  # 라이브러리 함수 호출
```

### 라이브러리의 특징

✅ **독립적인 기능 제공**
- 특정 작업을 처리하는 함수/클래스
- 내가 필요한 것만 가져다 쓰기

✅ **재사용성**
- 여러 프로젝트에서 같은 라이브러리 사용 가능
- 이미 검증된 코드

✅ **의존성**
- 라이브러리가 없으면 앱 동작 안 함
- `import numpy` → 없으면 에러

### 라이브러리 vs 드라이버

```
라이브러리:
├─ 애플리케이션이 필요한 기능 제공
├─ 애플리케이션 내에서만 동작
└─ 예: numpy (배열 계산)

드라이버:
├─ 외부 시스템과의 통신 담당
├─ 애플리케이션과 외부 시스템 사이에서 동작
└─ 예: psycopg2 (PostgreSQL 통신)
```

---

## 🔌 미들웨어 (Middleware)

### 정의
**요청과 응답을 가로채서 추가 로직을 처리하는 소프트웨어**

### 구조

```
사용자 요청
  ↓
[미들웨어 1] - 로깅 (요청 기록)
  ↓
[미들웨어 2] - 인증 (사용자 확인)
  ↓
[미들웨어 3] - CORS (크로스 오리진 확인)
  ↓
라우터/컨트롤러 (실제 로직)
  ↓
[응답 미들웨어] - 압축, 캐싱
  ↓
사용자 응답
```

### 예시

```javascript
// Express.js (Node.js 웹 프레임워크)
const express = require('express');
const app = express();

// 미들웨어 1: 요청 본문 파싱
app.use(express.json());

// 미들웨어 2: 로깅
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // 다음 미들웨어로 넘김
});

// 미들웨어 3: 인증
app.use((req, res, next) => {
  if (req.headers.authorization) {
    next();  // 인증 성공
  } else {
    res.status(401).send('Unauthorized');  // 인증 실패
  }
});

// 라우트 (실제 로직)
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'John' }]);
});
```

### 미들웨어의 특징

✅ **파이프라인 구조**
- 순서대로 처리됨
- 각 미들웨어가 다음 미들웨어로 제어 넘김 (`next()`)

✅ **요청/응답 수정 가능**
- 요청 데이터 변경
- 응답 헤더 추가

✅ **조건부 실행**
- 특정 조건에서만 동작
- 조건을 만족하지 않으면 다음 단계로 넘어가지 않음

### 미들웨어 종류

```
웹 미들웨어:
├─ 인증 (Authentication)
├─ 로깅 (Logging)
├─ CORS (Cross-Origin Resource Sharing)
├─ 요청 검증 (Validation)
└─ 압축 (Compression)

데이터베이스 미들웨어:
├─ ORM (Object-Relational Mapping)
├─ 쿼리 빌더
└─ 커넥션 풀

메시지 미들웨어:
├─ 메시지 큐 (RabbitMQ, Kafka)
└─ 메시지 브로커 (MQTT)
```

---

## 🔌 어댑터 (Adapter)

### 정의
**서로 다른 인터페이스를 가진 두 시스템을 연결하는 소프트웨어**

### 실생활 비유

```
┌─────────────────────┐
│ 콘센트 (어댑터 없음) │
│ 220V, 2핀          │
└─────────────────────┘

내 노트북 충전기:
100V, 3핀

→ 어댑터 필요!

┌─────────────────────┐
│ 멀티탭 어댑터        │
│ 3핀 → 2핀          │
│ 100V → 220V        │
└─────────────────────┘

→ 호환 가능!
```

### 소프트웨어 예시

```javascript
// 기존 API (구조가 다름)
const oldAPI = {
  getUser(id) {
    return { userId: id, userName: 'John' };
  }
};

// 새로운 API가 원하는 형식
// { id, name }

// 어댑터 패턴
const adapter = {
  getUser(id) {
    const data = oldAPI.getUser(id);
    return {
      id: data.userId,        // 필드명 변환
      name: data.userName     // 필드명 변환
    };
  }
};

// 사용
const user = adapter.getUser(1);  // { id: 1, name: 'John' }
```

### 어댑터의 특징

✅ **형식 변환**
- 데이터 구조 변환
- 필드명 변환
- 데이터 타입 변환

✅ **호환성 제공**
- 구 시스템과 신 시스템 호환
- 외부 라이브러리 통합

✅ **기존 코드 보호**
- 기존 코드 수정 최소화
- 새로운 레이어만 추가

---

## 🎛️ 매니저 (Manager)

### 정의
**특정 자원(메모리, 스레드, 파일 등)을 관리하는 시스템**

### 예시

```
메모리 매니저:
├─ 힙(Heap) 메모리 할당
├─ 가비지 컬렉션 (Java, Python)
└─ 메모리 누수 방지

스레드 매니저:
├─ 스레드 생성/제거
├─ 동시성 제어
└─ 데드락 방지

리소스 매니저:
├─ 파일 열기/닫기
├─ 데이터베이스 연결
└─ 소켓 관리
```

---

## ⚡ 핸들러 (Handler)

### 정의
**특정 이벤트나 상황을 처리하는 함수/메서드**

### 예시

```javascript
// 에러 핸들러
try {
  await db.query('SELECT * FROM users');
} catch (error) {
  errorHandler(error);  // 에러 처리
}

// 이벤트 핸들러
button.addEventListener('click', () => {
  handleButtonClick();  // 클릭 이벤트 처리
});

// 요청 핸들러 (라우트)
app.get('/users', (req, res) => {
  handleGetUsers(req, res);  // GET 요청 처리
});
```

---

## 🗺️ 전체 관계도

```
┌─────────────────────────────────────────┐
│ 애플리케이션                             │
├─────────────────────────────────────────┤
│ [라이브러리] (재사용 코드)               │
│ ├─ numpy, lodash                       │
│ └─ 애플리케이션 내에서만 동작           │
│                                         │
│ [미들웨어] (요청/응답 처리)             │
│ ├─ 로깅, 인증, CORS                    │
│ └─ 웹 서버와 라우터 사이                │
│                                         │
│ [라우터/핸들러] (요청 처리)             │
│ └─ 실제 비즈니스 로직                   │
│                                         │
│ [어댑터] (형식 변환)                    │
│ └─ 레거시 시스템과 호환                 │
│                                         │
│ [매니저] (자원 관리)                    │
│ └─ 메모리, 스레드, 파일                 │
└────────────────┬──────────────────────┘
                 │
          [드라이버] (외부 통신)
          ├─ DB 드라이버
          ├─ USB 드라이버
          └─ 외부 시스템과 통신
                 │
          [외부 시스템]
          ├─ 데이터베이스
          ├─ USB 기기
          └─ API 서버
```

---

## 💡 실제 예시: 웹 애플리케이션

```
사용자 요청: POST /api/users

[미들웨어]
├─ 요청 본문 파싱 (express.json)
├─ 로깅 (로그 기록)
└─ 인증 (토큰 검증)

[라우터 핸들러]
├─ 요청 검증
└─ 비즈니스 로직

[어댑터]
└─ 요청 데이터를 DB 형식으로 변환

[드라이버]
└─ psycopg2 → PostgreSQL 통신

[데이터베이스]
└─ INSERT 실행

[드라이버]
└─ 응답 수신

[어댑터]
└─ DB 데이터를 JSON으로 변환

[라이브러리]
└─ lodash로 데이터 가공

[미들웨어]
└─ 응답 압축

사용자 응답: { id: 1, name: 'John' }
```

---

## 🔗 관련 개념

**다음 단계:**
- [[runtime/program-driver-engine|프로그램, 드라이버, 엔진의 관계]] - 실제 아키텍처 적용
- [[runtime/c-language-compilation|C 언어 프로그램 실행]] - 컴파일러도 일종의 미들웨어

**관련 포스트:**
- [[data/database-engine|데이터베이스 엔진이란?]]

---
