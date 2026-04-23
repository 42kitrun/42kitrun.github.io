---
title: CDN 서비스의 SSL/TLS 암호화 모드 정리 — Flexible, Full, Full (Strict)
date: '2026-04-23'
updated: '2026-04-23'
tags:
  - cdn
  - ssl
  - tls
  - cloudflare
  - infrastructure
  - security
  - https
  - reverse-proxy
  - origin
  - networking
related_projects:
  - nowinseoul
  - medidaily
summary: CDN 앞단을 쓰는 서비스에서 SSL/TLS 암호화 모드가 무엇을 바꾸는지, Flexible·Full·Full (Strict)의 차이와 실무 체크포인트를 정리한다.
devto: false
devto_id: null
devto_url: null
ai_agent: Codex, Claude
---

# CDN 서비스의 SSL/TLS 암호화 모드 정리 — Flexible, Full, Full (Strict)

_written by Codex_

CDN 앞단을 쓰는 환경에서 SSL/TLS 모드는 단순히 "HTTPS를 켤지"를 정하는 옵션이 아니다.  
실제로는 **클라이언트 ↔ CDN**, **CDN ↔ 원본 서버(Origin)** 두 구간을 어떤 방식으로 암호화하고 검증할지 정하는 설정이다.

특히 Cloudflare처럼 프록시형 CDN에서는 `Flexible`, `Full`, `Full (strict)` 같은 모드 이름이 그대로 노출되기 때문에, 장애가 나면 이 설정부터 다시 보게 된다.

![CDN SSL/TLS 암호화 모드 개요|900](/assets/posts/infrastructure/cdn-ssl-tls-modes/cdn-ssl-tls-modes-overview.svg)

---

## 한 문장 요약

가능하면 **`Full (strict)`를 기본값**으로 생각하면 된다.  
`Flexible`은 임시 복구나 레거시 대응에는 쓸 수 있어도, 로그인/개인정보/관리자 페이지가 있는 서비스의 정상 상태로 두기에는 부적절하다.

---

## 1. 이 설정이 실제로 제어하는 것

```
사용자 브라우저  ←→  CDN 엣지  ←→  원본 서버
   구간 A              구간 B
```

이때 SSL/TLS 모드는 아래 두 질문에 답한다.

1. **구간 A**: 사용자와 CDN 사이는 HTTPS로 암호화되는가?
2. **구간 B**: CDN과 원본 서버 사이는 HTTPS로 암호화되는가? 그리고 원본 인증서를 검증하는가?

즉, 브라우저 주소창에 자물쇠가 떠도 **원본까지 안전한 것과는 별개**일 수 있다.  
`Flexible`이 대표적이다.

---

## 2. 대표 모드 구성

Cloudflare 공식 문서 기준으로 현재 주요 모드는 `Off`, `Flexible`, `Full`, `Full (strict)`, `Strict (SSL-Only Origin Pull)`이다.  
실무에서 가장 자주 비교하는 것은 `Flexible`, `Full`, `Full (strict)` 세 가지다.

| 모드 | 브라우저 ↔ CDN | CDN ↔ Origin | Origin 인증서 검증 | 실무 판단 |
|------|----------------|--------------|--------------------|-----------|
| `Off` | HTTP | HTTP | 없음 | 운영 서비스 비권장 |
| `Flexible` | HTTPS 가능 | HTTP | 없음 | 임시 대응용 |
| `Full` | HTTPS 가능 | 요청이 HTTPS면 Origin도 HTTPS | 안 함 | 과도기 |
| `Full (strict)` | HTTPS 가능 | HTTPS | 함 | 기본 권장 |
| `Strict (SSL-Only Origin Pull)` | HTTPS 가능/HTTP 요청과 무관 | 항상 HTTPS | 함 | 엔터프라이즈 고보안 |

---

## 3. 각 모드 이해하기

### `Flexible`

```
브라우저  -- HTTPS -->  CDN  -- HTTP -->  Origin
```

- 사용자는 HTTPS로 접속해도
- CDN과 원본 서버 사이는 평문 HTTP다
- 원본 서버에는 인증서가 없어도 된다

처음 보면 "그래도 앞단은 HTTPS니까 괜찮지 않나?" 싶지만, 이 모드는 **끝까지 암호화되지 않는다.**  
즉 원본 구간에서 패킷이 평문으로 지나가며, 원본 서버가 HTTPS 리다이렉트를 강제하면 **무한 리다이렉트 루프**가 나기 쉽다.

