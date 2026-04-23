---
title: HTTPS와 SSL 인증서 적용 흐름
date: '2026-04-01'
updated: '2026-04-01'
tags:
  - https
  - ssl
  - networking
  - security
  - tls
  - protocol
  - encryption
  - web
  - dns
  - infrastructure
related_projects: []
summary: HTTP에서 HTTPS로 전환하는 개념과 DNS, A레코드, SSL 인증서 적용 및 갱신 전체 흐름 정리
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---
# HTTPS와 SSL 인증서 적용 흐름

_written by Claude-Code_

## 1. HTTPS가 뭔가? (HTTP vs HTTPS)

```
HTTP  : 클라이언트 ──── 평문(텍스트) ────→ 서버
HTTPS : 클라이언트 ──── 암호화된 데이터 ──→ 서버
```

> **HTTPS = HTTP + TLS**
> 데이터를 주고받기 전에 **TLS(Transport Layer Security)** 로 암호화 터널을 먼저 만든다.

"SSL 적용한다" = 서버에 TLS 인증서를 설치해서 암호화 통신을 활성화하는 것.
(SSL은 구버전 명칭, 현재 표준은 TLS 1.3 — 하지만 업계에서는 여전히 "SSL"이라 부름)

---

## 2. OSI 7계층에서 TLS의 위치

```
┌──────────────────────────────────────┐
│  7. 응용 계층     HTTP, WebSocket     │  ← 실제 데이터 (요청/응답)
├──────────────────────────────────────┤
│  6. 표현 계층     TLS/SSL  ◀── 여기   │  ← 암호화 / 복호화
├──────────────────────────────────────┤
│  5. 세션 계층                         │
├──────────────────────────────────────┤
│  4. 전송 계층     TCP (443 포트)       │  ← 패킷 전송
├──────────────────────────────────────┤
│  3. 네트워크 계층  IP                  │
└──────────────────────────────────────┘
```

- HTTP는 L7에서 데이터를 만들고
- TLS(L6)가 그 데이터를 **암호화**한 뒤
- TCP(L4)가 443 포트로 전송한다

---

## 3. 핵심 개념 3가지

### DNS & A레코드

**A레코드는 도메인 등록 서비스(Registrar) 또는 DNS 호스팅 업체의 관리 콘솔에서 설정한다.**
(GoDaddy, Cloudflare, AWS Route 53, Gabia 등 — 도메인을 구매한 곳 또는 네임서버를 위임한 곳)

```
[브라우저]  example.com 입력
     │
     ▼
[내 PC / OS]  로컬 캐시 & hosts 파일 확인 → 없으면 아래로
     │
     ▼
[Recursive DNS]  통신사(ISP) 또는 8.8.8.8(Google)
     │  "example.com 누가 알아?"
     ▼
[Root DNS]  .com 담당 TLD 서버 알려줌
     │
     ▼
[TLD DNS]  .com 서버 → "example.com 담당 네임서버는 ns1.registrar.com"
     │
     ▼
[Authoritative DNS]  ← A레코드가 여기 있음
  (도메인 등록업체 or Cloudflare 등 NS 위임처)
  A레코드: example.com → 123.456.789.0
     │
     ▼
[내 서버]  IP 123.456.789.0 로 최종 접속
```

> 라우터는 이 과정에 관여하지 않는다. 라우터는 내부 네트워크 패킷을 외부로 내보내는 역할이고, A레코드는 **인터넷상의 DNS 서버**에 저장된다.

**A레코드 설정 예시** (Cloudflare 기준)

```
Type   Name          Content          TTL
A      example.com   123.456.789.0    Auto
A      www           123.456.789.0    Auto
```

인증서를 발급하려면 이 A레코드가 **현재 인증서를 받을 서버 IP를 가리키고 있어야** 한다.

---

### SSL 인증서 파일 3종

**CA(Certificate Authority, 인증기관)** = 인증서가 진짜임을 보증해주는 공인 제3자 기관.
브라우저는 CA 목록을 내장하고 있어, 해당 CA가 서명한 인증서만 신뢰한다.
대표적으로 Let's Encrypt(무료), DigiCert, Sectigo 등이 있다.

