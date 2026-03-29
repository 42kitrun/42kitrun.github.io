---
title: 필수 표준 & 명세서 가이드
date: 2026-03-27
updated: 2026-03-27
tags:
  - reference
  - standards
  - rfc
  - specification
summary: "웹, 데이터베이스, 보안, 아키텍처 표준: HTTP RFC, SQL, ACID, OAuth, REST, SOLID 등 개발자가 알아야 할 필수 표준들"
devto: false
devto_id:
devto_url:
---

## 🎯 기본 표준이 중요한 이유

프레임워크와 도구는 계속 바뀌지만, **HTTP, JSON, HTML, REST, ACID** 같은 기본 표준은 영원합니다. 이들을 알면 어떤 기술도 빠르게 습득할 수 있습니다.

---

## 📚 핵심 명세서 (가장 먼저 읽을 것)

### RFC란?
**RFC (Request for Comments)** = 인터넷 표준의 공식 문서
- IETF(Internet Engineering Task Force)에서 발행
- 각 RFC는 고유 번호 (예: RFC 7230)
- 웹, 이메일, DNS 등 모든 인터넷 프로토콜의 법칙

### 반드시 북마크할 문서
| 문서 | 용도 |
|------|------|
| [IETF RFC Index](https://tools.ietf.org/rfc/index) | 모든 인터넷 표준 검색 |
| [W3C Specifications](https://www.w3.org/TR) | 웹 표준 (HTML, CSS, DOM) |
| [WHATWG Living Standards](https://spec.whatwg.org) | 브라우저 표준 (현재 진행형) |
| [MDN Web Docs](https://developer.mozilla.org) | 표준을 쉽게 설명한 문서 |

---

## 📖 웹 개발 핵심 표준

### HTTP & 프로토콜
| 표준 | RFC | 핵심 |
|------|-----|------|
| **HTTP/1.1** | [RFC 7230-7237](https://tools.ietf.org/html/rfc7230) | GET, POST, 상태코드, 헤더 |
| **HTTP/2** | [RFC 7540](https://tools.ietf.org/html/rfc7540) | 멀티플렉싱, 헤더 압축 |
| **HTTP/3** | [RFC 9000](https://tools.ietf.org/html/rfc9000) | QUIC 기반, 최신 표준 |
| **TLS 1.3** | [RFC 8446](https://tools.ietf.org/html/rfc8446) | 안전한 통신 |

### 데이터 포맷
| 표준 | 링크 | 핵심 |
|------|------|------|
| **JSON** | [RFC 7158](https://tools.ietf.org/html/rfc7158) | 객체, 배열, 타입 |
| **JSON Schema** | [Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) | 데이터 검증 |
| **URL** | [RFC 3986](https://tools.ietf.org/html/rfc3986) | URI/URL 명세 |

### 웹 기술

#### HTML (마크업)
- **표준:** [HTML Living Standard - WHATWG](https://html.spec.whatwg.org)
- **핵심:** 시맨틱 태그 (`<header>`, `<nav>`, `<article>`), 폼 요소
- **MDN:** [HTML Elements Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)

#### CSS (스타일)
- **표준:** [W3C CSS Specification](https://www.w3.org/Style/CSS)
- **핵심:** 선택자, 레이아웃 (Flexbox, Grid), 애니메이션
- **MDN:** [CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)

#### JavaScript (동적 기능)

**ECMAScript란?**
- ECMAScript = JavaScript의 공식 표준 이름
- ECMA International(국제 표준화 기구)에서 관리
- 매년 새 버전 릴리스 (ES6(2015) 이후로 매년 업데이트)
- 현재: ECMAScript 2024 (최신)

| 버전 | 출시 | 주요 기능 |
|------|------|---------|
| **ES5 (2009)** | 2009 | 엄격한 모드, JSON 지원 |
| **ES6/ES2015** | 2015 | `const/let`, 화살표 함수, 클래스, Promise |
| **ES2020** | 2020 | `?.` (옵셔널 체이닝), `??` (nullish coalescing) |
| **ES2023** | 2023 | Array.prototype.toSorted(), toReversed() |
| **ES2024** | 2024 | 최신 기능 추가 |

**문서:**
- [ECMA-262 스펙](https://262.ecma-international.org/) (공식 표준)
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)

---

## 🏗️ 아키텍처 & 설계

### REST 아키텍처
- **원문:** [Roy Fielding Dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- **핵심:** 리소스, HTTP 메서드, 상태 코드 중심의 API 설계
- **예:** GET /users, POST /users, PUT /users/1, DELETE /users/1

### SOLID 원칙
- **S**ingle Responsibility: 하나의 책임만
- **O**pen/Closed: 확장에 열려있고 수정에 닫혀있음
- **L**iskov Substitution: 부모 클래스로 대체 가능
- **I**nterface Segregation: 작은 인터페이스로 분리
- **D**ependency Inversion: 추상화에 의존

### 디자인 패턴
- [Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns) - 23가지 패턴
- Singleton, Factory, Observer, Strategy, Adapter 등

---

## 📊 데이터베이스 기본

### 관계형 DB (RDBMS)
| 개념 | 의미 |
|------|------|
| **정규화** | 1NF, 2NF, 3NF, BCNF - 데이터 중복 제거 |
| **ACID** | Atomicity(원자성), Consistency(일관성), Isolation(고립), Durability(지속성) |
| **인덱싱** | B-tree, Hash - 쿼리 성능 향상 |
| **쿼리 최적화** | EXPLAIN, 실행 계획 분석 |

### NoSQL 선택 기준
| 타입 | 용도 | 예시 |
|------|------|------|
| **문서 (Document)** | 유연한 스키마 | MongoDB, CouchDB |
| **키-값 (Key-Value)** | 빠른 조회, 캐싱 | Redis, Memcached |
| **시계열 (Time Series)** | 시간순 데이터 | InfluxDB, Prometheus |
| **그래프 (Graph)** | 관계 중심 | Neo4j, ArangoDB |

### CAP 정리
- **Consistency:** 모든 노드가 같은 데이터 본
- **Availability:** 항상 응답 가능
- **Partition Tolerance:** 네트워크 분할 견디기
- **현실:** 3가지를 동시에 불가능 (CP 또는 AP 선택)

---

## 🔐 보안 표준

### OWASP Top 10 (최신)
**링크:** [OWASP Top 10 - Latest](https://owasp.org/www-project-top-ten)

최신 버전의 웹 애플리케이션 보안 위협 상위 10개:

1. **Broken Access Control** - 권한 검증 실패
2. **Cryptographic Failures** - 암호화 관련 오류
3. **Injection** - SQL, NoSQL, OS 명령어 주입
4. **Insecure Design** - 보안 고려 없는 설계
5. **Security Misconfiguration** - 잘못된 설정
6. **Vulnerable & Outdated Components** - 취약한 의존성
7. **Authentication Failures** - 인증 우회
8. **Software & Data Integrity Failures** - 안전하지 않은 업데이트
9. **Logging & Monitoring Failures** - 감시 부족
10. **Server-Side Request Forgery (SSRF)** - SSRF 공격

### 인증/인가 표준
| 표준 | RFC | 용도 |
|------|-----|------|
| **OAuth 2.0** | [RFC 6749](https://tools.ietf.org/html/rfc6749) | 소셜 로그인, 권한 위임 |
| **OpenID Connect** | [OpenID Foundation](https://openid.net/specs/openid-connect-core-1_0.html) | OAuth 2.0 + 인증 |
| **JWT** | [RFC 7519](https://tools.ietf.org/html/rfc7519) | 토큰 기반 인증 |

### 암호화 표준
| 표준 | 용도 |
|------|------|
| **AES-256** | 데이터 암호화 |
| **SHA-256** | 해시 (데이터 무결성) |
| **bcrypt/Argon2** | 비밀번호 해싱 |
| **HMAC** | 메시지 검증 |

---

## 🌐 웹 브라우저 표준

### Core Web APIs
- [DOM Specification](https://dom.spec.whatwg.org) - 문서 객체 모델
- [Fetch API](https://fetch.spec.whatwg.org) - HTTP 요청
- [Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html) - localStorage, sessionStorage

### 보안 정책
| 정책 | 역할 | RFC |
|------|------|-----|
| **CORS** | 교차 출처 리소스 공유 제어 | [Fetch Standard](https://fetch.spec.whatwg.org/#cors-protocol) |
| **CSP** | 스크립트 실행 제한 (XSS 방지) | [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) |
| **HTTPS/TLS** | 안전한 통신 | RFC 8446 |
| **Same-Origin Policy** | 같은 출처만 접근 | [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) |

---

## ⚙️ 배포 & 운영 원칙

### 12 Factor App
1. **Codebase** - 버전 관리 (Git)
2. **Dependencies** - 명시적 선언 (package.json)
3. **Config** - 환경 변수 (`.env`)
4. **Backing Services** - DB, 캐시 분리
5. **Build/Run** - 빌드와 실행 분리
6. **Processes** - 무상태 프로세스
7. **Port Binding** - 자체 웹 서버
8. **Concurrency** - 프로세스 모델
9. **Disposability** - 빠른 시작/종료
10. **Dev/Prod Parity** - 환경 동일화
11. **Logs** - 표준 출력 (stdout)
12. **Admin Tasks** - 관리 작업 자동화

**링크:** [12factor.net](https://12factor.net)

### Observability (관찰성)
| 데이터 | 내용 |
|--------|------|
| **Metrics** | 시스템 상태 수치 (CPU, 메모리, 요청 수) |
| **Logs** | 사건 기록 (에러, 경고, 정보) |
| **Traces** | 요청 경로 추적 (분산 시스템 디버깅) |

### Four Golden Signals (모니터링)
1. **Latency** - 응답 시간
2. **Traffic** - 요청 수
3. **Errors** - 실패율
4. **Saturation** - 리소스 사용률

---

## 🎯 알고리즘 & 자료구조

개발자가 반드시 알아야 할 것:

### 시간 복잡도 (Big O)
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

### 필수 자료구조
| 구조 | 용도 | 시간복잡도 |
|------|------|----------|
| **Array** | 순차 데이터 | O(1) 접근, O(n) 삽입 |
| **LinkedList** | 삽입/삭제 | O(1) 삽입, O(n) 접근 |
| **HashTable** | 키-값 저장 | O(1) 평균 |
| **Tree/BST** | 정렬된 데이터 | O(log n) 검색 |
| **Heap** | 우선순위 | O(log n) 삽입/삭제 |
| **Graph** | 관계 표현 | DFS O(V+E), BFS O(V+E) |

### 필수 알고리즘
- 정렬: Quick Sort, Merge Sort (O(n log n))
- 검색: Binary Search (O(log n))
- 경로: Dijkstra, BFS
- 동적 계획법: Fibonacci, Knapsack

---

## 💡 결론

도구는 매년 바뀌지만, **명세서는 10년, 20년 유지됩니다.**

**HTTP를 모르면 API를 모르고, SQL을 모르면 DB를 모르고, REST를 모르면 설계를 못합니다.**

공식 명세서를 읽는 것은 단기적으로 어렵지만, 장기적으로 개발 생산성을 10배 향상시킵니다.

---

## 🔗 관련 개념

**다음 단계:**
- [[healthcare-data-exchange-standards|의료 데이터 교환 표준: HL7, FHIR, DICOM 비교]] - RFC와 명세서 기반의 의료 표준
- [[snomed-ct|국제 의료표준 코드(SNOMED-CT) 도입기]] - 의료 데이터의 표준 코드 체계

**기초 개념:**
- [[c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]] - 언어 표준과 구현의 관계

---
