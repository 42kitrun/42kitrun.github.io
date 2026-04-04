---
title: Posts
---

# 📚 Posts Index

프로그래밍의 기초부터 고급 최적화까지, **자주 마주하는 핵심 개념들**을 다룬 포스트 모음입니다.

각 포스트는 서로 연결되어 있어 관심 분야의 다른 글들도 함께 학습할 수 있습니다.

---

## 🏗️ 아키텍처 & 시스템

### 계층 구조 (Layered Architecture)

**[[program-driver-engine|프로그램, 드라이버, 엔진의 관계]]**
- 세 계층의 역할과 데이터 흐름
- ↔ [[database-engine|데이터베이스 엔진이란?]]
- ↔ [[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]]
- ↔ [[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]
- ↔ [[data-processing-units|데이터를 묶어서 처리하는 단위들]]

**[[database-engine|데이터베이스 엔진이란?]]**
- 엔진의 역할과 함수 처리 방식
- ↔ [[custom-vs-built-in-functions|사용자 정의 함수 vs 내장함수]]
- ↔ [[c-level-optimization|C 레벨 최적화란?]]
- ↔ [[data-processing-units|데이터를 묶어서 처리하는 단위들]]

**[[data-processing-units|데이터를 묶어서 처리하는 단위들]]**
- 스토리지, 네트워크, CPU/메모리, DB, 파일시스템, 메시지큐 처리 단위
- ↔ [[database-engine|데이터베이스 엔진이란?]]
- ↔ [[program-driver-engine|프로그램, 드라이버, 엔진의 관계]]
- ↔ [[unix-domain-socket|Unix Domain Socket]]

### 실행 원리

**[[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]]**
- 컴파일 과정과 기계어 실행
- ↔ [[c-level-optimization|C 레벨 최적화란?]]
- ↔ [[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]
- ↔ [[react-native-build-ecosystem|React Native 빌드 생태계]]

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

## 🌐 네트워킹 & 인프라

**[[web-infrastructure-loadbalancer-gateway-cdn-webserver|웹 인프라 - CDN, 로드밸런서, Gateway API, 웹서버]]**
- CDN, 로드밸런서, Gateway API, 웹서버의 계층적 역할
- 헤더 기반 트래픽 분기 원리
- ↔ [[https-ssl-certificate|HTTPS와 SSL 인증서 적용 흐름]]
- ↔ [[dos-ddos-attacks|DoS와 DDoS 공격]]

**[[websocket-protocol|WebSocket 프로토콜과 HTTP 비교]]**
- WebSocket 개념과 OSI 동작 방식
- ↔ [[unix-domain-socket|Unix Domain Socket 이해하기]]
- ↔ [[localhost-vs-127-0-0-1|localhost vs 127.0.0.1]]
- ↔ [[web-infrastructure-loadbalancer-gateway-cdn-webserver|웹 인프라]]

**[[https-ssl-certificate|HTTPS와 SSL 인증서 적용 흐름]]**
- HTTP → HTTPS 전환, TLS, DNS, SSL 인증서 갱신 흐름
- ↔ [[web-infrastructure-loadbalancer-gateway-cdn-webserver|웹 인프라]]
- ↔ [[data-encryption-types|암호화 유형 — 대칭키, 비대칭키, 해시]]

**[[unix-domain-socket|Unix Domain Socket (유닉스) 이해하기]]**
- IPC 통신 방식과 TCP/IP 비교
- ↔ [[websocket-protocol|WebSocket 프로토콜과 HTTP 비교]]
- ↔ [[data-processing-units|데이터를 묶어서 처리하는 단위들]]

**[[localhost-vs-127-0-0-1|localhost와 127.0.0.1은 같은가?]]**
- 루프백과 OSI 7계층으로 이해하는 개념 차이
- ↔ [[websocket-protocol|WebSocket 프로토콜과 HTTP 비교]]
- ↔ [[unix-domain-socket|Unix Domain Socket]]

**[[dos-ddos-attacks|DoS와 DDoS — 서비스 거부 공격의 원리와 대응]]**
- 보안 공격 전체 지형과 DDoS 유형·대응법
- ↔ [[software-testing-types-load-stress-ddos|소프트웨어 테스트 종류]]
- ↔ [[web-infrastructure-loadbalancer-gateway-cdn-webserver|웹 인프라]]

---

## 🔐 데이터 변환 시리즈 (인코딩 · 암호화 · 해시)

**[[data-transformation-concepts|1편: 인코딩 · 암호화 · 해시 — 세 개념의 차이]]**
- 세 개념의 핵심 차이와 실무 선택 기준
- → [[data-encoding-types|2편: 인코딩 유형]]
- → [[data-encryption-types|3편: 암호화 유형]]

**[[data-encoding-types|2편: 인코딩 유형 — 문자 인코딩, Base64, URL 인코딩]]**
- UTF-8, Base64, URL 인코딩의 목적과 동작 원리
- ← [[data-transformation-concepts|1편: 개념 차이]]
- → [[data-encryption-types|3편: 암호화 유형]]
- ↔ [[https-ssl-certificate|HTTPS와 SSL 인증서]]

**[[data-encryption-types|3편: 암호화 유형 — 대칭키, 비대칭키, 해시 함수]]**
- AES, RSA, 해시 함수의 동작 원리와 실무 사용처
- ← [[data-encoding-types|2편: 인코딩 유형]]
- ↔ [[https-ssl-certificate|HTTPS와 TLS]]

---

## 📊 신뢰할 수 있는 데이터 시리즈 (거버넌스 · 품질 · 카탈로그)

**[[data-governance-overview|1편: 데이터 거버넌스 — 전체 지형과 왜 필요한가]]**
- 데이터 관리 전체 지도와 거버넌스의 역할
- → [[data-quality-measurement|2편: 데이터 품질]]
- → [[data-catalog-lineage|3편: 데이터 카탈로그와 계보]]

**[[data-quality-measurement|2편: 데이터 품질 — 측정 방법과 품질 정의서]]**
- 6가지 품질 차원 측정과 품질 정의서 작성법
- ← [[data-governance-overview|1편: 거버넌스]]
- → [[data-catalog-lineage|3편: 카탈로그와 계보]]

**[[data-catalog-lineage|3편: 데이터 카탈로그와 계보 — 실무 도구]]**
- 데이터 카탈로그·Lineage 개념과 실무 도구 비교
- ← [[data-quality-measurement|2편: 데이터 품질]]
- ↔ [[database-engine|데이터베이스 엔진이란?]]

---

## 📱 모바일 & 빌드

**[[react-native-build-ecosystem|React Native 빌드 생태계 핵심 용어 정리]]**
- JS 툴체인, Gradle, 네이티브 코드, RN 아키텍처 전체 용어 지도
- ↔ [[c-language-compilation|C 언어 컴파일 과정]]
- ↔ [[sourcemap-files-explained|소스맵(Sourcemap)이란?]]

---

## 🔧 개발 & 운영

**[[dev-vs-production-environment|개발 환경 vs 프로덕션 환경, 무엇이 다른가?]]**
- dev/prod의 목적, 빌드 차이, 에러 처리, 환경 변수 관리
- ↔ [[software-testing-types-load-stress-ddos|소프트웨어 테스트 종류]]
- ↔ [[sourcemap-files-explained|소스맵(Sourcemap)이란?]]

**[[sourcemap-files-explained|소스맵(Sourcemap)이란?]]**
- 소스맵의 역할, 구조, 프로덕션 노출 시 보안 위험
- ↔ [[dev-vs-production-environment|개발 환경 vs 프로덕션 환경]]
- ↔ [[react-native-build-ecosystem|React Native 빌드 생태계]]

**[[software-testing-types-load-stress-ddos|소프트웨어 테스트 종류 - 부하, 스트레스, 침투, DDoS 시뮬레이션]]**
- 성능/안정성 테스트와 보안 테스트 계열 전체 지도
- ↔ [[dev-vs-production-environment|개발 환경 vs 프로덕션 환경]]
- ↔ [[dos-ddos-attacks|DoS와 DDoS 공격]]

---

## 📖 표준 & 명세

**[[essential-specifications|필수 표준 & 명세서 가이드]]**
- 웹, 데이터베이스, 보안, 아키텍처 표준
- ↔ [[healthcare-data-exchange-standards|의료 데이터 교환 표준]]

**[[healthcare-data-exchange-standards|의료 데이터 교환 표준: HL7, FHIR, DICOM 비교]]**
- 병원/의료기관 데이터 교환 표준
- HL7 v2 vs FHIR, DICOM 영상 표준
- ↔ [[snomed-ct|국제 의료표준 코드(SNOMED-CT)]]
- ↔ [[data-governance-overview|데이터 거버넌스]]

**[[snomed-ct|국제 의료표준 코드(SNOMED-CT) 도입기]]**
- 의료 데이터의 표준 코드 체계와 실무 도입 전략
- ↔ [[healthcare-data-exchange-standards|의료 데이터 교환 표준]]
- ↔ [[data-quality-measurement|데이터 품질 측정]]

---

## 🌍 기타

**[[privacy-policy-healthcare|헬스케어 앱 개인정보처리방침 작성법]]**
- 구글 플레이 심사 거절 경험으로 배운 실무 작성법
- ↔ [[healthcare-data-exchange-standards|의료 데이터 교환 표준]]
- ↔ [[data-governance-overview|데이터 거버넌스]]

---

## 🔗 개념 연결 지도

```
[ 실행 원리 ]
c-language-compilation ──→ machine-code / native-code
    ↕                              ↕
c-level-optimization         react-native-build-ecosystem
    ↕
custom-vs-built-in-functions ←→ database-engine
                                      ↕
                              data-processing-units
                                      ↕
                              program-driver-engine ←→ software-architecture-terms

[ 네트워킹 레이어 ]
web-infrastructure ←→ https-ssl-certificate ←→ data-encryption-types
    ↕                        ↕
websocket-protocol      data-encoding-types
    ↕                        ↕
unix-domain-socket    data-transformation-concepts
    ↕
localhost-vs-127-0-0-1

[ 보안 ]
https-ssl-certificate
dos-ddos-attacks ←→ software-testing-types-load-stress-ddos
sourcemap-files-explained ←→ dev-vs-production-environment

[ 데이터 시리즈 ]
data-transformation-concepts → data-encoding-types → data-encryption-types

data-governance-overview → data-quality-measurement → data-catalog-lineage
    ↕                              ↕
privacy-policy-healthcare    snomed-ct ←→ healthcare-data-exchange-standards

[ 모바일 ]
react-native-build-ecosystem ←→ c-language-compilation
                              ←→ sourcemap-files-explained
```

---

## 📌 All Posts (시간순)

| 제목 | 날짜 | 태그 |
|------|------|------|
| [[react-native-build-ecosystem\|React Native 빌드 생태계 핵심 용어 정리]] | 2026-04-04 | #react-native #android #build-system #native-code #mobile |
| [[data-processing-units\|데이터를 묶어서 처리하는 단위들]] | 2026-04-04 | #storage #networking #operating-system #database #systems |
| [[data-catalog-lineage\|데이터 카탈로그와 계보 — 실무 도구]] | 2026-04-03 | #data-catalog #data-lineage #data-engineering #data-governance |
| [[data-quality-measurement\|데이터 품질 — 측정 방법과 품질 정의서]] | 2026-04-03 | #data-quality #data-engineering #data-governance |
| [[data-governance-overview\|데이터 거버넌스 — 전체 지형과 왜 필요한가]] | 2026-04-03 | #data-governance #data-engineering #data-management |
| [[data-encryption-types\|암호화 유형 — 대칭키, 비대칭키, 해시 함수]] | 2026-04-03 | #encryption #hashing #security #aes #rsa #cryptography |
| [[data-encoding-types\|인코딩 유형 — 문자 인코딩, Base64, URL 인코딩]] | 2026-04-03 | #encoding #base64 #utf-8 #data-transformation |
| [[data-transformation-concepts\|인코딩 · 암호화 · 해시 — 세 개념의 차이]] | 2026-04-03 | #encoding #encryption #hashing #fundamentals |
| [[dos-ddos-attacks\|DoS와 DDoS — 서비스 거부 공격의 원리와 대응]] | 2026-04-03 | #security #networking #ddos #attacks |
| [[sourcemap-files-explained\|소스맵(Sourcemap)이란?]] | 2026-04-02 | #javascript #build-tools #security #devops #compilation |
| [[localhost-vs-127-0-0-1\|localhost와 127.0.0.1은 같은가?]] | 2026-04-02 | #networking #osi #loopback #ip-address #fundamentals |
| [[dev-vs-production-environment\|개발 환경 vs 프로덕션 환경, 무엇이 다른가?]] | 2026-04-01 | #deployment #devops #environment #build-process |
| [[software-testing-types-load-stress-ddos\|소프트웨어 테스트 종류 - 부하, 스트레스, 침투, DDoS]] | 2026-04-01 | #testing #security #performance #ddos |
| [[https-ssl-certificate\|HTTPS와 SSL 인증서 적용 흐름]] | 2026-04-01 | #https #ssl #networking #security #tls #encryption |
| [[websocket-protocol\|WebSocket 프로토콜과 HTTP 비교]] | 2026-04-01 | #websocket #networking #protocol #real-time |
| [[web-infrastructure-loadbalancer-gateway-cdn-webserver\|웹 인프라 - CDN, 로드밸런서, Gateway API, 웹서버]] | 2026-03-31 | #networking #infrastructure #load-balancer #cdn |
| [[database-engine\|데이터베이스 엔진이란?]] | 2026-03-28 | #database #engine #architecture #sql #performance |
| [[program-driver-engine\|프로그램, 드라이버, 엔진의 관계]] | 2026-03-28 | #architecture #layers #driver #systems |
| [[c-language-compilation\|C 언어 프로그램은 어떻게 실행될까?]] | 2026-03-28 | #c-language #compilation #machine-code #native-code |
| [[software-architecture-terms\|소프트웨어 아키텍처 용어 정리]] | 2026-03-28 | #architecture #terminology #middleware #fundamentals |
| [[healthcare-data-exchange-standards\|의료 데이터 교환 표준: HL7, FHIR, DICOM 비교]] | 2026-03-28 | #healthcare #hl7 #fhir #dicom #interoperability |
| [[c-level-optimization\|Python C 레벨 최적화란?]] | 2026-03-27 | #performance #optimization #python #native-code |
| [[custom-vs-built-in-functions\|SQL/Python 사용자 정의 함수 vs 내장함수]] | 2026-03-27 | #functions #sql #python #performance #database |
| [[essential-specifications\|필수 표준 & 명세서 가이드]] | 2026-03-27 | #standards #reference #specification #web #protocol |
| [[snomed-ct\|국제 의료표준 코드(SNOMED-CT) 도입기]] | 2026-03-26 | #healthcare #snomed-ct #medical-code #data-governance |
| [[privacy-policy-healthcare\|헬스케어 앱 개인정보처리방침 작성법]] | 2026-03-25 | #privacy #healthcare #data-protection #compliance |
| [[unix-domain-socket\|Unix Domain Socket (유닉스) 이해하기]] | 2026-03-24 | #ipc #networking #unix #optimization #performance |
