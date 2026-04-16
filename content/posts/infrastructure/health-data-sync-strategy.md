---
title: 의료 데이터 동기화 설계 전략 — Local-First에서 서버 동기화까지
date: 2026-04-17
updated: 2026-04-17
tags:
  - sync
  - sync-queue
  - local-first
  - offline-first
  - last-write-wins
  - eventual-consistency
  - idempotency
  - exponential-backoff
  - conflict-resolution
  - real-time
  - opportunistic-sync
  - retry
  - throttle
  - mobile
  - healthcare
  - database
  - data-integrity
  - distributed-systems
summary: "로컬 우선 저장 구조에서 서버 동기화를 구현할 때 필요한 전략, 충돌 해결, 신뢰성 보장 방법을 체계적으로 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# 의료 데이터 동기화 설계 전략 — Local-First에서 서버 동기화까지

_written by Claude-Code_

## 배경

건강/의료 데이터는 보안 특성상 실기기 로컬 스토리지에 우선 저장한다. 오프라인 환경에서도 기록이 끊기지 않아야 하고, 서버 장애가 앱 사용 자체를 막아서는 안 된다.

그런데 데이터 복구, 담당 의료진 화면 연계, 확장 서비스를 위해서는 서버 DB와의 동기화가 필요하다. 이 Local-First + 서버 동기화 구조를 설계할 때 답해야 할 질문은 세 가지다.

```
언제 보낼 것인가?          →  동기화 전략
어떻게 관리할 것인가?      →  큐와 상태 관리
실패·충돌 시 어떻게 할까?  →  신뢰성 보장
```

---

## 1. 동기화 전략: 언제 보낼 것인가?

### 즉시 Sync (Real-time)

저장 즉시 서버로 전송한다. 서버 상태가 항상 최신을 유지하지만, 네트워크가 없으면 실패한다. 이 실패는 fallback queue가 흡수한다.

```
[사용자 입력]
     ↓
[로컬 저장] → [즉시 서버 전송] → 성공
                    ↓ 실패
             [fallback queue] → 다음 기회에 재시도
```

### Opportunistic Sync (기회적 동기화)

네트워크 상태와 배터리를 감지해 조건이 충족될 때 전송한다. 배터리·데이터 요금이 민감한 모바일 환경에서 기본 전략으로 쓰인다.

```
[데이터 누적]
     ↓
[네트워크·배터리 감지]
     ├── 조건 충족 → 전송
     └── 조건 미충족 → 대기
```

### Priority Sync (강제 전송)

진료 예약, 응급 이벤트처럼 반드시 즉시 전달해야 하는 상황에 적용한다. throttle 제한 무시, 재시도 횟수 제한 없음, 배터리 최적화 예외 — 세 조건을 모두 해제한다.

---

| 전략 | 트리거 | 특징 |
|------|--------|------|
| 즉시 sync | 저장 즉시 | 최신 상태 유지. 실패 시 fallback으로 |
| Opportunistic | 네트워크·배터리 감지 | 모바일 최적화. 지연 허용 |
| Priority sync | 중요 이벤트 | 모든 제한 해제. 무조건 전송 |

---

## 2. 동기화 큐: 어떻게 관리할 것인가?

### Sync Queue

전송 대기 중인 데이터를 순서대로 관리하는 구조다. 전송 실패가 데이터 유실로 이어지지 않도록 보장하는 것이 핵심 역할이다.

```
[로컬 DB]
  ├── records        ← 실제 데이터
  └── sync_queue     ← 전송 대기열
       ├── id                큐 항목 식별자
       ├── record_id         대상 레코드
       ├── operation         CREATE / UPDATE / DELETE
       ├── status            pending → sending → done / failed
       ├── idempotency_key   중복 방지 키
       ├── retry_count       재시도 횟수
       └── created_at        생성 시각
```

### 상태 관리

큐의 각 항목은 로컬과 서버 간 불일치 유형에 따라 세 가지 상태로 구분한다.

| 상태 | 의미 | 처리 |
|------|------|------|
| `pending push` | 로컬에 있고 서버에는 없음 | 서버로 전송 |
| `deleted_pending` | 로컬에서 삭제했지만 서버에 아직 남음 | 서버에 DELETE 전송 |
| `pending pull` | 서버에 더 최신 버전이 있음 | 서버에서 로컬로 갱신 |

`deleted_pending`은 특히 놓치기 쉽다. 오프라인 중 삭제한 데이터가 온라인 복귀 후에도 서버에 그대로 남을 수 있다.

```
[오프라인 중 삭제] → status: deleted_pending
        ↓
[온라인 복귀] → 서버에 DELETE 전송 → status: done
```

---

## 3. 충돌 해결: 같은 데이터가 양쪽에서 수정되면?

오프라인 중 로컬과 서버 양쪽에서 동일 데이터가 수정되면 **충돌(conflict)** 이 발생한다. 세 가지 전략으로 대응한다.

### Last Write Wins (LWW)

