---
title: "[신뢰할 수 있는 데이터 3편] 데이터 카탈로그와 계보 — 실무 도구"
date: 2026-04-03
updated: 2026-04-03
tags:
  - data-catalog
  - data-lineage
  - data-engineering
  - data-governance
summary: "데이터 카탈로그와 계보(Lineage)가 무엇인지 이해하고, 실무에서 쓰이는 도구를 선택 기준과 함께 비교한다"
devto: false
devto_id:
devto_url:
---

# [신뢰할 수 있는 데이터 3편] 데이터 카탈로그와 계보 — 실무 도구

← [[data-quality-measurement|2편: 데이터 품질 — 측정 방법과 품질 정의서]]

---

## 왜 필요한가?

```
"이 테이블이 뭘 담고 있지?"              → 데이터 카탈로그
"이 숫자가 어디서 온 건지 추적하고 싶다" → 데이터 계보 (Lineage)
"upstream이 바뀌면 어디가 영향받지?"     → 데이터 계보 (Impact Analysis)
```

거버넌스 정책을 만들고, 품질 기준을 세워도,  
**데이터가 어디 있고 어떻게 흘러오는지** 모르면 실무에서 적용할 수 없다.

---

## 데이터 카탈로그

### 정의

> 조직이 보유한 데이터 자산의 **메타데이터 목록**

도서관의 카드 목록 시스템과 같다.  
"어떤 책이 있는가"가 아니라 "어떤 데이터가 있고, 누가 관리하고, 어떻게 쓰는가"를 담는다.

### 카탈로그가 담는 것

```
데이터 카탈로그
│
├── 기술적 메타데이터
│   - 테이블명, 컬럼명, 데이터 타입
│   - 파티션 정보, 저장 위치, 크기
│
├── 비즈니스 메타데이터
│   - 한국어 설명, 비즈니스 용어 연결
│   - Data Owner, Data Steward
│   - 도메인 분류 (커머스, 마케팅, ...)
│
├── 운영 메타데이터
│   - 마지막 업데이트 시각
│   - 행 수, 파이프라인 실행 이력
│
└── 사용 메타데이터
    - 자주 쿼리하는 사용자
    - 연관 대시보드·리포트
```

---

## 데이터 계보 (Data Lineage)

### 정의

> 데이터가 **어디서 생성되어, 어디를 거쳐, 어디에 도달하는가**를 추적하는 것

```
원천 데이터 (Source)
    │
    ▼
[ETL / dbt 변환]
    │
    ▼
데이터 웨어하우스 (DW)
    │
    ├──→ 마트 테이블 A
    │        │
    │        └──→ 대시보드 (매출 리포트)
    │
    └──→ 마트 테이블 B
             │
             └──→ ML 피처 스토어
```

### 계보가 중요한 이유

**1. 장애 원인 추적 (Root Cause Analysis)**
```
"매출 대시보드 숫자가 어제와 다르다"
  → 마트 테이블 A 확인
  → upstream orders 테이블에서 NULL 급증
  → 어제 배포된 주문 API 버그 확인
```

**2. 영향 분석 (Impact Analysis)**
```
"orders 테이블 스키마를 바꾸면 어디가 영향받는가?"
  → Lineage 조회 → 영향받는 하위 테이블 15개 목록 확인
  → 수정 전 영향 범위 파악 가능
```

---

## 실무 도구 비교

### 오픈소스

| 도구 | 강점 | 약점 | 적합한 환경 |
|------|------|------|-------------|
| **DataHub** (LinkedIn) | Lineage 강함, API 풍부 | 초기 설치 복잡 | 대규모 데이터 팀 |
| **Apache Atlas** | Hadoop 생태계 통합 | UI 불편, 학습 곡선 높음 | Hadoop/Hive 중심 조직 |
| **Amundsen** (Lyft) | 검색 UI 직관적 | Lineage 기능 약함 | 검색 중심 카탈로그 필요 시 |
| **OpenMetadata** | 올인원, 현대적 UI | 비교적 신생 도구 | 빠르게 도입하려는 팀 |

### 상용 (SaaS)

| 도구 | 강점 | 적합한 환경 |
|------|------|-------------|
| **Alation** | 자동 메타데이터 수집, 검색 강함 | 비용 감수 가능한 엔터프라이즈 |
| **Collibra** | 거버넌스 워크플로 강함 | 규정 준수(Compliance) 중심 조직 |
| **Atlan** | 현대적 UX, dbt 통합 | 클라우드 네이티브 데이터 팀 |

### dbt 사용 환경이라면

```
dbt 자체에서 컬럼 레벨 Lineage 제공

  dbt docs generate && dbt docs serve
  → 로컬에서 DAG + Lineage 시각화
```

```
[raw.orders] → [stg_orders] → [fct_orders] → [mart_revenue]
                                                    │
                                             [rpt_daily_sales]
```

별도 도구 없이 dbt만으로 시작할 수 있다.

---

## 도구 선택 기준

```
Step 1: 팀 규모 확인
  1~5명 데이터 팀  → dbt docs 또는 OpenMetadata
  5~20명           → DataHub 또는 Atlan
  20명+            → 상용 도구 검토 (Alation, Collibra)

Step 2: 스택 확인
  dbt 사용         → dbt docs → DataHub dbt integration
  Spark/Hadoop     → Apache Atlas
  Snowflake/BigQuery → Atlan, DataHub

Step 3: 우선순위 확인
  검색이 중요       → Amundsen, Alation
  Lineage가 중요    → DataHub
  거버넌스 워크플로 → Collibra
```

---

## 도입 순서 (실용적 접근)

한 번에 모든 걸 구축하려 하면 실패한다.

```
1단계 (1~2주)
  dbt schema.yml에 description 채우기
  → dbt docs로 팀 내 공유
  → 비용 0, 즉시 시작 가능

2단계 (1~2개월)
  핵심 도메인 Data Owner 지정
  비즈니스 용어 사전 20~30개 항목 작성
  → 별도 도구 없이 Notion/Confluence로 시작 가능

3단계 (3~6개월)
  DataHub 또는 OpenMetadata 도입
  자동 메타데이터 수집 파이프라인 구성
  품질 지표 카탈로그에 연동
```

---

## 시리즈 정리

```
1편  데이터 거버넌스    "무엇을, 누가, 어떻게 관리할지 규칙을 만든다"
2편  데이터 품질        "데이터가 기준을 만족하는지 측정하고 문서화한다"
3편  카탈로그·계보      "데이터가 어디 있고 어떻게 흘러오는지 추적한다"
```

세 가지는 독립된 주제가 아니라 서로 맞물린다.  
거버넌스 정책 → 품질 기준 정의 → 카탈로그에 기록 → 계보로 영향 추적.  
이 순환이 신뢰할 수 있는 데이터 환경을 만든다.
