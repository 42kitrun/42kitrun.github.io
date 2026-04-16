---
title: 이메일이 스팸함으로 가는 이유 — DNS 레코드와 SPF, DKIM, DMARC
date: 2026-04-16
updated: 2026-04-16
tags:
  - dns
  - spf
  - dkim
  - dmarc
  - email
  - security
  - networking
  - osi
  - infrastructure
  - protocol
  - udp
  - txt-record
  - spam
  - authentication
summary: "이메일이 스팸함으로 분류되지 않으려면 DNS TXT 레코드에 SPF, DKIM, DMARC를 설정해야 한다. 그 배경인 DNS 구조와 레코드 종류를 먼저 짚는다."
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---
# 이메일이 스팸함으로 가는 이유 — DNS 레코드와 SPF, DKIM, DMARC

_written by Claude-Code_

비밀번호 재설정 메일이 스팸함으로 분류되는 건 대부분 **발신자 신뢰성을 DNS에 등록하지 않아서**다.  
수신 서버는 "이 메일이 진짜 그 도메인에서 보낸 건지" DNS를 통해 확인한다.

---

## 1. DNS란?

DNS(Domain Name System)는 **도메인을 IP 주소로 변환하는 분산 데이터베이스**다.

```
example.com  →  1.2.3.4
```

사람은 도메인으로 기억하지만, 실제 통신은 IP로 이루어진다. DNS는 그 중간 번역을 담당한다.  
그리고 IP 주소 매핑 외에도 **메일 서버, 도메인 소유 증명, 스팸 방지 정책** 같은 다양한 정보를 레코드로 저장한다.

---

## 2. OSI 7계층에서 DNS의 위치와 동작

![DNS가 관여하는 OSI 계층과 요청 순서|697](/assets/posts/infrastructure/dns-records-spf-dkim-dmarc/dns_osi_layers.svg)
> [!note]- 브라우저 → OS 리졸버 호출
  > 브라우저가 직접 DNS 서버에 묻지 않고, **OS에게 "이 도메인 IP 좀 찾아줘"라고
  요청을 위임**한다는 뜻입니다.
  >
  > **흐름**
  >
  > 브라우저
  > → OS 리졸버 (운영체제 내장 DNS 클라이언트)
  >    1. hosts 파일 확인 (/etc/hosts)
  >    2. 로컬 캐시 확인
  >    3. 없으면 외부 DNS 서버에 UDP 질의
  > 
  > → DNS 서버 (8.8.8.8, ISP 등)
  > → IP 반환 → OS → 브라우저
  >
  > **왜 브라우저가 직접 안 하나?**
  >
  > DNS 조회는 앱마다 중복으로 하면 낭비이기 때문입니다.
  > OS가 한 번 조회하면 **캐시에 저장**해두고, 같은 도메인을 물어보는 앱 전체에
  재사용합니다.
  > 브라우저, curl, Slack — 뭘 쓰든 `example.com`을 조회하면 전부 OS 리졸버를
  거칩니다.

DNS는 **HTTP 요청보다 먼저 실행된다.**  
브라우저가 URL을 입력받으면, TCP 연결 전에 DNS로 IP를 먼저 얻어야 한다.

| OSI 계층 | DNS 관여 | 역할 |
|----------|----------|------|
| L7 응용 | ✅ | DNS 쿼리 패킷 생성. 브라우저 → OS 리졸버 |
| L6 표현 | — | 미관여 |
| L5 세션 | — | 미관여 |
| L4 전송 | ✅ | **UDP 포트 53** 으로 전송. 응답 512B 초과 시 TCP 자동 전환 |
| L3 네트워크 | ✅ | IP 헤더로 DNS 서버 라우팅 |
| L2 데이터링크 | ✅ | 이더넷 프레임으로 포장 |

---

## 3. DNS 패킷 캡슐화 순서

![DNS 패킷 캡슐화 순서|697](/assets/posts/infrastructure/dns-records-spf-dkim-dmarc/dns_packet_encapsulation.svg)

계층을 내려갈수록 헤더가 바깥에 씌워진다.
실제로 전선 위에 흐르는 건 맨 아래 L2 형태다.

---

## 4. DNS 레코드 종류

![DNS 레코드 종류|697](/assets/posts/infrastructure/dns-records-spf-dkim-dmarc/dns_record_types.svg)

| 레코드 | 역할 | 예시 |
|--------|------|------|
| **A** | 도메인 → IPv4 주소 | `example.com → 1.2.3.4` |
| **AAAA** | 도메인 → IPv6 주소 | `example.com → ::1` |
| **CNAME** | 별칭 → 실제 도메인 | `www.ex.com → ex.com` |
| **MX** | 메일 서버 지정 | `priority 10, mail.ex.com` |
| **TXT** | 임의 텍스트 저장 | SPF / DKIM / DMARC 값 |
| **NS** | 이 도메인의 네임서버 | `ns1.cafe24.com` |

> **SPF, DKIM, DMARC는 모두 TXT 레코드 안에 담긴다.**

---

## 5. 이메일 스팸 방지 3종 세트

### SPF — 허가된 발신 서버 목록

수신 서버가 "이 IP가 이 도메인에서 메일을 보낼 권한이 있는가?"를 확인한다.

```
TXT  @  "v=spf1 include:_spf.google.com ~all"
```

- `include:` — 신뢰할 외부 서비스(Gmail, SendGrid 등)
- `~all` — 목록 외 발신은 소프트 실패(스팸 의심), `-all`이면 하드 실패(차단)

### DKIM — 메일 내용 서명 검증

발신 서버가 메일 헤더에 서명을 붙이고, 수신 서버가 **DNS의 공개키**로 검증한다.  
전송 중 내용이 변조되지 않았음을 보증한다.

```
TXT  google._domainkey  "v=DKIM1; k=rsa; p=MIGfMA0GCSq..."
```

- 서브도메인 형식: `selector._domainkey.example.com`
- 발신 서비스(Gmail, AWS SES 등)가 공개키와 서명 방법을 제공한다

### DMARC — SPF·DKIM 실패 시 처리 정책

도메인 소유자가 "검증 실패 시 어떻게 처리할지"를 수신 서버에 직접 지시한다.

```
TXT  _dmarc  "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"
```

| 정책 | 동작 |
|------|------|
| `p=none` | 모니터링만, 정상 전달 |
| `p=quarantine` | 스팸함으로 분류 |
| `p=reject` | 수신 거부 |

---

## 6. 수신 서버의 판정 흐름

```
메일 수신
  │
  ├── SPF 확인: 발신 IP가 TXT 레코드에 있는가?
  │     └── 실패 → DMARC로 넘김
  │
  ├── DKIM 확인: 서명이 공개키와 일치하는가?
  │     └── 실패 → DMARC로 넘김
  │
  └── DMARC 판정: SPF / DKIM 중 하나라도 실패 시
        ├── none      → 정상 전달 (리포트만)
        ├── quarantine → 스팸함
        └── reject    → 차단
```

SPF와 DKIM이 **둘 다 통과**하면 DMARC는 아무것도 하지 않는다.  
비밀번호 재설정 메일이 스팸함으로 가는 이유는 이 세 가지 TXT 레코드가 빠져 있거나 잘못 설정되어 있기 때문이다.

---

## 참고

- [[security/https-ssl-certificate|HTTPS와 SSL 인증서 적용 흐름]] — DNS A레코드와 인증서 발급 흐름