| 파일 | 역할 |
|------|------|
| `private.key` | 서버만 가진 비밀키. 절대 외부 노출 금지 |
| `certificate.crt` | 서버의 공개키 + 도메인 정보. CA가 서명한 인증서 |
| `fullchain.pem` | `certificate.crt` + 중간 CA 인증서를 합친 파일 |

```
인증서 신뢰 체인 (Chain of Trust)

  Root CA (브라우저가 기본 신뢰)
      │
  Intermediate CA (중간 인증기관)
      │
  Server Certificate (내 도메인 인증서)

→ fullchain = Intermediate CA + Server Certificate 합본
→ 브라우저가 체인을 따라 Root CA까지 검증함
```

---

### TLS 핸드셰이크 흐름

```
클라이언트                          서버
    │                               │
    │──── ClientHello ─────────────→│  (TLS 버전, 암호화 방식 제안)
    │                               │
    │←─── ServerHello ──────────────│  (암호화 방식 선택)
    │←─── Certificate (fullchain) ──│  (서버 인증서 전달)
    │                               │
    │  [브라우저가 인증서 검증]        │
    │  Root CA 신뢰 체인 확인         │
    │  도메인 일치 확인               │
    │  유효기간 확인                  │
    │                               │
    │──── 세션키 교환 ───────────────→│  (대칭키 생성)
    │                               │
    ════════ 암호화 통신 시작 ═════════  (HTTPS)
```

---

## 4. 인증서 발급 & 적용 전체 흐름

```
[1단계] 도메인 준비
  도메인 구매 → A레코드에 서버 IP 등록
  example.com → 123.456.789.0

[2단계] 인증서 발급 (Let's Encrypt 예시)
  서버에서 certbot 실행
       │
       ▼
  CA(인증기관)가 도메인 소유 확인
  (HTTP-01: .well-known/ 경로에 파일 생성
   또는 DNS-01: TXT 레코드 추가)
       │
       ▼
  발급 완료
  /etc/letsencrypt/live/example.com/
    ├── privkey.pem     (private key)
    ├── cert.pem        (certificate.crt)
    └── fullchain.pem   (cert + 중간CA)

[3단계] 웹서버에 인증서 적용 (nginx 예시)
  server {
      listen 443 ssl;
      ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  }

[4단계] HTTP → HTTPS 리다이렉트
  server {
      listen 80;
      return 301 https://$host$request_uri;
  }
```

---

## 5. 인증서 갱신 흐름

Let's Encrypt 인증서는 **90일** 유효기간.

```
[자동 갱신 설정]

  crontab 또는 systemd timer
       │
       ▼
  certbot renew  (만료 30일 전부터 갱신 시도)
       │
       ▼
  새 인증서 발급 → 파일 덮어쓰기
       │
       ▼
  nginx reload  (다운타임 없이 인증서 교체)
       │
       ▼
  완료
```

**수동 갱신 시 체크리스트**

```
[ ] A레코드가 현재 서버 IP를 가리키는가?
[ ] 80 포트가 열려 있는가? (HTTP-01 인증 방식)
[ ] certbot renew --dry-run 으로 사전 검증
[ ] 갱신 후 nginx -t 로 설정 문법 확인
[ ] nginx reload 또는 서비스 재시작
[ ] 브라우저에서 자물쇠 아이콘 및 만료일 확인
```

---

## 6. 마무리

| 개념 | 한 줄 요약 |
|------|-----------|
| HTTPS | HTTP + TLS 암호화. 443 포트 사용 |
| TLS/SSL | OSI L6에서 데이터를 암호화하는 프로토콜 |
| A레코드 | 도메인 → 서버 IP 연결. 인증서 발급의 전제조건 |
| fullchain.pem | 내 인증서 + 중간CA 묶음. 신뢰 체인 전달용 |
| private.key | 서버만 보관하는 비밀키. 절대 공개 금지 |
| 인증서 갱신 | 만료 전 certbot renew → nginx reload |

---

## 참고

- [Let's Encrypt 공식](https://letsencrypt.org/docs/)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [[javascript/websocket-protocol|WebSocket 프로토콜]] — wss:// 도 동일한 TLS 위에서 동작
- [[cs/essential-specifications|필수 표준 & 명세서 가이드]] — TLS RFC 버전 히스토리
