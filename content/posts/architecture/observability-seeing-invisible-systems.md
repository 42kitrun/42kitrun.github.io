---
title: "Observability: 보이지 않는 시스템을 보는 기술"
date: 2026-06-23
updated: 2026-06-23
tags:
  - observability
  - logs
  - metrics
  - traces
  - monitoring
  - system-debugging
  - distributed-systems
  - performance-analysis
  - real-time-monitoring
  - system-design
  - infrastructure
  - microservices
  - troubleshooting
related_projects: []
summary: 시스템이 커질수록 내부가 보이지 않는 문제를 해결하는 관측 가능성(Observability) 개념과 로그, 메트릭, 트레이스 3가지 기둥을 통해 복잡한 시스템을 이해하는 방법.
ai_agent: Claude-Code, ChatGPT
devto: false
devto_id:
devto_url:
---

# Observability: 보이지 않는 시스템을 보는 기술

_written by Claude-Code,ChatGPT_

## 미지의 시스템을 만날 때: 문제는 보이지 않는다

[[understanding-complex-systems|우리는 미지의 시스템을 어떻게 이해하는가]]에서 다루었듯이, 복잡한 시스템을 처음 대면할 때 가장 먼저 부닥치는 문제는 **시스템의 내부 동작이 보이지 않는다**는 것이다.

단순한 CRUD 애플리케이션이라면 요청이 들어오고, 데이터베이스에 쿼리를 날리고, 응답을 반환한다. 흐름이 명확하고 추적하기 쉽다. 하지만 마이크로서비스, 분산 트랜잭션, 비동기 처리가 섞인 시스템은 어떨까?

```
클라이언트 요청
  ↓
API Gateway
  ├→ User Service (DB 접근 + 캐시)
  ├→ Order Service (Message Queue)
  │   ├→ Payment Service (외부 API)
  │   └→ Notification Service
  └→ Analytics Service (Kafka)
```

요청 하나가 여러 서비스를 거쳐 간다. 어느 단계에서 지연이 발생했는지, 어디서 에러가 났는지, 왜 일부 요청은 빠르고 일부는 느린지 알 수 없다. 로그를 뒤져봐도 어느 서비스의 로그를 봐야 하는지 모른다. 이것이 **검은 상자 문제(Black Box Problem)** 다.

---

## Observability란 무엇인가

**Observability(관측 가능성)**은 시스템의 외부 출력만 보고도 내부 상태를 추론할 수 있는 능력을 의미한다.

제어 이론에서 출발한 개념인데, DevOps 엔지니어 Charity Majors가 처음 소프트웨어에 적용했다. 그 핵심 정의는 이렇다:

> **시스템이 생성하는 데이터(로그, 메트릭, 트레이스)로부터 임의의 질문에 답할 수 있는 능력**

Monitoring(모니터링)과 자주 혼동되는데, 둘은 다르다.

| 구분 | Monitoring | Observability |
|------|-----------|----------------|
| **정의** | 정해진 지표를 정기적으로 확인 | 임의의 질문에 답할 수 있는 능력 |
| **질문** | "CPU는 80% 이상인가?" | "왜 이 사용자의 요청이 느린가?" |
| **데이터** | 미리 정의된 지표 | 모든 관련 데이터 |
| **대응** | 알람 기반 반응 | 근본 원인 파악 |

Monitoring은 대증 요법이고, Observability는 근본 치료다.

![Observability의 3가지 기둥과 특징](/assets/posts/architecture/observability-seeing-invisible-systems/observability.png)

---

## Observability의 3가지 기둥

Observability는 세 종류의 데이터로 구성된다.

### 1. Logs (로그)

로그는 **특정 시점에 발생한 이벤트의 기록**이다.

```
2026-06-23 10:15:42.123 [order-service] INFO: Order created: order_id=12345, user_id=789
2026-06-23 10:15:42.456 [payment-service] DEBUG: Calling Stripe API: amount=99.99
2026-06-23 10:15:42.789 [payment-service] ERROR: Stripe API timeout after 5s
2026-06-23 10:15:43.012 [order-service] WARN: Payment failed, retrying...
```

**장점:**
- 가장 상세한 정보 제공
- 오류 스택 트레이스, 사용자 입력 등 모든 맥락 포함
- 토큰 값, 요청 바디 같은 세부 사항 기록 가능

**단점:**
- 데이터량이 엄청남 (저장 비용 높음)
- 실시간 분석이 어려움 (대량의 텍스트 파싱 필요)
- 특정 요청을 찾기 위해 많은 수동 작업 필요

