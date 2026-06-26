---
title: "Distributed Tracing: 서비스의 발자취를 따라가기"
date: 2026-06-26
updated: 2026-06-26
tags:
  - distributed-tracing
  - trace-id
  - span
  - context-propagation
  - microservices
  - request-tracking
  - performance-analysis
  - observability
  - system-debugging
  - service-mesh
  - jaeger
  - zipkin
  - latency-analysis
  - monitoring
related_projects: []
summary: "마이크로서비스 환경에서 요청 하나가 여러 서비스를 통과하는 전체 경로를 추적하는 Distributed Tracing의 개념, 구현 방식, 그리고 실무 활용법을 정리한 가이드."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# Distributed Tracing: 서비스의 발자취를 따라가기

_written by Claude-Code_

## 도입: 요청을 쫓아가기

[[observability-seeing-invisible-systems|2편에서 다룬 Observability]]는 시스템의 세 가지 기둥으로 로그, 메트릭, 트레이스를 제시했다. 그 중 **트레이스(Trace)**는 요청 하나가 시스템을 통과하는 전체 경로의 기록이다.

하지만 단순히 "경로를 기록한다"는 것만으로는 부족하다. 

마이크로서비스 환경에서 요청은 여러 서비스를 거친다. 클라이언트의 한 번의 클릭이 API Gateway → User Service → Order Service → Payment Service → Notification Service로 이어진다. 각 서비스는 독립적으로 배포되고, 각각의 로그를 남기고, 각각의 메트릭을 기록한다.

문제는 이 모든 것이 **단편화되어 있다**는 것이다. Order Service의 로그만 봐서는 왜 느린지 알 수 없다. Payment Service의 메트릭만으로는 전체 흐름을 알 수 없다. 병목이 어디인지, 어느 단계에서 지연이 발생했는지, 요청이 정확히 어떤 경로로 흐르는지 **전체 그림**을 봐야 한다.

이것이 **Distributed Tracing**이다. 요청을 추적하는 기술이 아니라, **여러 서비스에 흩어진 로그와 메트릭을 하나의 요청으로 엮어서 전체 흐름을 보는 기술**이다.

![Distributed Tracing의 구조와 개념](/assets/posts/architecture/distributed-tracing-following-service-traces/distributed-tracing.png)

---

## 핵심: Distributed Tracing의 구조

### 1. Trace ID: 요청의 신분증

Distributed Tracing의 가장 기본 개념은 **Trace ID**다.

```
요청 발생: GET /orders/12345
↓
시스템에서 고유한 ID 생성: trace-id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
↓
이 ID를 모든 서비스에 전달하며 추적
```

Trace ID는 요청이 시스템을 통과하면서 **변하지 않는 고유 식별자**다. 

- API Gateway에서 생성된 trace-id
- Order Service로 전달될 때도 같은 trace-id
- Payment Service에 전달될 때도 같은 trace-id
- 모든 서비스의 로그에 이 trace-id가 기록됨

이 덕분에 각 서비스의 분산된 로그를 하나로 엮을 수 있다.

### 2. Span: 작업 단위의 기록

Trace는 여러 **Span(범위)**로 구성된다. 각 Span은 시스템 내 특정 작업이 얼마나 걸렸는지를 나타낸다.

```
Trace: f47ac10b-58cc-4372-a567-0e02b2c3d479
├─ Span 1: API Gateway (0-10ms)
│   ├─ Auth Check (1ms)
│   └─ Route to Order Service (4ms)
│
├─ Span 2: Order Service (10-80ms)
│   ├─ Validate Order (5ms)
│   ├─ DB Query (30ms)
│   └─ Publish Event (35ms)
│
└─ Span 3: Payment Service (80-150ms)
    ├─ Call Stripe API (60ms)
    └─ Update Status (10ms)
```

각 Span에는:
- **Span ID**: 이 작업의 고유 ID
- **Parent Span ID**: 이전 작업의 Span ID (계층 구조 형성)
- **Span Name**: 작업의 이름 ("db-query", "http-request" 등)
- **Timestamps**: 시작 시간과 종료 시간
- **Attributes**: 추가 정보 (service-name, method, status-code 등)
- **Events**: 중요한 사건 기록

### 3. Context Propagation: 정보를 전달하기

Distributed Tracing이 작동하려면 **trace-id와 span-id가 서비스 간에 전달되어야 한다.**

이를 Context Propagation이라고 한다.

```
클라이언트 요청:
  GET /orders/12345
  Headers: {
    traceparent: "00-f47ac10b58cc4372a5670e02b2c3d479-b7ad6b7dd3201667-01"
  }

API Gateway (Span A 생성):
  → Order Service 호출 시 header 전달
  → span-id를 parent-span-id로 설정
  Headers: {
    traceparent: "00-f47ac10b58cc4372a5670e02b2c3d479-[새로운-span-id]-01"
  }

Order Service (Span B 생성):
  → Payment Service 호출 시 header 전달
  → span-id를 parent-span-id로 설정
  Headers: {
    traceparent: "00-f47ac10b58cc4372a5670e02b2c3d479-[또-다른-span-id]-01"
  }
```

이 방식을 사용하면:
- 모든 서비스가 같은 trace-id 아래에서 작동
- Span 간의 부모-자식 관계가 명확함
- 요청의 전체 흐름을 시각화 가능

---

## 실무: Parent-Child Span 관계와 병목 분석

### 시나리오 1: 느린 요청의 원인을 찾기

사용자가 주문을 했는데, 평소 200ms 걸리던 API가 갑자기 2초가 걸린다고 보고했다.

Distributed Tracing 없이 대응:
```
order-service 로그: 요청 시작... 요청 종료
payment-service 로그: 결제 처리 중... 완료
notification-service 로그: 이메일 발송 중... 완료

→ 어느 서비스가 느린지 알 수 없음
→ 각 서비스 담당자가 자기 서비스 코드를 뒤져야 함
```

