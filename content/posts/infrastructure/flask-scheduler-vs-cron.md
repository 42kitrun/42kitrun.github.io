---
title: Flask 스케줄링 Extension vs Cron — 무엇을 선택해야 할까?
date: '2026-04-12'
updated: '2026-04-26'
tags:
  - flask
  - python
  - scheduler
  - cron
  - apscheduler
  - flask-apscheduler
  - background-jobs
  - celery
  - task-queue
  - web-framework
  - backend
  - devops
  - infrastructure
  - performance
  - process-management
  - nowinseoul
related_projects:
  - nowinseoul
summary: Flask-APScheduler 같은 In-Process 스케줄러와 시스템 Cron의 동작 방식, 장단점, 리소스·운영 차이를 핵심 위주로 비교한다.
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---

# Flask 스케줄링 Extension vs Cron — 무엇을 선택해야 할까?

_written by Claude-Code_

Flask 앱에서 주기적 작업(배치, 알림, 정리 작업 등)을 구현할 때 크게 두 가지 선택지가 있다.

- **In-Process 방식**: Flask-APScheduler 등 앱 내부에 스케줄러를 품는 방식
- **Out-of-Process 방식**: 시스템 cron이 별도 프로세스로 작업을 실행하는 방식

---

## 동작 구조

### Flask-APScheduler (In-Process)

```
┌──────────────────────────────────────────┐
│           Flask 프로세스                  │
│                                          │
│   [HTTP 요청 처리]   [APScheduler]        │
│         ↕                 ↓              │
│   [View / Logic]    [Job Thread Pool]    │
│         └──────────────── ↓              │
│                     [DB / 외부 API]       │
└──────────────────────────────────────────┘
```

- Flask 앱이 살아있는 동안 스케줄러도 함께 동작
- 앱과 **같은 메모리 공간**, **같은 DB 연결 풀** 사용
- 스케줄 정보를 코드 또는 DB에서 동적으로 관리 가능

### Cron (Out-of-Process)

```
┌────────────┐        ┌─────────────────────────┐
│  cron 데몬  │ 트리거  │  python script.py       │
│  (OS 내장) │ ──────▶│  (새 프로세스 생성/종료)  │
└────────────┘        └─────────────────────────┘
                               ↓
                        [DB / 외부 API]

* Flask 앱과 완전히 분리된 독립 프로세스
```

- OS가 지정한 시각에 스크립트를 **새 프로세스로 실행 후 종료**
- Flask 앱이 꺼져 있어도 동작
- 실행 간격은 crontab 표현식으로만 설정

---

## 핵심 비교

| 항목 | Flask-APScheduler | Cron |
|------|:-----------------:|:----:|
| 실행 위치 | Flask 프로세스 내부 | 별도 프로세스 |
| Flask 앱 의존성 | 앱이 살아있어야 동작 | 앱과 무관하게 동작 |
| 스케줄 표현 | Interval / Cron / Date | Cron 표현식만 |
| 동적 스케줄 변경 | 코드/DB로 런타임 변경 가능 | crontab 파일 직접 수정 |
| 실패 감지 | 앱 로그에 통합 | 별도 로그 확인 필요 |
| 다중 서버 (수평 확장) | 중복 실행 발생 ⚠️ | 전용 서버 1대에서만 실행 |
| 배포 복잡도 | 낮음 (앱과 함께 배포) | 서버 접근 + crontab 등록 필요 |
| 컨테이너 (Docker) | 자연스럽게 통합 | 별도 설정 필요 |

---

## 성능 / 리소스 차이

### Flask-APScheduler
- Flask 프로세스 메모리 안에서 **백그라운드 스레드**로 실행
- 작업 실행 중 Flask 앱의 메모리·CPU 사용량 증가
- 잡이 많거나 오래 걸리면 HTTP 응답 속도에 **간접 영향** (스레드 풀 경쟁)
- 앱 재시작 시 실행 중이던 잡은 **유실**

### Cron
- 지정 시각에만 프로세스 생성 → 평소 리소스 소모 **없음**
- 실행마다 Python 인터프리터 초기화 비용 발생 (수초 단위 오버헤드)
- 작업이 길어져도 Flask 앱에 **전혀 영향 없음**
- 이전 잡이 끝나기 전에 다음 실행 시각이 오면 **중복 실행** 발생 가능

---

## 다중 서버 환경에서의 문제

수평 확장(서버 3대) 시 두 방식의 동작이 크게 달라진다.

```
[서버 1] Flask + APScheduler  ─┐
[서버 2] Flask + APScheduler  ─┼─▶ 같은 잡 3번 실행 ⚠️ (중복 실행)
[서버 3] Flask + APScheduler  ─┘

[서버 1] Flask  ┐
[서버 2] Flask  ├─ HTTP만 처리
[서버 3] Flask  ┘
[별도 서버] cron ──▶ 잡 1번 실행 ✅
```

APScheduler는 다중 서버에서 중복 실행을 막으려면 **JobStore를 Redis/DB로 설정**하거나 별도 락 처리가 필요하다.

---

## 언제 무엇을 쓸까?

| 상황 | 추천 |
|------|------|
| 단일 서버, 빠른 개발 | Flask-APScheduler |
| 작업 스케줄을 UI/DB에서 동적으로 변경 | Flask-APScheduler |
| 컨테이너(Docker) 단일 인스턴스 배포 | Flask-APScheduler |
| 다중 서버(수평 확장) 환경 | Cron (전용 worker 서버) |
| 작업이 무거워 앱에 영향 주면 안 됨 | Cron 또는 Celery |
| 앱이 꺼져도 잡이 실행돼야 함 | Cron |
| 복잡한 의존 작업 / 재시도 / 모니터링 필요 | Celery Beat |

---

## 요약

> **Flask-APScheduler** → 빠르고 편하지만 앱 생사에 종속, 수평 확장 시 주의  
> **Cron** → 독립적이고 견고하지만 동적 변경이 불편하고 컨테이너 환경에서 번거로움

운영 규모가 커지거나 재시도·모니터링이 중요해지면 **Celery + Celery Beat** 도입을 검토할 시점이다.

---

## 관련 글

- [[infrastructure/dev-vs-production-environment|개발 환경 vs 프로덕션 환경, 무엇이 다른가?]]
