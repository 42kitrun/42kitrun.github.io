---
title: DoS와 DDoS — 서비스 거부 공격의 원리와 대응
date: '2026-04-03'
updated: '2026-04-03'
tags:
  - security
  - networking
  - ddos
  - infrastructure
  - attacks
  - performance
  - web
  - protocol
related_projects: []
summary: 보안 공격의 전체 지형을 파악하고, DoS/DDoS의 정의·차이·유형·대응법을 구조도 중심으로 정리한다
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# DoS와 DDoS — 서비스 거부 공격의 원리와 대응

_written by Claude-Code_

## 보안 공격의 전체 지도

DoS/DDoS를 이해하기 전에 어디에 위치하는 공격인지 파악한다.

```
보안 위협 분류
│
├── 네트워크 공격 (Network)
│   ├── DoS / DDoS          ← 이 글
│   ├── Man-in-the-Middle (MITM)
│   └── Packet Sniffing
│
├── 애플리케이션 공격 (Application)
│   ├── SQL Injection
│   ├── XSS / CSRF
│   └── HTTP Request Smuggling
│
├── 인증·인가 공격 (Auth)
│   ├── Brute Force
│   ├── Credential Stuffing
│   └── Session Hijacking
│
├── 소프트웨어 취약점 (Vulnerability)
│   ├── Zero-day Exploit
│   └── Supply Chain Attack
│
└── 사회공학 (Social Engineering)
    ├── Phishing
    └── Pretexting
```

DoS/DDoS는 **서비스 가용성(Availability)** 을 노리는 공격이다.  
데이터를 훔치거나 시스템에 침입하는 게 아니라, **서버를 다운시키는 것** 이 목적이다.

---

## DoS vs DDoS — 정의와 차이

### DoS (Denial of Service)

```
공격자 (1대)
    │
    │ 대량 요청
    ▼
[대상 서버] → 과부하 → 서비스 불가
```

- 단일 출처에서 대량 트래픽을 보내 서버를 마비시킨다
- 출처 IP 하나를 차단하면 막힌다
- 현대 인프라에서는 단독 공격 효과가 제한적

### DDoS (Distributed Denial of Service)

```
좀비 PC 1 ─┐
좀비 PC 2 ─┤
좀비 PC 3 ─┼─→ [대상 서버] → 과부하 → 서비스 불가
  ...       ┤
좀비 PC N ─┘

↑ 봇넷 (Botnet): 악성코드에 감염된 수천~수백만 대의 기기
```

- **봇넷**을 이용해 전 세계 수천~수백만 지점에서 동시 공격
- 출처 IP가 분산되어 차단이 어렵다
- 현실에서 "DDoS 공격"이라 하면 대부분 이 방식

### 핵심 차이

| 항목 | DoS | DDoS |
|------|-----|------|
| 공격 출처 | 단일 IP | 수천~수백만 IP (봇넷) |
| 차단 난이도 | 낮음 (IP 1개 차단) | 높음 (분산 출처) |
| 공격 규모 | 제한적 | 수 Tbps 가능 |
| 위협 수준 | 낮음 | 높음 |

---

## DDoS 공격 유형

OSI 레이어 기준으로 세 가지로 분류된다.

```
OSI Layer 7  [Application]  ← HTTP Flood, Slowloris
             [Presentation]
             [Session]
OSI Layer 4  [Transport]    ← SYN Flood, UDP Flood
OSI Layer 3  [Network]      ← ICMP Flood (Ping of Death)
             [Data Link]
             [Physical]
```

### Layer 3/4 — 대역폭 고갈 (Volumetric)

**UDP Flood**
```
공격자 → 수십만 개의 UDP 패킷 전송 → 서버 대역폭 고갈
서버는 포트마다 응답하려 하지만 처리 불가
```

**SYN Flood** (가장 흔한 유형)
```
정상 TCP 연결:
  Client → SYN →          Server
  Client ← SYN-ACK ←      Server
  Client → ACK →          Server  (연결 완료)

SYN Flood 공격:
  공격자 → SYN (가짜 IP) → Server
  Server ← SYN-ACK →      ???     (응답 없음)
  Server는 연결 대기 상태 유지 → 연결 테이블 고갈
```

### Layer 7 — 애플리케이션 고갈

**HTTP Flood**
```
봇넷 → 수백만 개의 정상적인 GET/POST 요청 → 웹 서버 CPU/메모리 고갈
트래픽이 정상처럼 보여 방화벽 통과 가능
```

**Slowloris**
```
공격자 → HTTP 요청 헤더를 아주 천천히 전송
서버는 연결을 열어둔 채 대기
→ 연결 수 한계 도달 → 새 요청 처리 불가
```

---

## 대응 방법

### 방어 레이어 구조

```
인터넷
  │
  ▼
[CDN / Anycast]          ← 트래픽 분산, 엣지에서 1차 필터링
  │
  ▼
[스크러빙 센터]           ← 대용량 DDoS 트래픽 정화 (Cloudflare, AWS Shield)
  │
  ▼
[WAF (Web Application Firewall)]  ← Layer 7 공격 탐지·차단
  │
  ▼
[Rate Limiter]           ← IP별 요청 수 제한
  │
  ▼
[로드밸런서]              ← 트래픽 분산, 이상 트래픽 감지
  │
  ▼
[Origin 서버]
```

### 대응 방법 요약

| 방어 수단 | 효과적인 공격 유형 | 설명 |
|-----------|-------------------|------|
| Anycast 라우팅 | Volumetric | 공격 트래픽을 여러 PoP에 분산 |
| 스크러빙 센터 | Volumetric | 악성 트래픽 필터링 후 정상 트래픽만 전달 |
| SYN Cookie | SYN Flood | 연결 테이블 소모 방지 |
| Rate Limiting | HTTP Flood | IP별 초당 요청 수 제한 |
| WAF 규칙 | Layer 7 전반 | 이상 패턴 탐지·차단 |
| IP 평판 차단 | 봇넷 | 알려진 악성 IP 사전 차단 |
| 연결 타임아웃 | Slowloris | 불완전 연결 자동 종료 |

### 클라우드 서비스 선택 기준

```
공격 규모 < 10 Gbps    → AWS Shield Standard (무료), Cloudflare Free
공격 규모 < 1 Tbps     → Cloudflare Pro / AWS Shield Advanced
공격 규모 > 1 Tbps     → Cloudflare Enterprise / Akamai Prolexic
```

---

## 실습으로 이어가기

이론만으로는 체감이 어렵다.  
실제로 테스트 환경을 구성하고 DDoS 시뮬레이션을 해보면 대응 방법의 효과를 직접 확인할 수 있다.

→ [[security/software-testing-types-load-stress-ddos|소프트웨어 테스트 종류 - 부하, 스트레스, 침투, DDoS 시뮬레이션]]
