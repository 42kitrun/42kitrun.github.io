---
title: 서명과 암호화는 다르다
date: '2026-04-13'
updated: '2026-04-13'
tags:
  - security
  - cryptography
  - signing
  - encryption
  - hmac
  - rsa
  - jwt
  - ssl
  - aes
  - hash
  - asymmetric-key
  - symmetric-key
  - authentication
  - integrity
  - public-key
related_projects: []
summary: 암호화는 내용을 숨기는 것, 서명은 내용은 그대로 두고 출처와 무결성만 증명하는 것 — 둘은 목적이 완전히 다르다
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# 서명과 암호화는 다르다

_written by Claude-Code_

개발하다 보면 **"서명한다(sign)"** 는 표현을 세 군데서 마주친다.

- AAB 빌드할 때 → "앱에 서명한다"
- SSL 인증서 발급할 때 → "CA가 인증서에 서명한다"
- JWT 발급할 때 → "hash_hmac으로 서명한다"

맥락이 달라 보이는데 왜 같은 단어를 쓸까? 그리고 이건 암호화와 뭐가 다를까?

---

## 서명이란 — 내용은 그대로, 지문만 붙인다

세 가지 모두 같은 원리로 동작한다.

```
원본 데이터  +  hash(data, secret_key)  →  원본 그대로 + {서명값}
```

원본을 건드리지 않는다. 대신 **"내가 만든 것, 아무도 안 건드린 것"** 을 증명하는 지문을 덧붙인다. 검증자는 같은 방식으로 서명을 다시 계산해보고, 일치하면 통과다.

---

## 암호화와 헷갈리는 이유

RSA, 키(key)라는 단어가 둘 다 등장하기 때문이다. 하지만 목적이 다르다.

![서명 vs 암호화 개념 비교|697](/assets/posts/security/signing-vs-encryption/signing_vs_encryption.svg)

| | 암호화 | 서명 |
|---|---|---|
| **목적** | 내용 숨기기 | 출처·무결성 증명 |
| **결과** | 암호문 (읽을 수 없음) | 원본 그대로 + 서명값 |
| **키 방향** | 수신자 키로 잠금 | 발신자 키로 서명 |

암호화는 내용을 잠그는 것, 서명은 내용에 지문을 찍는 것이다. 서명된 데이터는 여전히 누구나 읽을 수 있다.

---

## 세 곳에서 서명이 쓰이는 방식

![JWT, AAB, SSL 세 가지 서명 사례 비교|697](/assets/posts/security/signing-vs-encryption/three_signing_cases.svg)

### JWT — 토큰 위변조 방지

```
header.payload.signature
```

payload는 base64 인코딩이라 **누구나 디코딩해서 볼 수 있다.** 서명은 내용 보호가 아니라, 클라이언트가 payload를 몰래 바꿨는지 서버가 탐지하기 위해 있다. 같은 서버가 발급하고 검증하므로 대칭키(HMAC)로 충분하다.

- 민감 정보를 payload에 넣으면 안 되는 이유가 여기에 있다

### AAB / APK — 앱 출처 증명

앱 코드는 공개된다. 서명은 "이 앱이 정말 그 개발자가 빌드한 것인지"를 Android OS가 설치 시점에 검증하는 데 쓰인다. 서명이 다르면 같은 패키지명이라도 업데이트가 거부된다.

- 발급자(개발자)와 검증자(OS)가 다르므로 비대칭키(RSA) 사용

### SSL 인증서 — 사이트 신원 확인

인증서에는 도메인과 공개키가 담겨 있고, CA가 그 내용을 서명해 발급한다. 브라우저는 CA 공개키로 서명을 검증해 "신뢰할 수 있는 기관이 발급한 것"임을 확인한다. 이 검증이 끝난 뒤에야 실제 데이터 암호화(HTTPS)가 시작된다.

- 서명은 신원 확인, 그 이후의 암호화는 별개 단계

---

## 정리

셋 다 "서명한다"는 표현을 쓰는 이유: **원본을 그대로 두고 위변조를 탐지한다** 는 원리가 동일하기 때문이다.

암호화가 필요하면 서명 위에 얹는다. HTTPS가 그 예다 — 인증서 서명으로 신원 확인 후, 별도의 대칭키 암호화로 데이터를 보호한다.