실무에서 `Flexible`은 보통 이런 상황에서 등장한다.

- 원본 서버에 아직 인증서를 못 설치함
- 레거시 호스팅 환경이라 443 설정이 어려움
- 일단 사이트를 살리고 나중에 정리하려는 임시 복구 단계

하지만 아래 조건 중 하나라도 있으면 운영 기본값으로 두기 어렵다.

- 로그인 세션이 있음
- 관리자 페이지가 있음
- 개인정보나 결제 정보가 지남
- 원본 서버와 CDN 사이 네트워크를 완전히 신뢰할 수 없음

### `Full`

```
브라우저  -- HTTPS -->  CDN  -- HTTPS -->  Origin
```

- 원본도 HTTPS를 쓴다
- 다만 **원본 인증서를 검증하지 않는다**
- self-signed 인증서, 만료된 인증서, 호스트명이 안 맞는 인증서도 연결될 수 있다

즉 암호화는 되지만 **"정말 그 원본이 맞는지"** 에 대한 검증이 약하다.  
그래서 `Full`은 흔히 **과도기 모드**로 본다.

이 모드가 유용한 경우:

- 원본에는 TLS를 붙였지만 공인 인증서가 아직 없음
- 사설 인증서나 self-signed 인증서를 잠시 쓰고 있음
- `Flexible`에서 빠르게 한 단계 올려야 함

### `Full (strict)`

```
브라우저  -- HTTPS -->  CDN  -- HTTPS -->  Origin
                              인증서 유효성 검증
```

- 원본과도 HTTPS
- 원본 인증서도 검증
- 인증서는 공인 CA 또는 Cloudflare Origin CA를 사용할 수 있다

실무적으로는 이게 가장 균형 잡힌 기본값이다.

- 종단 간 암호화
- 원본 위장 방지
- 운영 중 문제 원인도 상대적으로 명확

원본 인증서 조건은 대체로 아래와 같다.

- 만료되지 않았을 것
- 요청 호스트명과 CN/SAN이 맞을 것
- 신뢰 가능한 발급 체인일 것

### `Strict (SSL-Only Origin Pull)`

이 모드는 엔터프라이즈 전용 고보안 모드다.  
브라우저가 HTTP로 들어오더라도 CDN에서 원본으로 갈 때는 항상 HTTPS를 사용하고, 인증서 검증도 수행한다.

일반적인 운영 서비스라면 우선 `Full (strict)`와 Authenticated Origin Pulls까지 맞추는 것으로도 충분히 좋은 수준이다.

---

## 4. 왜 `Flexible`에서 사이트가 자주 깨지나

`Flexible`에서 가장 흔한 문제는 **리다이렉트 루프**다.

예를 들어:

1. 사용자가 `https://example.com` 요청
2. CDN은 HTTPS로 받음
3. CDN이 Origin에는 HTTP로 전달
4. Origin은 "HTTP로 왔네? HTTPS로 보내야지" 하며 301/302 반환
5. 다시 CDN이 그 응답을 사용자에게 전달
6. 사용자는 다시 HTTPS로 요청
7. CDN은 다시 Origin에 HTTP로 전달
8. 반복

즉 브라우저는 HTTPS인데, 원본은 계속 HTTP 요청을 받고 있다고 느끼기 때문에 충돌이 난다.

또 자주 나오는 문제가 아래다.

- **Mixed Content**: HTML은 HTTPS인데 내부 이미지/스크립트가 `http://`로 남아 있음
- **원본 보안 착시**: 사용자 입장에서는 HTTPS처럼 보여도 CDN 뒤 구간은 평문
- **AOP 사용 불가**: Authenticated Origin Pulls는 `Off`/`Flexible`에서 동작하지 않음

---

## 5. 실무 권장 구성

### 가장 일반적인 권장안

1. 원본 서버에 인증서 설치
2. CDN 모드를 `Full (strict)`로 설정
3. 원본 서버는 443 정상 응답 확인
4. HTTP → HTTPS 리다이렉트 정책 정리
5. 필요하면 Authenticated Origin Pulls 추가

원본 인증서는 두 가지 선택지가 많다.

- **공인 CA 인증서**
  - CDN을 우회해 원본에 직접 붙는 경우도 대응 가능
  - 브라우저에서도 신뢰
