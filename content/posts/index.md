---
title: Posts
---

# 📚 Posts Index

프로그래밍의 기초부터 고급 최적화까지, **자주 마주하는 핵심 개념들**을 다룬 포스트 모음입니다.

**아키텍처 & 시스템**, **성능 & 최적화**, **의료 데이터 표준**, **보안 & 규정** 등 다양한 주제별로 정리되어 있습니다. 각 포스트는 서로 연결되어 있어 관심 분야의 다른 글들도 함께 학습할 수 있습니다.

---

## 🏗️ 아키텍처 & 시스템

### 계층 구조 (Layered Architecture)

**[[program-driver-engine|프로그램, 드라이버, 엔진의 관계]]**
- 세 계층의 역할과 데이터 흐름
- ↔ [[database-engine|데이터베이스 엔진이란?]]
- ↔ [[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]]
- ↔ [[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]

**[[database-engine|데이터베이스 엔진이란?]]**
- 엔진의 역할과 함수 처리 방식
- ↔ [[custom-vs-built-in-functions|사용자 정의 함수 vs 내장함수]]
- ↔ [[c-level-optimization|C 레벨 최적화란?]]

### 실행 원리

**[[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]]**
- 컴파일 과정과 기계어 실행
- ↔ [[c-level-optimization|C 레벨 최적화란?]]
- ↔ [[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]

### 용어 & 개념

**[[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]**
- 드라이버, 라이브러리, 미들웨어, 어댑터
- ↔ [[program-driver-engine|프로그램, 드라이버, 엔진의 관계]]
- ↔ [[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]]

---

## ⚡ 성능 & 최적화

**[[custom-vs-built-in-functions|SQL/Python 사용자 정의 함수 vs 내장함수]]**
- SQL/Python 함수 성능 비교
- ↔ [[database-engine|데이터베이스 엔진이란?]]
- ↔ [[c-level-optimization|Python C 레벨 최적화란?]]

**[[c-level-optimization|Python C 레벨 최적화란?]]**
- Python 내장함수가 빠른 이유
- ↔ [[custom-vs-built-in-functions|SQL/Python 사용자 정의 함수 vs 내장함수]]
- ↔ [[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]]

---

## 📖 표준 & 명세

**[[essential-specifications|필수 표준 & 명세서 가이드]]**
- 웹, 데이터베이스, 보안, 아키텍처 표준
- 개별 주제의 기초가 되는 레퍼런스

**[[healthcare-data-exchange-standards|의료 데이터 교환 표준: HL7, FHIR, DICOM 비교]]**
- 병원/의료기관 데이터 교환 표준
- HL7 v2 vs FHIR, DICOM 영상 표준
- 한국 의료 현황과 최근 트렌드

---

## 🔧 기술 가이드

**[[unix-domain-socket|Unix Domain Socket (유닉스) 이해하기]]**
- IPC 통신 방식과 TCP/IP 비교

**[[snomed-ct|국제 의료표준 코드(SNOMED-CT) 도입기]]**
- 의료 데이터의 표준 코드 체계와 실무 도입 전략

---

## 🌍 기타

**[[privacy-policy-healthcare|헬스케어 앱 개인정보처리방침 작성법]]**

---

## 🔗 관계도 (포스트 네트워크)

```
fundamentals-index (학습 가이드)
    ├─ database-engine
    ├─ program-driver-engine
    ├─ c-language-compilation
    └─ software-architecture-terms

custom-vs-built-in-functions ←→ database-engine
    ↓
c-level-optimization ←→ c-language-compilation

essential-specifications (기초 레퍼런스)
    ↔ healthcare-data-exchange-standards (의료 표준)
    ↔ snomed-ct (의료 코드)

unix-domain-socket (IPC)
개인정보처리방침 (프라이버시)
```

---

## 📌 All Posts (시간순)

| 제목 | 날짜 | 태그 |
|------|------|------|
| [[database-engine\|데이터베이스 엔진이란?]] | 2026-03-28 | #database #engine #architecture |
| [[program-driver-engine\|프로그램, 드라이버, 엔진의 관계]] | 2026-03-28 | #architecture #layers #driver |
| [[c-language-compilation\|C 언어 프로그램은 어떻게 실행될까?]] | 2026-03-28 | #c #compilation #machine-code |
| [[software-architecture-terms\|소프트웨어 아키텍처 용어 정리]] | 2026-03-28 | #architecture #terminology #design |
| [[c-level-optimization\|Python C 레벨 최적화란?]] | 2026-03-27 | #performance #optimization #python |
| [[custom-vs-built-in-functions\|SQL/Python 사용자 정의 함수 vs 내장함수]] | 2026-03-27 | #functions #sql #python #performance |
| [[essential-specifications\|필수 표준 & 명세서 가이드]] | 2026-03-27 | #standards #reference #specification |
| [[healthcare-data-exchange-standards\|의료 데이터 교환 표준: HL7, FHIR, DICOM 비교]] | 2026-03-28 | #healthcare #hl7 #fhir #dicom #standards #interoperability |
| [[unix-domain-socket\|Unix Domain Socket (유닉스) 이해하기]] | 2026-03-24 | #ipc #networking #unix |
| [[snomed-ct\|국제 의료표준 코드(SNOMED-CT) 도입기]] | 2026-03-26 | #healthcare #snomed-ct #medical-code #data-standards |
| [[privacy-policy-healthcare\|헬스케어 앱 개인정보처리방침 작성법]] | 2026-03-25 | #privacy #healthcare #data-protection #compliance |