**언제 쓰는가:**
- 버그 디버깅
- 특정 사용자/요청의 상세 흐름 추적
- 시스템 상태 변화 기록

---

### 2. Metrics (메트릭)

메트릭은 **시간에 따른 수치 데이터의 집계**다.

```
cpu_usage: 45% (현재)
memory_usage: 2.3GB (현재)
request_latency_p95: 234ms (지난 1분)
request_latency_p99: 512ms (지난 1분)
error_rate: 0.5% (지난 5분)
active_connections: 1,523 (현재)
orders_per_second: 42.7 (지난 1분)
```

**장점:**
- 데이터량이 적음 (1초마다 몇 개 수치만 저장)
- 실시간 대시보드와 알람에 최적
- 추세 파악 용이 (시계열 분석)
- 저장 비용이 낮음

**단점:**
- 상세 정보 손실 (개별 요청의 세부 사항 알 수 없음)
- "왜 에러가 증가했는가?"를 답할 수 없음 (무엇이 증가했는지만 알 수 있음)
- 차원이 많으면 저장 공간이 지수적으로 증가 (카디널리티 문제)

**언제 쓰는가:**
- 시스템 건강도 모니터링
- 용량 계획
- 성능 트렌드 파악
- 자동 알람 설정

---

### 3. Traces (트레이스)

트레이스는 **요청 하나가 시스템을 통과하는 전체 경로의 기록**이다.

```
Request ID: req-7f2a8c4e-9d1b-11ed-a8fc-0242ac120002
│
├─ API Gateway (0-5ms)
│   ├─ Auth Check (1ms)
│   └─ Route to User Service (4ms)
│
├─ User Service (5-25ms)
│   ├─ DB Query: SELECT user... (12ms)
│   └─ Cache Update (8ms)
│
├─ Order Service (25-150ms)
│   ├─ Inventory Check (30ms)
│   ├─ Create Order (40ms)
│   └─ Publish Event (55ms)
│
└─ Response (150ms total)
```

각 단계를 **Span(범위)**라고 부르며, 특정 작업이 얼마나 오래 걸렸는지 기록한다.

**장점:**
- 분산 시스템의 흐름을 완벽하게 추적
- 병목 구간을 즉시 파악 (어느 서비스가 느린지)
- 요청 간의 의존성과 인과관계 파악
- 동시성 문제 시각화 가능

**단점:**
- 트레이스 데이터 생성 오버헤드
- 샘플링하지 않으면 저장 비용이 높음
- 샘플링하면 중요한 요청을 놓칠 수 있음

**언제 쓰는가:**
- 느린 요청의 원인 파악
- 마이크로서비스 간 상호작용 분석
- 분산 트랜잭션 디버깅
- 서비스 의존성 맵 생성

---

## Observability의 4가지 특징

세 기둥(Logs, Metrics, Traces)을 제대로 활용하려면 4가지 특징을 갖춰야 한다.

### 1. Query 능력 (임의 검색)

메트릭이나 로그를 **자유롭게 조합해서 검색**할 수 있어야 한다.

```
# 지난 1시간 동안 에러율이 5% 이상이던 서비스 찾기
error_rate > 0.05 AND timestamp > now() - 1h

# 특정 사용자의 모든 요청 추적
user_id = "user-789" AND service = "*"

# 응답 시간이 1초 이상인 요청들의 에러 로그
latency > 1000ms AND level = "ERROR"
```

이 능력이 없으면 미리 정해진 대시보드만 볼 수 있고, 새로운 문제에 대응할 수 없다.

### 2. Alerting (자동 알람)

메트릭이 임계값을 넘으면 **자동으로 알람**이 발생해야 한다.

```
Alert: Error Rate Spike
- Condition: error_rate > 1% for 5 minutes
- Affected Services: payment-service, order-service
- Current Value: 2.3%
- Severity: CRITICAL
```

로그는 너무 많아서 로그 기반 알람은 실용적이지 않다. 메트릭 기반 알람이 핵심이다.

### 3. Response Time 측정

**전체 응답 시간**과 **각 단계별 시간**을 측정할 수 있어야 한다.

```
전체 응답 시간: 250ms
  ├─ API Gateway: 5ms
  ├─ User Service: 45ms
  ├─ Order Service: 150ms (병목)
  ├─ Payment Service: 40ms
  └─ Network: 10ms
```

"어디가 느린지" 한눈에 파악하는 것이 Observability의 핵심 역할이다.

### 4. 분석 및 상관관계

