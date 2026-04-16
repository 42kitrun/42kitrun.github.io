---
title: 프로그램, 드라이버, 엔진의 관계
date: 2026-03-28
updated: 2026-03-28
tags:
  - architecture
  - driver
  - engine
  - fundamentals
  - layers
  - systems
  - database
  - c-language
summary: "애플리케이션, 드라이버, 데이터베이스 엔진의 세 계층 구조와 데이터 흐름 완전 이해"
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

# 프로그램, 드라이버, 엔진의 관계

_written by Claude-Code_

## 한 문장 요약

**프로그램 → 드라이버 → 엔진** : 계층적 역할 분담

---

## 🏗️ 세 계층 구조

### 전체 그림

```
┌──────────────────────────────────────┐
│ Java 애플리케이션                     │
│ db.query("SELECT * FROM users")      │
│ (비즈니스 로직, 사용자 요청 처리)      │
└─────────────────┬────────────────────┘
                  │
                  ↓ (SQL 쿼리)

┌──────────────────────────────────────┐
│ JDBC 드라이버                         │
│ - Java의 SQL 쿼리를 PostgreSQL이    │
│   이해할 수 있는 형태로 변환         │
│ - 네트워크 통신 담당                 │
│ - 연결 관리                          │
└─────────────────┬────────────────────┘
                  │
                  ↓ (Protocol: TCP/IP)

┌──────────────────────────────────────┐
│ PostgreSQL 엔진                       │
│ - 쿼리 해석                          │
│ - 데이터 처리                        │
│ - RAM 관리                           │
│ - 결과 반환                          │
└──────────────────────────────────────┘
```

---

## 🎭 각 계층의 역할

### 1️⃣ 프로그램 (Application)

```javascript
// Node.js + PostgreSQL
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  user: 'postgres'
});

// 프로그램의 역할
client.query('SELECT * FROM users WHERE age > 18')
  .then(result => {
    // 결과를 받아서 비즈니스 로직 처리
    const adults = result.rows;
    console.log(`성인 사용자: ${adults.length}명`);
  });
```

**역할:**
- ✅ 사용자 요청 받기
- ✅ SQL 쿼리 작성
- ✅ 결과 데이터 처리
- ✅ 응답 반환

**특징:**
- 고수준의 로직 (비즈니스 로직)
- 데이터베이스 세부 사항 모름
- 드라이버에게 "쿼리 실행해줘" 요청만

---

### 2️⃣ 드라이버 (Driver)

```
역할: 통신 중개자 (번역가)

Java 언어의 메서드 호출
  ↓ (JDBC 드라이버)
  ├─ 쿼리 형식 검증
  ├─ 쿼리를 바이트 스트림으로 변환
  ├─ 네트워크 소켓 생성
  ├─ PostgreSQL 서버에 전송 (TCP/IP)
  ├─ 응답 수신
  ├─ 바이트 스트림을 Java 객체로 변환
  └─ 프로그램에 반환
```

**역할:**
- ✅ 프로토콜 변환 (Java → PostgreSQL 형식)
- ✅ 네트워크 통신
- ✅ 연결 관리
- ✅ 결과 변환 (PostgreSQL → Java)

**드라이버 종류:**

| 언어 | 드라이버 | 대상 DB |
|------|---------|--------|
| Java | JDBC | 모든 SQL DB |
| Python | psycopg2 | PostgreSQL |
| Python | mysql-connector | MySQL |
| Node.js | pg | PostgreSQL |
| Node.js | mysql2 | MySQL |
| Go | pq | PostgreSQL |

---

### 3️⃣ 엔진 (Database Engine)

```
역할: 실제 데이터 처리기

PostgreSQL 엔진이 받은 쿼리:
  SELECT * FROM users WHERE age > 18
  ↓
  1. 파서 (Parser)
     - 문법 검사
     - 쿼리 구조 파악
  ↓
  2. 옵티마이저 (Optimizer)
     - "age" 컬럼에 인덱스 있나?
     - 가장 빠른 실행 경로 선택
  ↓
  3. 실행기 (Executor)
     - 디스크에서 데이터 읽기
     - RAM에 로드
     - age > 18 조건으로 필터링
  ↓
  4. 결과 반환
     - 드라이버에게 결과 전송
```