타임스탬프가 더 최신인 쪽이 이긴다. 구현이 단순하고 빠르다.

```
로컬: 혈압 120/80  (09:00 수정)
서버: 혈압 130/85  (09:05 수정)
→ 서버 데이터 채택
```

단, 기기 간 시계 오차(clock skew)로 비교가 어긋날 수 있다. 의미 있는 로컬 수정이 조용히 덮어쓰이는 것도 주의해야 한다.

### Conflict Resolver

자동 병합이 가능하면 병합하고, 불가능하면 사용자가 선택한다. 두 측정값 모두 임상적 의미가 있는 의료 데이터에 적합하다.

```
충돌 감지
     ↓
자동 병합 가능?
     ├── YES → 병합 규칙 적용 (두 측정값을 모두 기록)
     └── NO  → 사용자에게 선택 요청
```

### Eventual Consistency

모든 노드가 즉시 같은 상태일 필요는 없다. 시간이 지나면 결국 일치한다는 보장만 제공한다.

```
기기 A ─── 업데이트 ───┐
기기 B ─── 업데이트 ───┤ → [서버] → 최종 일치
서버  ──────── sync ───┘
```

히스토리 기록(시계열 측정값)은 eventual consistency로 처리해도 된다. 반면 현재 처방, 알레르기 정보는 즉각 정합성이 필요하다.

---

## 4. 신뢰성 보장: 실패와 중복을 어떻게 처리할 것인가?

### Idempotency (멱등성)

같은 요청을 여러 번 보내도 결과가 같아야 한다. 네트워크 타임아웃으로 응답을 못 받고 재전송할 때 중복 저장이 발생하는 문제를 `idempotency_key`로 막는다.

```
요청 1: { key: "abc-123", 혈압: 120/80 } → 저장
요청 2: { key: "abc-123", 혈압: 120/80 } → 중복 무시, 기존 응답 반환
```

키는 `UUID v4` 또는 `{user_id}_{record_id}_{timestamp}` 조합으로 생성한다.

### Retry + Exponential Backoff

실패 직후 즉시 재시도하면 서버에 부담이 몰린다. 재시도 간격을 지수적으로 늘린다.

```
1회 실패 →  1초 후
2회 실패 →  2초 후
3회 실패 →  4초 후
4회 실패 →  8초 후
5회 실패 → 16초 후
최대 횟수 초과 → 수동 처리 대기열로 이동
```

여기에 Jitter(무작위 지연)를 추가하면 여러 기기가 동시에 재시도하는 thundering herd도 방지할 수 있다.

### Throttle

앱 재시작 시 쌓인 pending 항목이 한꺼번에 전송되면 서버가 부담을 받는다. 초당 요청 수를 제한해 안정적으로 처리한다.

```
[pending 100개] → throttle: 5req/s → 서버 안정 처리
```

Priority Sync는 이 throttle을 우선순위에 따라 건너뛴다.

---

## 전체 흐름

```
[사용자 입력]
     ↓
[로컬 저장 + idempotency_key 생성]
     ↓
[sync_queue: pending push 추가]
     ↓
     ├── 즉시 sync → 전송 시도
     │     ├── 성공 → done
     │     └── 실패 → fallback queue → exponential backoff retry
     ├── Opportunistic → 조건 충족 시 전송
     └── Priority → throttle 무시, 즉시 강제 전송
     ↓
[서버 응답]
     ├── 충돌 없음 → 완료
     └── 충돌 있음 → LWW 또는 Conflict Resolver
     ↓
[pending pull 있으면]
     └── 서버 최신 데이터로 로컬 갱신
```

---

## 정리

| 분류 | 전략 | 역할 |
|------|------|------|
| **언제** | 즉시 sync | 기본 전송. 실패 시 fallback |
| **언제** | Opportunistic sync | 모바일 환경 최적화 |
| **언제** | Priority sync | 중요 이벤트 강제 전송 |
| **언제** | fallback queue | 즉시 실패 시 안전망 |
| **무엇** | Sync Queue | 전송 대기열 전체 관리 |
| **무엇** | pending push/pull | 로컬-서버 불일치 추적 |
| **무엇** | deleted_pending | 삭제 이벤트 전달 보장 |
| **충돌** | LWW | 빠른 충돌 해결 |
| **충돌** | Conflict Resolver | 의미 있는 데이터 보호 |
| **충돌** | Eventual Consistency | 가용성 우선 설계 |
| **실패** | Idempotency | 중복 저장 차단 |
| **실패** | Exponential Backoff | 서버 부담 없는 재시도 |
| **실패** | Throttle | 요청 폭주 방지 |

Local-First 구조에서 동기화는 부가 기능이 아니다. 데이터 정합성과 사용자 신뢰의 기반이다. 각 전략은 독립적으로 존재하지 않고 서로 맞물린다. 특히 [[privacy-policy-healthcare|의료 데이터 개인정보]] 처럼 정확성이 중요한 도메인에서는 어느 한 요소도 생략해서는 안 된다.
