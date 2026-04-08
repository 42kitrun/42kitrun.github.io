---
title: "[신뢰할 수 있는 데이터 2편] 데이터 품질 — 측정 방법과 품질 정의서"
date: 2026-04-03
updated: 2026-04-03
tags:
  - data-quality
  - data-engineering
  - data-governance
  - data-management
  - measurement
  - fundamentals
  - database
  - standards
summary: "데이터 품질을 6가지 차원으로 측정하는 방법과, 팀이 공유하는 품질 정의서를 실무 수준으로 작성하는 방법을 정리한다"
devto: false
devto_id:
devto_url:
---

# [신뢰할 수 있는 데이터 2편] 데이터 품질 — 측정 방법과 품질 정의서

← [[data/data-governance-overview|1편: 데이터 거버넌스 — 전체 지형과 왜 필요한가]]

---

## 데이터 품질이란?

> "데이터가 의도한 목적에 맞게 사용될 수 있는 정도"

품질이 낮은 데이터로 만든 분석 결과는 잘못된 의사결정으로 이어진다.  
측정하지 않으면 개선할 수 없다.

---

## 6가지 품질 차원

```
데이터 품질 차원
│
├── 완전성 (Completeness)   — 있어야 할 데이터가 있는가?
├── 정확성 (Accuracy)       — 실제 값과 일치하는가?
├── 일관성 (Consistency)    — 시스템 간 값이 동일한가?
├── 적시성 (Timeliness)     — 필요한 시점에 사용 가능한가?
├── 유일성 (Uniqueness)     — 중복이 없는가?
└── 유효성 (Validity)       — 정의된 형식·범위 내에 있는가?
```

### 차원별 정의와 측정 방법

| 차원 | 측정 방법 | 예시 |
|------|-----------|------|
| 완전성 | `NULL 비율 = NULL 수 / 전체 행 수` | `phone_number` NULL이 3% 이하여야 함 |
| 정확성 | 신뢰할 수 있는 출처와 대조 | 주소가 실제 존재하는 주소인가? |
| 일관성 | 시스템 간 동일 키 값 비교 | CRM의 고객 등급 = DW의 고객 등급 |
| 적시성 | `지연 시간 = 현재 시각 - 최신 데이터 시각` | 주문 데이터는 30분 이내 반영 |
| 유일성 | `중복률 = 중복 행 수 / 전체 행 수` | `order_id` 중복 0% |
| 유효성 | 정규식·범위·목록 검증 | `email` 형식, `age` 0~150 범위 |

### SQL로 측정하기

```sql
-- 완전성: phone_number NULL 비율
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN phone_number IS NULL THEN 1 ELSE 0 END) AS null_count,
  ROUND(100.0 * SUM(CASE WHEN phone_number IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS null_pct
FROM customers;

-- 유일성: order_id 중복 여부
SELECT order_id, COUNT(*) AS cnt
FROM orders
GROUP BY order_id
HAVING COUNT(*) > 1;

-- 유효성: email 형식 검증 (BigQuery 예시)
SELECT COUNT(*) AS invalid_email_count
FROM users
WHERE NOT REGEXP_CONTAINS(email, r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
```

---

## 품질 정의서 (Data Quality Definition Document)

### 개요

품질 정의서는 "이 데이터는 이 기준을 만족해야 한다"는 **팀 공유 계약서**다.

```
역할
  Data Owner   → 비즈니스 기준 정의 ("고객 이메일은 반드시 있어야 한다")
  Data Steward → 기준을 문서화하고 측정 방법 작성
  Data Engineer → SQL·도구로 자동 검증 구현
```

코드 리뷰의 기준이 없으면 품질 편차가 생기듯,  
데이터도 측정 기준 없이는 "좋다/나쁘다"를 판단할 수 없다.

### 품질 정의서 구조

```yaml
# 품질 정의서 예시: orders 테이블

table: orders
domain: 커머스
owner: 커머스 데이터 팀
steward: 홍길동
last_updated: 2026-04-03

rules:
  - id: QR-001
    column: order_id
    dimension: uniqueness
    rule: "중복 없음"
    threshold: 0%
    severity: critical       # critical / warning / info

  - id: QR-002
    column: user_id
    dimension: completeness
    rule: "NULL 허용 안 됨"
    threshold: 0%
    severity: critical

  - id: QR-003
    column: order_amount
    dimension: validity
    rule: "0보다 커야 함"
    threshold: 0%
    severity: critical

  - id: QR-004
    column: created_at
    dimension: timeliness
    rule: "파이프라인 실행 후 30분 이내 반영"
    threshold: 30min
    severity: warning
```

### 실무 작성 가이드

**1. 컬럼 우선순위 결정**
```
모든 컬럼에 규칙을 쓰면 유지 비용이 너무 크다.

  핵심 컬럼 (항상 문서화)
    - PK, FK
    - 분석에 자주 쓰이는 지표 컬럼
    - PII 포함 컬럼

  선택 컬럼 (필요 시 추가)
    - 비즈니스 로직에 따라 판단
```

**2. severity 기준 정의**

| 등급 | 의미 | 조치 |
|------|------|------|
| critical | 즉시 중단 필요 | 파이프라인 실패 처리, 알림 |
| warning | 확인 필요 | 슬랙 알림, 다음날 검토 |
| info | 참고용 | 대시보드 표시만 |

**3. 임계값(threshold) 설정**

```
처음부터 너무 엄격하게 잡으면 알림이 너무 많아진다.
현재 데이터의 실제 상태를 먼저 측정하고,
목표 임계값을 단계적으로 조여나가는 방식이 현실적이다.

  1단계: 현재 상태 측정 (예: NULL 7%)
  2단계: 목표 설정 (예: 3개월 후 5% 이하)
  3단계: 원인 분석 후 파이프라인 개선
  4단계: 임계값 재설정 (예: 2% 이하)
```

### 유효성 검증 자동화

dbt를 쓰는 환경에서는 `schema.yml`로 품질 정의서를 코드화할 수 있다.

```yaml
# models/schema.yml (dbt)
models:
  - name: orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null

      - name: order_amount
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              inclusive: false

      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
```

```bash
# CI/CD에서 자동 실행
dbt test --select orders
```

품질 정의서(YAML)와 dbt 테스트를 동기화하면,  
문서와 실제 검증이 분리되지 않는다.

---

## 품질 점수 계산 예시

팀 내 공통 품질 점수를 만들어 대시보드에 표시할 수 있다.

```
테이블 품질 점수 = (통과 규칙 수 / 전체 규칙 수) × 100

예시:
  orders 테이블 규칙: 10개
  통과: 9개 (QR-003 유효성 실패)
  품질 점수: 90점
```

---

## 다음 글

데이터 품질을 관리하려면 데이터가 어디 있고 어떻게 흘러오는지 알아야 한다.

→ [[data/data-catalog-lineage|3편: 데이터 카탈로그와 계보 — 실무 도구]]