**여러 데이터 소스를 연결해서 근본 원인을 파악**할 수 있어야 한다.

```
이벤트: Order Service의 응답 시간이 갑자기 2배로 증가
  ↓
메트릭 분석: CPU 사용률도 동시에 증가
  ↓
트레이스 분석: 모든 느린 요청에 같은 DB 쿼리가 포함됨
  ↓
로그 분석: 그 시점에 DB 마이그레이션이 실행됨
  ↓
결론: DB 마이그레이션 중 인덱스 부재로 인한 성능 저하
```

---

## 시나리오를 통한 이해

Observability를 갖춘 시스템에서 미지의 문제를 해결하는 흐름은 이렇다.

### 시나리오 1: "왜 이 API가 갑자기 느려졌는가?"

1. **메트릭으로 빠르게 인지**
   - 대시보드에서 `api-endpoint /orders` 의 p95 레이턴시가 100ms → 1000ms로 증가했음을 확인

2. **트레이스로 병목 특정**
   - 지난 1시간의 느린 트레이스들을 샘플링해서 본다
   - 모든 느린 요청에서 `database-query: get_inventory` 스팬이 800ms를 차지함을 발견

3. **로그로 근본 원인 파악**
   - 그 시점의 데이터베이스 로그를 본다
   - "Table lock detected: inventory_table" 메시지 발견
   - 동시에 백그라운드에서 데이터 마이그레이션이 실행 중이었음

4. **근본 해결**
   - 마이그레이션의 잠금 시간을 단축하거나, 유지보수 창을 설정

Observability 없이는 어디서부터 시작해야 할지 몰라 시스템 코드를 하나하나 살펴봐야 한다.

### 시나리오 2: "특정 사용자만 에러가 발생한다"

1. **로그로 에러 조건 파악**
   ```
   user_id = "user-5678" AND status = "ERROR" AND timestamp > now() - 1h
   ```
   - 이 사용자의 모든 에러 로그를 한 번에 조회

2. **트레이스로 흐름 추적**
   - 문제가 생긴 요청 하나의 전체 흐름을 따라가며 어느 서비스에서 실패했는지 확인

3. **메트릭으로 격리**
   - 그 사용자의 요청이 특정 데이터 센터나 특정 서비스 인스턴스로 라우팅되는지 확인
   - 혹은 특정 시간대에만 에러가 발생하는지 확인

4. **데이터 검증**
   - 해당 사용자의 데이터가 다른 사용자와 어떻게 다른지 분석
   - 예: 특정 카테고리의 상품만 조회 불가능, 특정 국가 결제만 실패 등

### 시나리오 3: "마이크로서비스 배포 후 성능 저하"

1. **메트릭 시계열 보기**
   - 배포 시점을 기준으로 각 서비스의 CPU, 메모리, 응답 시간 변화 추적
   - 어떤 서비스가 영향받았는지 파악

2. **트레이스 샘플 비교**
   - 배포 전/후의 같은 요청을 트레이스로 비교
   - 어느 단계에서 추가 지연이 생겼는지 확인

3. **로그의 에러/경고 확인**
   - 배포된 서비스의 로그에서 새로운 에러 패턴이 있는지 확인
   - 예: 새로운 의존성(라이브러리, 외부 API)의 타임아웃 발생

4. **롤백 판단**
   - 데이터 기반으로 빠르게 롤백 결정
   - Observability가 없으면 "뭔가 이상한데?" 수준에서만 알 수 있음

---

## Observability를 갖춘다는 것

결국 Observability를 갖춘 시스템이란:

- ✅ 문제가 발생하면 **"어디가 문제인가?"를 데이터로 빠르게 답할 수 있다**
- ✅ 미리 정의된 대시보드가 아니라 **임의의 질문에 대한 답을 찾을 수 있다**
- ✅ 근본 원인을 추적할 수 있는 **충분한 컨텍스트를 기록한다**
- ✅ 각 데이터 유형(로그, 메트릭, 트레이스)이 **서로 연결되어 있다**

이것이 복잡한 시스템을 이해하고 운영하는 데 필수불가결한 기반이다.

[[distributed-tracing-following-service-traces|다음 편]]에서는 트레이스의 구체적인 구현 방식과 요청 추적의 기술적 세부사항을 다룬다.

---

*관련 포스트: [[understanding-complex-systems|우리는 미지의 시스템을 어떻게 이해하는가]] · [[why-backend-architecture-grows-complex|왜 백엔드 아키텍처는 점점 더 복잡해지는가]]*