Distributed Tracing으로 대응:
```
Trace ID: abc-def-123

├─ order-service (150ms)
│  ├─ validate-order (10ms)
│  └─ save-to-db (140ms) ← 느려진 부분 발견!
│
├─ payment-service (50ms)
│  └─ stripe-api-call (45ms)
│
└─ notification-service (100ms)
   └─ send-email (95ms)

총 소요 시간: 2초
→ order-service의 db-save가 140ms에서 1800ms로 증가했음을 즉시 파악
→ 해당 시점에 DB 인덱스가 누락되었거나 잠금이 발생했을 가능성 추론
```

### 시나리오 2: 서비스 간 의존성 파악

마이크로서비스를 새로 배포했는데 전체 요청이 느려졌다.

Distributed Tracing을 통해 흐름을 보면:

```
이전:
API Gateway (5ms)
  → Order Service (50ms)
    → Payment Service (40ms)
      → Notification Service (30ms)
총: 125ms

배포 후:
API Gateway (5ms)
  → Order Service (50ms)
    → New Feature Service (60ms) ← 새로 추가됨
      → Payment Service (40ms)
        → Notification Service (30ms)
총: 185ms

발견: 새로운 서비스가 모든 요청에 강제되었고, 그 서비스의 응답이 느림
→ 새 서비스를 조건부 호출로 변경하거나 최적화 필요
```

### 시나리오 3: 동시성 문제 시각화

여러 서비스가 병렬로 실행되는지 순차로 실행되는지 파악:

```
병렬 실행 (좋은 설계):
time: 0ms────────────100ms
      ├─ Service A [===]
      ├─ Service B [===]
      └─ Service C [===]
총 시간: 100ms

순차 실행 (나쁜 설계):
time: 0ms─────────────────────────────────────300ms
      ├─ Service A [===]
           ├─ Service B [===]
                ├─ Service C [===]
총 시간: 300ms

Distributed Tracing으로 부모-자식 관계를 보면, 어떤 서비스가 다른 서비스의 결과를 기다리는지 명확하게 파악 가능
```

---

## 구현: Distributed Tracing 도구들

Distributed Tracing을 구현하려면 다음 요소들이 필요하다:

### 1. Instrumentation (계측)
각 서비스에 tracing 라이브러리를 통합:

```javascript
// OpenTelemetry 예시
const tracer = opentelemetry.trace.getTracer('my-service');

async function handleOrder(req, res) {
  const span = tracer.startSpan('handle-order');
  try {
    const order = await validateOrder(req.body);
    // span에 결과 기록
    span.setAttributes({ order_id: order.id });
    res.json(order);
  } finally {
    span.end();
  }
}
```

### 2. Trace 수집 (Collectors)
Jaeger, Zipkin 같은 백엔드에서 trace 데이터를 수집하고 저장

### 3. 시각화 (Visualization)
UI에서 요청의 흐름을 타임라인으로 표시하여 병목을 시각적으로 파악

---

## 주의사항: 트레이싱의 오버헤드

Distributed Tracing은 강력하지만, 모든 요청을 100% 추적하면 성능 저하가 발생한다.

**해결책: Sampling (샘플링)**

```
모든 요청의 100%를 추적: 성능 저하, 저장 비용 증가
→ 1%만 추적: 전체 흐름의 대체적 통계만 파악 가능
→ 동적 샘플링: 에러 발생 요청은 100%, 정상 요청은 1%만 추적
```

실무에서는 **중요도 기반 샘플링**을 사용한다:
- 에러 발생 요청: 100% 추적
- 느린 요청 (>1초): 10% 추적
- 정상 요청: 1% 추적

---

## 복잡한 시스템을 이해하는 단계

지금까지 이 연작에서 다룬 내용을 정리하면:

1. [[observability-seeing-invisible-systems|**2편: Observability**]] - 시스템이 **뭘 하는지** 본다
   - 로그, 메트릭, 트레이스 데이터 확보

2. **3편: Distributed Tracing** - **어떻게 작동하는지** 따라간다 (현재)
   - 요청 흐름의 경로와 병목 파악

3. [[understanding-complex-systems|**4편: Reverse Engineering**]] (다음)
   - **왜 이렇게 설계했는지** 역으로 추론

4. **5편: Domain Modeling** (예정)
   - **무엇을 나타내는지** 개념적으로 이해

Distributed Tracing은 이 과정에서 가장 **구체적이고 실용적**인 단계다. 데이터를 수집한 후 (Observability), 이제 그 데이터로 요청의 흐름을 추적할 수 있다 (Distributed Tracing).

---

## 정리: Distributed Tracing의 핵심

Distributed Tracing은 다음을 가능하게 한다:

- ✅ **요청의 전체 흐름을 한눈에 파악**
- ✅ **병목 구간을 즉시 특정** (어느 서비스, 어느 단계)
- ✅ **서비스 간 의존성을 시각화**
- ✅ **성능 저하의 근본 원인을 데이터로 증명**

이 모든 것이 가능한 이유는 간단하다: **Trace ID 하나로 모든 서비스를 연결했기 때문이다.**

[[reverse-engineering-understanding-systems-without-documentation|다음 편]]에서는 문서 없는 시스템을 읽는 방법, 즉 Reverse Engineering을 다룬다.

---

*관련 포스트: [[understanding-complex-systems|우리는 미지의 시스템을 어떻게 이해하는가]] · [[observability-seeing-invisible-systems|Observability: 보이지 않는 시스템을 보는 기술]] · [[why-backend-architecture-grows-complex|왜 백엔드 아키텍처는 점점 더 복잡해지는가]]*
