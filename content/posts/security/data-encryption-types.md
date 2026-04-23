---
title: '[데이터 변환 이해 3편] 암호화 유형 — 대칭키, 비대칭키, 해시 함수'
date: '2026-04-03'
updated: '2026-04-03'
tags:
  - encryption
  - hashing
  - security
  - aes
  - rsa
  - cryptography
  - data-transformation
  - data-formats
  - fundamentals
  - https
  - tls
related_projects: []
summary: 대칭키 암호화, 비대칭키 암호화, 해시 함수의 동작 원리와 실무 사용처를 비교하고, 상황에 맞는 선택 기준을 정리한다
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# [데이터 변환 이해 3편] 암호화 유형 — 대칭키, 비대칭키, 해시 함수

_written by Claude-Code_

← [[data/data-encoding-types|2편: 인코딩 유형 — 문자 인코딩, Base64, URL 인코딩]]

---

## 세 가지 보안 변환

```
대칭키 암호화   같은 키로 암호화·복호화
비대칭키 암호화 공개키로 암호화, 개인키로 복호화 (또는 반대)
해시 함수       단방향 변환, 복원 불가
```

---

## 1. 대칭키 암호화

### 개념

```
송신자                            수신자
평문 → [암호화, 비밀키 K] → 암호문 → [복호화, 비밀키 K] → 평문
```

같은 키로 암호화하고 복호화한다.  
**키를 어떻게 안전하게 공유하느냐**가 핵심 과제다.

### AES (Advanced Encryption Standard)

현재 대칭키 암호화의 표준. 128/192/256비트 키를 지원한다.

```python
# Python — AES-256-GCM 예시 (실무 권장 방식)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = os.urandom(32)       # 256비트 키
nonce = os.urandom(12)     # 12바이트 nonce (매번 새로 생성)

aesgcm = AESGCM(key)
ciphertext = aesgcm.encrypt(nonce, b"비밀 메시지", None)
plaintext  = aesgcm.decrypt(nonce, ciphertext, None)
```

**GCM 모드**를 쓰는 이유: 암호화 + 무결성 검증을 동시에 제공한다.  
ECB 모드는 패턴이 노출되어 실무에서 쓰면 안 된다.

### 실무 사용처

```
DB 컬럼 암호화        민감 데이터(주민번호, 카드번호) 저장
파일 암호화           로컬 디스크, 백업 파일
TLS 세션 데이터 암호화 HTTPS 실제 데이터 전송 (키 교환은 비대칭키 사용)
```

### AES 알고리즘 개요

128비트 블록을 라운드 반복(10~14회)으로 변환한다.  
각 라운드는 4가지 연산(SubBytes, ShiftRows, MixColumns, AddRoundKey)으로 구성된다.  
브루트포스로 AES-256을 깨는 것은 현재 기술로 불가능하다.

---

## 2. 비대칭키 암호화

### 개념

```
키 쌍 생성: 공개키(Public Key) + 개인키(Private Key)

암호화 (기밀 전송)
  송신자: 평문 → [암호화, 수신자의 공개키] → 암호문
  수신자: 암호문 → [복호화, 수신자의 개인키] → 평문

서명 (인증·무결성)
  서명자: 데이터 → [서명, 서명자의 개인키] → 서명값
  검증자: 서명값 → [검증, 서명자의 공개키] → 유효/무효
```

공개키는 누구에게나 공개해도 된다.  
개인키는 절대 유출되면 안 된다.

### RSA

가장 널리 쓰이는 비대칭키 알고리즘. 키 길이는 2048비트 이상 권장.

```python
# Python — RSA 키 생성 및 서명 예시
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# 키 생성
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# 서명
signature = private_key.sign(b"서명할 데이터", padding.PKCS1v15(), hashes.SHA256())

# 검증
public_key.verify(signature, b"서명할 데이터", padding.PKCS1v15(), hashes.SHA256())
# 예외 없으면 검증 성공
```

### ECC (Elliptic Curve Cryptography)

RSA보다 짧은 키로 동등한 보안 수준을 제공한다.

```
보안 수준 비교
  RSA 2048비트  ≈  ECC 224비트
  RSA 3072비트  ≈  ECC 256비트  ← 현재 권장 (P-256, secp256k1)
```

모바일·IoT처럼 연산 비용이 중요한 환경에서 선호된다.  
TLS 1.3, Bitcoin, SSH 키에서 주로 사용된다.

### 실무 사용처

