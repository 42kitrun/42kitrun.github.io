---
title: "구글 플레이 앱 서명, 한 번에 이해하기"
date: 2026-04-07
updated: 2026-04-07
tags:
  - android
  - app-signing
  - keystore
  - google-play
  - security
  - cryptography
  - public-key
  - certificate
  - pem
summary: "앱 서명의 개념, 비대칭 암호화 원리, Keystore와 PEM 파일의 관계를 논리적으로 정리한다. keystore를 잃어버릴 뻔한 사건의 산물."
devto: false
devto_id:
devto_url:
---

# 구글 플레이 앱 서명, 한 번에 이해하기

> keystore 파일과 비밀번호를 잊어버려서 업로드 키 재신청까지 했는데,
> 백업본을 찾았다. 이 글은 그 사건의 산물이다.

---

## 왜 앱 서명이 필요한가?

앱을 플레이스토어에 올린다고 끝이 아니다.
구글은 두 가지를 보장해야 한다.

- **무결성**: 배포 후 누군가 앱을 변조하지 않았는가?
- **신뢰성**: 업데이트가 원래 개발자로부터 왔는가?

이걸 해결하는 수단이 **앱 서명(App Signing)** 이다.

---

## 보안 원리: 비대칭 암호화

앱 서명의 바탕은 **비대칭 암호화(Public Key Cryptography)** 다.
열쇠가 두 개인데, 수학적으로 쌍을 이룬다.

```
Private Key  →  서명 생성 (나만 할 수 있음)
Public Key   →  서명 검증 (누구나 할 수 있음)
```

### 서명 → 검증 흐름

```
[개발자]
앱 파일 ──→ Hash 계산 ──→ Private Key로 암호화 ──→ 서명(Signature)
                                                         │
                                                    앱에 첨부하여 배포
                                                         │
[구글 / 사용자 기기]                                      ↓
앱 수신 ──→ 앱 파일로 Hash 재계산
         ──→ 서명을 Public Key로 복호화 ──→ Hash 추출
         ──→ 두 Hash 비교 ──→ 일치 ✅ / 불일치 ❌
```

앱이 변조되면 Hash가 달라지고, 서명을 위조하려면 Private Key가 필요하다.
Private Key 없이는 유효한 서명을 만들 수 없다.

Android는 **RSA-2048** 또는 **ECDSA P-256** 알고리즘을 사용한다.

---

## Keystore, 그리고 PEM 파일

### Keystore

Private Key를 안전하게 보관하는 **암호화된 금고 파일**이다.

```
Keystore (.jks / .keystore)
├── Private Key   ← 서명에 사용, 절대 공개 금지
└── Certificate   ← 공개 정보 (Public Key 포함)
```

Certificate 안에 Public Key가 들어있어서,
검증 측은 앱에서 직접 Public Key를 꺼내 쓸 수 있다.

### Certificate PEM 파일

Keystore에서 **공개 부분(Certificate)만** 텍스트로 추출한 파일이다.

```
-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQDU... (Base64 인코딩)
-----END CERTIFICATE-----
```

| | Private Key | Certificate PEM |
|--|-------------|-----------------|
| 내용 | 비밀 서명 키 | 공개 인증서 |
| 공개 가능? | ❌ 절대 안 됨 | ✅ 공개해도 됨 |
| 구글 제출 | ❌ | ✅ |

구글이 기존 앱 서명 키를 등록할 때 PEM 파일을 요구하는 이유가 여기 있다.
비밀 키는 주지 않아도 되고, 공개 인증서만으로 검증이 가능하기 때문이다.

---

## Google Play 앱 서명 방식 2가지

### 방식 1: 직접 관리 (구형)

```
내 Keystore ──→ 최종 서명 ──→ 사용자 기기
```

내 keystore가 곧 최종 서명키다.
**잃어버리면 앱을 영구 삭제하고 새로 올려야 한다.**

### 방식 2: Google Play 앱 서명 사용 (권장) ✅

```
내 Keystore (Upload Key)
       │
       ↓ 구글에 업로드
Google Play
       │ 구글의 App Signing Key로 재서명
       ↓
   사용자 기기
```

내 keystore는 **Upload Key** 역할만 한다.
실제 최종 서명은 구글이 별도로 보관하는 App Signing Key로 한다.

Upload Key를 잃어버려도 구글에 재발급 요청이 가능하다.
*(나처럼 될 뻔했지만, 다행히 백업을 찾았다.)*

---

## 절대 하면 안 되는 것

```
❌ keystore 파일 분실       → 앱 업데이트 영구 불가 (방식 1의 경우)
❌ keystore를 git에 커밋    → 보안 사고
❌ 비밀번호 어딘가에만 기억  → 잊어버리면 동일한 결과
```

**백업은 반드시 2곳 이상, 오프라인 포함.**

---

## 한 줄 요약

> Keystore = 앱의 신분증 발급 도장.
> Google Play 앱 서명을 쓰면 도장을 잃어도 구글이 복구해준다.
> 그래도 잃어버리지 마라.
