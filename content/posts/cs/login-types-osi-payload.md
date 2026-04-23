---
title: 로그인은 어떻게 동작하나 — 페이로드, 세션, 토큰, OSI 7계층
date: '2026-04-13'
updated: '2026-04-13'
tags:
  - authentication
  - session
  - jwt
  - token
  - payload
  - http
  - osi
  - tls
  - tcp
  - security
  - networking
  - cookie
  - hmac
  - cryptography
  - mobile
  - lymphedema
  - iCON
related_projects: []
summary: 림프부종 자가관리 앱 코드에서 페이로드 개념을 발견하고, 세션·토큰 로그인 방식과 OSI 7계층 흐름을 함께 정리
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# 로그인은 어떻게 동작하나 — 페이로드, 세션, 토큰, OSI 7계층

_written by Claude-Code_

림프부종 자가관리 앱 코드를 분석하다가 이런 함수를 발견했다.

```php
function withAuthPayload(string $email, string $password, ?string $authToken = null): array {
    $base = ['email' => $email, 'password' => $password];
    return $authToken ? array_merge($base, ['authToken' => $authToken]) : $base;
}
```

"페이로드(payload)가 뭐지?"에서 시작해서 로그인 방식과 OSI 계층까지 이어서 정리한다.

---

## 페이로드란

페이로드 = **HTTP 요청 body에 담기는 실제 데이터 묶음**

택배에 비유하면:
- 박스 겉면(주소, 수신인) = 헤더·메타데이터
- 박스 안의 물건 = **페이로드**

`withAuthPayload()`는 상황에 따라 body 안에 뭘 넣을지 결정하는 함수다.

```
토큰 있을 때 → { email, password, authToken }
토큰 없을 때 → { email, password }
```

즉 "첫 로그인이면 이메일·비밀번호만, 이미 토큰을 가진 재인증이면 토큰도 함께 보내라"는 분기다.

---

## 로그인 방식 — 세션 vs 토큰

로그인에는 크게 두 가지 방식이 있다.

### 세션 방식

```
1. 클라이언트: POST /login  { email, password }
2. 서버: 로그인 기록 저장 → 세션 ID 발급
3. 서버 → 클라이언트: Set-Cookie: session_id=abc123
4. 이후 요청: Cookie: session_id=abc123  (쿠키만 들고 다님)
```

서버가 로그인 상태를 **직접 기억**한다. 클라이언트는 출입증 번호(쿠키)만 가진다. 서버가 "abc123이 누구인지" 테이블에서 조회해서 확인한다.

### 토큰(JWT) 방식

```
1. 클라이언트: POST /login  { email, password }
2. 서버: 서명된 JWT 발급 (서버 DB에 저장 안 함)
3. 서버 → 클라이언트: { token: "eyJ..." }
4. 이후 요청: Authorization: Bearer eyJ...  (토큰 자체를 들고 다님)
```

서버는 발급만 한다. 이후 요청마다 서명만 검증하면 된다. 서버가 상태를 저장하지 않아 수평 확장(스케일아웃)에 유리하다.

| | 세션 | 토큰(JWT) |
|---|---|---|
| 상태 저장 | 서버 | 클라이언트 |
| 클라이언트가 가진 것 | 출입증 번호(쿠키) | 출입증 자체(JWT) |
| 서버 확인 방법 | DB 조회 | 서명 검증 |
| 로그아웃 처리 | 세션 삭제 | 토큰 만료 대기 또는 블랙리스트 |

`withAuthPayload()`에서 `authToken`을 함께 보내는 것은 **토큰 방식**에서 재인증 시 기존 토큰도 같이 전달하는 흐름이다.

---

## OSI 7계층에서 로그인 요청이 가는 길

![OSI 7계층으로 보는 로그인/토큰 인증 흐름|697](/assets/posts/cs/login-types-osi-payload/osi_auth_flow.svg)

인증 로직은 **L7(응용 계층)** 의 일이다. 나머지 계층은 그 데이터를 목적지까지 안전하게 전달하는 역할만 한다.

| 계층 | 역할 |
|---|---|
| **L7 응용** | HTTP 요청 생성, 페이로드 구성, 토큰·비밀번호 검증, 쿠키 헤더 처리 |
| **L6 표현** | TLS가 L7에서 만든 페이로드 **전체를 암호화** — 중간에 가로채도 내용 불가 |
| **L5 세션** | 연결 유지, 세션 ID(쿠키)가 유효한지 관리 |
| **L4 전송** | TCP가 데이터를 패킷으로 쪼개 HTTPS 443 포트로 전송 |
| **L1~3** | 물리적 데이터 이동 — 인증과 무관 |

> 페이로드에 비밀번호가 담겨 있어도 L6에서 TLS가 전체를 암호화하므로, 네트워크 상에서는 읽을 수 없다. HTTPS를 쓰는 이유다.

---

## 정리

- **페이로드** = HTTP body 안의 실제 데이터. `withAuthPayload()`는 상황에 따라 body 구성을 다르게 함
- **세션** = 서버가 상태를 기억, 클라이언트는 쿠키 번호만 보유
- **토큰(JWT)** = 서버는 서명만 검증, 클라이언트가 토큰 자체를 보유
- **OSI 관점** = 인증 로직은 L7, 암호화는 L6(TLS), 전송은 L4(TCP)

관련 글: [[signing-vs-encryption|서명과 암호화는 다르다]]