```
HTTPS (TLS 핸드셰이크)   서버 인증서 검증, 세션 키 교환
SSH 키 인증              서버 접속 인증
JWT 서명 (RS256/ES256)   토큰 발급자 인증
코드 서명                소프트웨어 배포 무결성 검증
```

### RSA 알고리즘 개요

큰 수의 소인수분해가 어렵다는 수학적 성질을 이용한다.  
두 소수 p, q의 곱 N = p×q는 쉽게 계산되지만, N에서 p와 q를 역산하는 것은 현재 기술로 매우 어렵다.  
키 길이가 길수록 소인수분해가 어려워진다.

---

## 3. 해시 함수

### 개념

```
임의 길이 입력 → [해시 함수] → 고정 길이 출력 (해시값)

특성
  - 단방향: 해시값 → 원래 입력 복원 불가
  - 결정적: 같은 입력 → 항상 같은 해시값
  - 충돌 저항: 다른 입력이 같은 해시값을 가지기 매우 어려움
  - 눈사태 효과: 입력 1비트 변경 → 해시값 완전히 달라짐
```

### SHA-256

현재 가장 널리 쓰이는 해시 함수. 출력은 항상 256비트(32바이트).

```python
import hashlib

hashlib.sha256(b"hello").hexdigest()
# "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"

hashlib.sha256(b"hello!").hexdigest()   # 마지막 '!' 하나 추가
# "334d016f755cd6dc58c53a86e183882f8ec14f52fb05345887c8a5edd42c87b7"
# ↑ 완전히 다른 값 (눈사태 효과)
```

**실무 사용처:**
```
파일 무결성 검증    다운로드 후 공식 SHA-256과 비교
데이터 변경 감지    이전 해시값과 비교 (Git 커밋 해시)
블록체인           트랜잭션 해시, 블록 해시
HMAC              메시지 인증 코드 (비밀키 + 해시)
```

### bcrypt / Argon2 — 비밀번호 전용

SHA-256은 빠르게 설계됐다. 이는 비밀번호 저장에 취약점이 된다.  
초당 수십억 개의 해시를 계산해 무차별 대입이 가능하기 때문이다.

```
비밀번호 해시 함수의 조건
  1. 의도적으로 느리게 설계 (연산 비용 조절 가능)
  2. Salt: 같은 비밀번호라도 다른 해시값 생성 (레인보우 테이블 방어)
```

```python
import bcrypt

# 비밀번호 저장
hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt(rounds=12))
# "$2b$12$eImiTXuWVxfM37uY4JANjQ..."

# 로그인 검증
bcrypt.checkpw(b"password123", hashed)  # True
bcrypt.checkpw(b"wrongpassword", hashed)  # False
```

**MD5는 비밀번호 저장에 쓰지 않는다.**  
충돌 취약점이 알려져 있고, 빠른 연산 때문에 크래킹에 취약하다.

---

## 선택 기준 정리

```
목적                               선택
─────────────────────────────────────────────────────
데이터 암호화 (복원 필요)
  키 공유 가능한 양쪽             → AES-256-GCM
  키 공유 불가, 공개키 방식 필요  → RSA 또는 ECC

인증·서명
  서버 인증서, JWT 서명           → RSA 또는 ECDSA

비밀번호 저장                      → bcrypt 또는 Argon2
파일·데이터 무결성 검증            → SHA-256
메시지 인증 (변조 방지)            → HMAC-SHA256
```

---

## 실제 HTTPS에서 셋이 함께 쓰이는 방식

```
1. 서버 인증서 검증    비대칭키 (RSA/ECC)    — "이 서버가 진짜인지 확인"
2. 세션 키 교환        비대칭키 (ECDH)       — "대칭키를 안전하게 공유"
3. 데이터 전송 암호화  대칭키 (AES)          — "실제 데이터를 빠르게 암호화"
4. 메시지 무결성       해시 (HMAC)           — "전송 중 변조되지 않았는지 확인"
```

비대칭키가 느리기 때문에 키 교환에만 쓰고,  
실제 데이터는 빠른 대칭키(AES)로 암호화하는 방식이다.

---

## 시리즈 마무리

```
1편  [[data/data-transformation-concepts|인코딩 · 암호화 · 해시 — 세 개념의 차이]]
2편  [[data/data-encoding-types|인코딩 유형 — 문자 인코딩, Base64, URL 인코딩]]
3편  (이 글) 암호화 유형 — 대칭키, 비대칭키, 해시 함수
```
