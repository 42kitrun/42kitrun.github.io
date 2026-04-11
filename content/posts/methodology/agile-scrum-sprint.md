---
title: Agile, Scrum, Sprint란?
date: 2026-04-11
updated: 2026-04-11
tags:
  - agile
  - scrum
  - sprint
  - methodology
  - software-development
  - product-management
  - team-workflow
  - backlog
  - retrospective
  - kanban
summary: "Agile은 철학, Scrum은 프레임워크, Sprint는 실행 단위 — 세 가지 개념의 관계와 핵심을 한눈에 정리"
devto: false
devto_id:
devto_url:
---

# Agile, Scrum, Sprint란?

## 한 문장 요약

**Agile은 "철학", Scrum은 "방법론", Sprint는 "실행 단위" — 러시아 마트료시카처럼 안에 들어있다**

---

## 전체 구조

```
Agile (철학)
  └── Scrum (프레임워크)
        └── Sprint (반복 주기)
              ├── Planning
              ├── Daily Scrum
              ├── Review
              └── Retrospective
  └── Kanban (또 다른 프레임워크)
```

---

## Agile

기존 **폭포수(Waterfall)** 방식 — 요구사항 → 설계 → 개발 → 배포를 순서대로만 진행 — 의 한계를 극복하려고 등장한 **개발 철학**.

```
폭포수:  요구사항 → 설계 → 개발 → 테스트 → 배포  (6개월~수년)
Agile:   [짧은 주기로 반복] → 피드백 → 개선 → 반복  (1~4주)
```

### 핵심 가치 (2001년 Agile Manifesto)

| 더 중요하게 여기는 것 | vs | 덜 중요한 것 |
|---|---|---|
| 개인과 상호작용 | vs | 프로세스와 도구 |
| 작동하는 소프트웨어 | vs | 포괄적인 문서 |
| 고객과의 협력 | vs | 계약 협상 |
| 변화에 대응 | vs | 계획 따르기 |

> 오른쪽이 가치 없는 게 아니라, **왼쪽을 더 우선**한다는 뜻

---

## Scrum

Agile을 현실에서 실천하는 가장 대표적인 **프레임워크**.

### 역할

| 역할 | 역할 설명 |
|---|---|
| **Product Owner** | 무엇을 만들지 결정, Backlog 우선순위 관리 |
| **Scrum Master** | 팀이 Scrum을 잘 따르도록 지원, 장애물 제거 |
| **Dev Team** | 실제 개발 |

### 산출물

```
Product Backlog      →  전체 기능 목록 (우선순위 정렬)
Sprint Backlog       →  이번 Sprint에서 할 작업
Increment            →  Sprint 완료 후 동작하는 결과물
```

---

## Sprint

**고정된 기간(보통 2주) 안에 목표를 정하고, 개발하고, 결과를 내는 반복 사이클**

```
┌─────────────────────────────────────────────────────┐
│                   Sprint (1~4주)                    │
│                                                     │
│  Planning → 개발 → Review → Retrospective           │
│     ↑                                     │         │
│     └─────────── 다음 Sprint ─────────────┘         │
└─────────────────────────────────────────────────────┘
```

### Sprint 4단계

**1. Sprint Planning (시작)**
- 이번 Sprint에서 무엇을 만들지 팀 전체가 결정
- Product Backlog에서 작업을 꺼내 Sprint Backlog 구성

**2. Daily Scrum (매일 15분)**
- 어제 무엇을 했나?
- 오늘 무엇을 할 것인가?
- 장애물이 있는가?

**3. Sprint Review (종료 후 시연)**
- 만든 결과물을 이해관계자에게 시연
- 고객 피드백 수집

**4. Retrospective (팀 내부 회고)**
- 잘된 점 / 개선할 점 논의
- 다음 Sprint에 반영

---

## 핵심 용어

| 용어 | 정의 |
|---|---|
| **Product Backlog** | 만들어야 할 기능 전체 목록 |
| **User Story** | "나는 [사용자]로서 [목적]을 위해 [기능]이 필요하다" |
| **Story Point** | 작업의 상대적 복잡도 단위 (시간 아님) |
| **Velocity** | 팀이 Sprint마다 완료하는 평균 Story Point |
| **Definition of Done** | 팀이 합의한 "완료" 기준 |
| **Kanban** | Sprint 없이 지속적 흐름으로 작업 관리하는 방식 |

---

## Scrum vs Kanban

```
Scrum:   ├── Sprint 단위 작업  ├── 역할 구분 명확  ├── 주기적 계획 필수
Kanban:  ├── 연속 흐름 방식    ├── 역할 구분 유연  ├── 보드만으로 관리
                                                      (To Do → Doing → Done)
```

> 팀 특성에 맞게 선택 또는 혼합해서 사용

---

## 🔗 관련 개념

- [[cs/software-architecture-terms|소프트웨어 아키텍처 용어 정리]]
- [[infrastructure/dev-vs-production-environment|개발 환경 vs 프로덕션 환경]]
