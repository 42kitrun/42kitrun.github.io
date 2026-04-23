---
title: MediDaily — 의학적으로 검증된 헬스케어 루틴 API 설계 및 구현
date: '2026-04-05'
updated: '2026-04-12'
tags:
  - fastify
  - typescript
  - postgresql
  - prisma
  - qdrant
  - vector-search
  - aws
  - healthcare
  - backend
  - rest-api
  - jwt
  - snomed-ct
related_projects:
  - medidaily
status: published
excerpt: Fastify 5 + Prisma 기반 헬스케어 플랫폼 백엔드 — SNOMED-CT 증상 매핑, 벡터 검색, 자가진단 세션 흐름을 중심으로
---

## 프로젝트 개요

**MediDaily**는 자기 이해와 건강 관리에 관심이 많은 20–30대를 위한 디지털 헬스케어 플랫폼입니다.

검증되지 않은 셀럽 루틴을 무작정 따라하는 대신, 자가진단으로 개인 성향을 분석하고 **의학적으로 검증된 맞춤형 건강 루틴**을 제안합니다. 플랫폼 내 칼럼 콘텐츠를 통해 지속적인 의학 피드백도 제공합니다.

> **팀 구성**
> 수민, 윤성 (PM · 데이터 · 기획) / 명로, 민아 (UI/UX) / 상빈 (Frontend) / 다영 (ML 모델) / 지연 (Backend · DE)

---

## 기술 스택

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Fastify](https://img.shields.io/badge/Fastify_5-000000?style=flat&logo=fastify&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) ![Qdrant](https://img.shields.io/badge/Qdrant-FF4A55?style=flat&logo=qdrant&logoColor=white) ![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat&logo=amazons3&logoColor=white) ![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=flat&logo=awslambda&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat&logo=sentry&logoColor=white)

| 영역         | 기술                              |
| ---------- | ------------------------------- |
| Runtime    | Node.js + TypeScript            |
| Framework  | Fastify 5.x                     |
| ORM        | Prisma (PostgreSQL)             |
| Vector DB  | Qdrant                          |
| Storage    | AWS S3                          |
| Email      | AWS SES (Brevo fallback)        |
| Embedding  | AWS Lambda                      |
| Monitoring | Sentry · PostHog                |
| Auth       | JWT (Access + Refresh) · Bcrypt |

---

## 목차

- [아키텍처 설계](#아키텍처-설계)
- [도메인 모듈 구조](#도메인-모듈-구조)
- [DB 스키마 설계 — SNOMED-CT 기반 증상 매핑](#db-스키마-설계--snomed-ct-기반-증상-매핑)
- [자가진단 세션 API 흐름](#자가진단-세션-api-흐름)
- [칼럼 벡터 검색](#칼럼-벡터-검색)
- [보안 레이어](#보안-레이어)
- [배운 점](#배운-점)

---

## 아키텍처 설계

클라이언트(Android Kotlin)부터 DB까지 단방향 케이스 변환 레이어를 두어 각 계층이 자신의 컨벤션만 다루도록 설계했습니다.

```
Client (Kotlin/Android)
        │ camelCase JSON
        ▼
Handler / Schema (Fastify)       ← JSON Schema 자동 직렬화
        │ camelCase
        ▼
Service Layer  ──── (비동기) ───▶  AWS Lambda (임베딩 생성)
        │ snake_case                          │
        ▼                                     ▼
Repository (Prisma)                       Qdrant
        │                            (벡터 저장 · 유사도 검색)
        ▼
PostgreSQL
(사용자 · 칼럼 · 자가진단)
```

**핵심 원칙**
- Repository는 쿼리 외 로직 없음 — 테스트·교체 용이
- Handler는 검증과 라우팅만 — `handleRequest()` 래퍼로 에러 처리 일원화
- JSON Schema를 Fastify에 직접 등록해 직렬화 오버헤드 최소화

---

> 📸 *(Swagger UI 화면 캡처)*

---

## DB 스키마 설계 — SNOMED-CT 기반 증상 매핑

PostgreSQL 다중 스키마로 도메인을 물리적으로 분리했습니다.

의학 콘텐츠의 핵심은 **SNOMED-CT** 표준 코드 체계입니다. 모든 증상 태그는 국제 표준 코드에 매핑되어 칼럼·자가진단·사용자 건강 기록이 동일한 코드로 연결됩니다.

> 📸 *(ERD 또는 Prisma Studio 캡처)*

---

## 자가진단 세션 API 흐름

자가진단은 **세션 기반** 으로 동작합니다. 중간에 앱을 닫아도 세션이 유지되고 이어서 응답할 수 있습니다.

세션 완료 시 사용자의 답변 패턴을 집계해 SNOMED-CT 코드 기반 증상군을 도출하고, 매핑된 셀럽 루틴과 의학 권장 사항을 함께 반환합니다.

> 📸 *(자가진단 흐름 — 시퀀스 다이어그램 또는 Postman 컬렉션 캡처)*

---

## 칼럼 벡터 검색

의학 칼럼 검색은 키워드 매칭과 **벡터 유사도 검색**을 병행합니다.

1. 칼럼 등록 시 본문 임베딩 → **AWS Lambda**가 비동기로 Qdrant에 저장
2. 검색 쿼리 입력 → 키워드 점수 + Qdrant 코사인 유사도 점수 가중 합산
3. SNOMED-CT 증상 코드 필터 적용 후 결과 반환

> 📸 *(검색 결과 화면 또는 Qdrant Dashboard 캡처)*

---

## 보안 레이어

| 항목         | 구현                                        |
| ---------- | ----------------------------------------- |
| 인증         | JWT Access + Refresh Token 순환             |
| 토큰 저장      | Refresh Token 해시화 후 DB 저장, HttpOnly 쿠키 전달 |
| 비밀번호       | Bcrypt saltRounds 12 (OWASP 권장)           |
| CSRF       | Double-submit cookie 패턴                   |
| Rate Limit | 인증 엔드포인트 5 req/5min                       |
| 로그인 감사     | IP·User-Agent 포함 login_logs 기록            |
| 휴면 계정      | 이메일 해시(PII 보호) + 별도 inactive_users 테이블 분리 |
| 헬멧         | `@fastify/helmet` — CSP·HSTS 기본 적용        |

---

### Fastify 5 — 성능과 구조 사이

Fastify 5의 JSON Schema 직렬화는 Express 대비 응답 처리 속도를 크게 개선했습니다. 반면 플러그인 캡슐화 스코프 개념이 Express와 달라, 공유 데코레이터를 루트 인스턴스에 등록하는 순서를 엄격히 지켜야 했습니다.

### Prisma 다중 스키마

`@@schema` 지시자로 사용자, 칼럼, 자가진단을 물리적으로 분리하면 쿼리 격리와 권한 제어가 깔끔해집니다. 다만 Cross-schema 조인은 Prisma가 직접 지원하지 않아 raw 쿼리가 필요한 케이스를 사전에 파악해 Repository에 명시적으로 관리했습니다.

### SNOMED-CT 표준 도입

의학 플랫폼에서 자체 태그 시스템 대신 SNOMED-CT 코드를 도입함으로써 증상 데이터의 확장성과 신뢰성을 확보했습니다. 코드 패턴(`/^\d{6,18}$/`)을 API 레벨에서 검증해 오염 데이터 유입을 원천 차단했습니다.