**역할:**
- ✅ 쿼리 해석 & 검증
- ✅ 최적 실행 계획 수립
- ✅ 데이터 검색 & 처리
- ✅ 트랜잭션 관리
- ✅ 인덱스 활용

**특징:**
- 저수준의 처리 (기계어, C 코드)
- 매우 빠름 (최적화됨)
- 데이터 저장소 관리

---

## 📊 실제 데이터 흐름

### 예시: Java 애플리케이션에서 PostgreSQL 조회

```
┌─ Step 1: 프로그램에서 쿼리 작성
│
│  const result = await client.query(
│    'SELECT * FROM users WHERE id = 1'
│  );
│
├─ Step 2: 드라이버가 변환 & 전송
│
│  JDBC 드라이버:
│  - 쿼리 문자열을 PostgreSQL 프로토콜로 변환
│  - TCP/IP로 PostgreSQL 서버에 전송
│
├─ Step 3: 엔진이 처리
│
│  PostgreSQL 엔진:
│  1. 쿼리 파싱
│  2. 실행 계획 수립
│  3. 디스크에서 users 테이블 읽기
│  4. RAM에서 id=1 행 찾기
│  5. 드라이버에게 결과 전송
│
├─ Step 4: 드라이버가 변환 & 반환
│
│  JDBC 드라이버:
│  - PostgreSQL 응답을 Java 객체로 변환
│  - ResultSet 객체 생성
│  - 프로그램에 반환
│
└─ Step 5: 프로그램에서 사용

   const user = result.rows[0];
   console.log(user.name);
```

---

## 🔄 계층 간 통신 프로토콜

### 드라이버 ↔ 엔진

```
드라이버 → 엔진 (요청)
├─ PostgreSQL Wire Protocol
├─ MySQL Protocol
└─ MongoDB Wire Protocol

엔진 → 드라이버 (응답)
├─ 데이터 (행, 컬럼)
├─ 메타데이터 (컬럼명, 타입)
└─ 상태 (성공/실패)
```

**프로토콜이란?**
= 통신 규칙 (마치 전화 통화 규칙처럼)

```
프로그램 ─ (Java 메서드) ─ 드라이버 ─ (PostgreSQL 프로토콜) ─ 엔진
```

---

## 🎓 MVC 모델과의 관계

### 웹 애플리케이션 전체 구조

```
┌─────────────────────────────────────┐
│ 웹 애플리케이션                      │
├─────────────────────────────────────┤
│ View (V)      | HTML/CSS/JavaScript │
│               | 사용자 화면          │
├─────────────────────────────────────┤
│ Controller (C)| Express Router      │
│               | 요청 처리 로직       │
├─────────────────────────────────────┤
│ Model (M)     | 비즈니스 로직       │
│  ┌──────────────────────────────┐  │
│  │ 프로그램 (Node.js)           │  │
│  ├──────────────────────────────┤  │
│  │ 드라이버 (mysql2, pg)        │  │
│  ├──────────────────────────────┤  │
│  │ 엔진 (MySQL, PostgreSQL)     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

| MVC 계층 | 실제 구성요소 |
|---------|------------|
| **V** | HTML 템플릿 |
| **C** | 라우터, 컨트롤러 |
| **M** | 프로그램 + 드라이버 + 엔진 |

---

## 💡 왜 이렇게 계층을 나누나?

### 장점

✅ **책임 분리 (Separation of Concerns)**
- 각 계층이 자기 역할만 수행
- 수정이 쉬움

✅ **재사용성 (Reusability)**
- 드라이버는 여러 애플리케이션에서 사용 가능
- 엔진은 여러 드라이버에 호환

✅ **유지보수성 (Maintainability)**
- PostgreSQL 업데이트 → 엔진만 수정
- Java 메서드 수정 → 프로그램만 수정

✅ **확장성 (Scalability)**
- 각 계층을 독립적으로 최적화 가능

---

## 🔗 관련 개념

**다음 단계:**
- [[runtime/c-language-compilation|C 언어는 어떻게 실행될까?]] - 드라이버와 엔진의 성능 차이
- [[cs/software-architecture-terms|소프트웨어 아키텍처 용어]] - 드라이버의 다른 이름들

**관련 포스트:**
- [[data/database-engine|데이터베이스 엔진이란?]]
- [[cs/custom-vs-built-in-functions|사용자 정의 함수 vs 내장함수]]

---
