---
title: 개발자 기초 개념 학습 가이드
date: 2026-03-28
updated: 2026-03-28
tags:
  - learning
  - fundamentals
  - index
  - guide
summary: "데이터베이스 엔진, 드라이버, C 언어 컴파일 등 개발자가 알아야 할 핵심 개념을 체계적으로 정리한 학습 가이드"
devto: false
devto_id:
devto_url:
---

# 개발자 기초 개념 학습 가이드

> 💡 **이 가이드의 목표**
> SQL 내장함수는 왜 빠를까? 데이터베이스 엔진이 뭐지? 이런 질문에 답하기 위한 기초 개념들을 단계별로 배워봅시다.

---

## 🎯 학습 경로

### 1단계: 핵심 개념 이해하기

**[[database-engine|📘 데이터베이스 엔진이란?]]**
- 엔진의 역할: 데이터 저장, 검색, 최적화
- 내장함수는 왜 빠를까?
- 엔진이 처리하는 것 vs 애플리케이션이 처리하는 것

### 2단계: 계층 구조 파악하기

**[[program-driver-engine|🔗 프로그램, 드라이버, 엔진의 관계]]**
- 세 가지 계층의 역할
- 데이터가 흘러가는 경로
- MVC 모델에서의 위치

### 3단계: 실행 원리 이해하기

**[[c-language-compilation|⚙️ C 언어 프로그램은 어떻게 실행될까?]]**
- 소스 코드 → 컴파일 → 바이너리 → 실행
- PostgreSQL, CPython이 C로 작성된 이유
- 드라이버와 엔진의 성능 차이

### 4단계: 용어 정리하기

**[[software-architecture-terms|📖 소프트웨어 아키텍처 용어 정리]]**
- 드라이버 vs 라이브러리 vs 미들웨어 vs 어댑터
- 각각의 역할과 차이점
- 비슷하지만 다른 개념들

---

## 📚 관련 포스트들

### 성능 & 함수 최적화
- [[custom-vs-built-in-functions|💪 SQL/Python 사용자 정의 함수 vs 내장함수]]
- [[c-level-optimization|🚀 Python C 레벨 최적화란?]]

### 표준 & 명세
- [[essential-specifications|📘 필수 표준 & 명세서 가이드]]
- [[healthcare-data-exchange-standards|🏥 의료 데이터 교환 표준: HL7, FHIR, DICOM 비교]]

### 기술 가이드
- [[unix-domain-socket|🔌 Unix Domain Socket (유닉스) 이해하기]]
- [[snomed-ct|🏥 국제 의료표준 코드(SNOMED-CT) 도입기]]

---

## 🧠 핵심 요약

| 개념 | 역할 | 예시 |
|------|------|------|
| **데이터베이스 엔진** | 데이터 저장 & 처리 | PostgreSQL, MySQL |
| **드라이버** | 통신 중개자 | JDBC, psycopg2 |
| **애플리케이션** | 비즈니스 로직 | Node.js, Python 앱 |
| **컴파일** | 코드 → 기계어 변환 | C 코드 → .exe, 바이너리 |

---

## 💭 학습 팁

1. **다이어그램 그리기** - 각 개념마다 화살표로 흐름을 정리
2. **코드 연결하기** - JDBC, MySQL2, psycopg2 코드와 매칭
3. **자신의 언어로** - 읽은 후 다른 사람에게 설명해보기
4. **반복 복습** - 이 페이지를 북마크하고 주 1회 방문

---