- **Cloudflare Origin CA**
  - Cloudflare 프록시 뒤에서만 쓸 거면 실용적
  - Cloudflare가 원본 인증서를 검증할 수 있음
  - 단, 직접 원본에 접속하면 브라우저 신뢰용 인증서는 아님

### 마이그레이션 순서

현재 `Flexible`이라면 보통 이렇게 간다.

1. 원본 443 열기
2. 원본 인증서 설치
3. 서버에서 직접 `https://origin-host` 확인
4. CDN 모드를 `Full` 또는 바로 `Full (strict)`로 변경
5. 리다이렉트 정책과 mixed content 점검
6. 최종적으로 `Full (strict)` 유지

---

## 6. 장애와 에러 코드로 보는 판단 기준

Cloudflare 공식 문서 기준으로 실무에서 자주 보는 패턴은 아래다.

| 증상 | 의미 | 보통 확인할 것 |
|------|------|----------------|
| `ERR_TOO_MANY_REDIRECTS` | 리다이렉트 충돌 | `Flexible` 사용 여부, 원본 HTTPS 강제 규칙 |
| `525 SSL handshake failed` | CDN ↔ Origin 핸드셰이크 실패 | 원본 443, 인증서 설치, TLS 설정 |
| `526 invalid SSL certificate` | Origin 인증서 검증 실패 | `Full (strict)`에서 인증서 유효기간, CN/SAN, 체인 |

여기서 중요한 실무 포인트:

- `525`는 **연결 자체가 안 붙는 쪽**
- `526`은 **붙긴 붙는데 인증서가 신뢰되지 않는 쪽**

이 차이를 구분하면 원인 분석이 빨라진다.

---

## 7. 운영 체크리스트

배포 전이나 장애 복구 중에는 아래를 순서대로 보면 된다.

### 구성 체크

- DNS 레코드가 실제 원본을 올바르게 가리키는가
- 원본 80/443 포트가 기대대로 열려 있는가
- 웹서버(Nginx, Apache)에서 올바른 인증서를 사용 중인가
- 인증서 CN/SAN이 실제 도메인과 일치하는가
- 인증서 만료일이 지났지 않았는가

### 정책 체크

- CDN 쪽 `Always Use HTTPS` 같은 강제 정책이 켜져 있는가
- 원본 서버도 별도로 HTTP → HTTPS 강제를 하고 있는가
- 둘이 동시에 충돌해서 루프가 나지 않는가
- 애플리케이션 내부 절대 URL이 `http://`로 박혀 있지 않은가

### 보안 체크

- 로그인/관리자/개인정보 페이지를 `Flexible`로 두고 있지 않은가
- Origin이 CDN 우회 직접 접속에도 노출되어 있지 않은가
- 가능하면 Authenticated Origin Pulls까지 붙였는가

---

## 8. 실무 결론

정리하면:

- **`Flexible`**: 원본에 TLS가 없을 때 잠깐 쓰는 모드
- **`Full`**: 암호화는 되지만 인증서 검증이 약한 과도기 모드
- **`Full (strict)`**: 대부분의 운영 서비스 기본값

"홈페이지가 갑자기 깨졌다"는 상황에서 이 설정을 다시 보는 이유는 단순하다.  
이 모드 하나가 **리다이렉트, 인증서 검증, 원본 연결 방식**을 동시에 바꾸기 때문이다.

사이트를 안정적으로 운영하려면 최종 목표는 명확하다.

> **Origin에도 정상 인증서를 두고, CDN 모드는 `Full (strict)`로 맞춘다.**

---

## 참고

- [Cloudflare Docs - Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [Cloudflare Docs - Flexible](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/flexible/)
- [Cloudflare Docs - Full](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full/)
- [Cloudflare Docs - Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Cloudflare Docs - Strict (SSL-Only Origin Pull)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/ssl-only-origin-pull/)
- [Cloudflare Docs - Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Cloudflare Docs - Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/)
- [Cloudflare Docs - Error 525](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-525/)
- [Cloudflare Docs - Error 526](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-526/)
- [[security/https-ssl-certificate|HTTPS와 SSL 인증서 적용 흐름]]
- [[infrastructure/web-infrastructure-loadbalancer-gateway-cdn-webserver|웹 인프라 - CDN, 로드밸런서, Gateway API, 웹서버의 역할과 헤더 기반 트래픽 분기]]
