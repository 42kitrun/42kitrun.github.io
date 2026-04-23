---
title: Reverse ETL과 Data Mart — 데이터를 현업으로 되돌리는 법
date: '2026-04-11'
updated: '2026-04-11'
tags:
  - reverse-etl
  - data-mart
  - etl
  - data-warehouse
  - data-pipeline
  - data-engineering
  - analytics
  - crm
  - marketing
  - data-integration
  - operational-analytics
related_projects: []
summary: 데이터 웨어하우스에 쌓인 분석 결과를 현업 툴로 되돌려 보내는 Reverse ETL과, 용도별로 데이터를 분리 저장하는 Data Mart의 개념과 관계를 정리한다
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# Reverse ETL과 Data Mart — 데이터를 현업으로 되돌리는 법

_written by Claude-Code_

## 전체 그림부터

```
원천 데이터                  분석 계층                    현업 도구
──────────                  ──────────                  ──────────
 DB / API                     ETL →                    (분석가만 봄)
 로그 / SaaS   ──────────→   Data Warehouse
                              │
                              ├── Data Mart (영업)  ──→  Salesforce
                              ├── Data Mart (마케팅) ──→  Google Ads
                              └── Data Mart (CS)    ──→  Intercom
                                       ↑
                              Reverse ETL이 이 화살표를 담당
```

**ETL** 은 데이터를 모으는 방향,  
**Reverse ETL** 은 분석 결과를 현업으로 *내보내는* 방향이다.

---

## Data Mart란?

Data Warehouse가 회사 전체 데이터를 담는 **큰 창고**라면,  
Data Mart는 특정 팀을 위해 덜어낸 **작은 창고**다.

```
Data Warehouse (전체)
│
├── Marketing Mart  → 캠페인 성과, 고객 세그먼트
├── Sales Mart      → 파이프라인, 거래 이력
└── Finance Mart    → 비용, 매출, 예산
```

### 왜 쓰는가?

| 문제 | Data Mart의 역할 |
|------|-----------------|
| Warehouse 쿼리가 느림 | 필요한 데이터만 추려 빠르게 |
| 팀마다 데이터 정의가 다름 | 팀 기준으로 미리 가공해 일관성 확보 |
| 분석가가 아닌 팀원도 써야 함 | 단순한 구조로 접근 장벽 낮춤 |

---

## Reverse ETL이란?

Data Warehouse(또는 Data Mart)의 분석 결과를 **운영 SaaS 툴에 자동 동기화**하는 파이프라인이다.

### 핵심 흐름

```
[Data Mart: 마케팅]
  쿼리: "최근 30일 내 장바구니 이탈 고객"
       ↓  (Reverse ETL)
  Google Ads → 이탈 고객 타겟 광고 자동 집행
  Braze      → 이탈 복구 이메일 자동 발송
```

### ETL vs Reverse ETL

```
ETL          원천 시스템  →  Data Warehouse   (데이터 수집)
Reverse ETL  Data Warehouse  →  운영 툴       (데이터 활성화)
```

---

## 실제 사용 예시

| 팀 | Data Mart 활용 | Reverse ETL 목적지 |
|----|----------------|-------------------|
| 영업 | 고객 구매 이력, 등급 | Salesforce CRM |
| 마케팅 | 이탈 고객, 고가치 세그먼트 | Google Ads, Meta Ads |
| CS | 위험 고객 (churn risk) | Intercom, Zendesk |

---

## 두 개념의 관계

```
Data Mart  =  "무엇을 보낼지" 결정하는 계층
Reverse ETL =  "어떻게 보낼지" 실행하는 파이프라인
```

Data Mart 없이 Reverse ETL만 쓰면 Warehouse 전체를 직접 쿼리하게 되어 비용·속도 문제가 생긴다.  
둘을 함께 쓰는 것이 일반적인 패턴이다.

---

## 대표 툴

| 역할 | 툴 |
|------|----|
| Data Warehouse | Snowflake, BigQuery, Redshift |
| Data Mart 구축 | dbt (SQL 변환·모델링) |
| Reverse ETL | Census, Hightouch |
| ETL (수집) | Fivetran, Airbyte |

---

## 관련 글

- [[data/data-governance-overview|데이터 거버넌스란?]]
- [[data/data-catalog-lineage|데이터 카탈로그와 데이터 리니지]]
- [[data/data-quality-measurement|데이터 품질 측정]]
