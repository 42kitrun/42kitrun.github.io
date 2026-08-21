---
title: "Reverse Engineering: 문서 없는 시스템 읽기"
date: 2026-06-29
updated: 2026-06-29
tags:
  - reverse-engineering
  - system-analysis
  - code-reading
  - static-analysis
  - dynamic-analysis
  - observability
  - system-understanding
  - legacy-systems
  - debugging
  - performance-profiling
  - network-analysis
  - log-analysis
  - distributed-systems
  - software-architecture
  - complex-systems
related_projects: []
summary: "문서가 없거나 불완전한 시스템을 이해하기 위한 Reverse Engineering 기법들을 다룬다. 정적 분석, 동적 분석, 로그 분석, 네트워크 분석, 성능 프로파일링, 데이터 역공학의 6가지 방법론을 통해 미지의 시스템을 체계적으로 읽어낼 수 있다."
ai_agent: Claude-Code, ChatGPT
devto: false
devto_id:
devto_url:
---

# Reverse Engineering: 문서 없는 시스템 읽기

_written by Claude-Code, ChatGPT_

## 도입: 문서는 없고 시스템은 복잡하다

[[distributed-tracing-following-service-traces|3편에서 다룬 Distributed Tracing]]은 요청이 시스템을 통과하는 경로를 추적하는 기술이다. 하지만 시스템의 흐름을 알아도 **왜 이렇게 설계했는지**는 여전히 알 수 없을 수 있다.

개발자가 직면하는 상황:

- 팀원이 떠나고 그가 만든 마이크로서비스의 문서가 없다
- 레거시 시스템의 코드는 있지만 아키텍처 문서는 사라졌다
- AI Agent가 자동으로 생성한 복잡한 시스템의 의도를 파악해야 한다
- 외부에서 구매한 솔루션이 정확히 어떻게 작동하는지 알아야 한다

이 모든 상황에서 공통점은 같다: **문서가 없거나 부족하다는 것이다.**

하지만 이것이 절망이 되어야 할 이유는 없다. 코드는 거짓말을 하지 않는다. 동작이 진실이다. 우리가 할 일은 **동작으로부터 의도를 역으로 추론**하는 것이다. 이것이 **Reverse Engineering**이다.

![Reverse Engineering의 분석 기법들](/assets/posts/architecture/reverse-engineering-understanding-systems-without-documentation/reverse-engineering.png)

---

## 핵심: Reverse Engineering이란 무엇인가

**Reverse Engineering(역공학)** 은 완성된 제품의 동작을 분석하여 설계 원리, 구조, 의도를 파악하는 과정이다.

소프트웨어 맥락에서는:

> **실행 중인 시스템의 동작을 관찰하고, 그 동작으로부터 시스템의 내부 구조와 설계 의도를 역으로 추론하는 과정**

이는 법의학 과학이 범인의 행동 패턴으로 범행을 재구성하는 것과 유사하다. 우리는 시스템이 무엇을 하는지 관찰하고, 왜 그렇게 하는지 추론한다.

Reverse Engineering의 3가지 수준:

| 수준        | 질문                        | 예시                                       |
| --------- | ------------------------- | ---------------------------------------- |
| **구조 이해** | 이 시스템은 어떤 컴포넌트로 구성되어 있는가? | 어떤 마이크로서비스들이 존재하고, 어떻게 연결되어 있는가?         |
| **행동 이해** | 이 시스템은 어떤 조건에서 무엇을 하는가?   | 요청이 들어왔을 때 어떤 순서로 어떤 처리가 이루어지는가?         |
| **의도 이해** | 왜 이렇게 설계했는가?              | 왜 이 부분을 이렇게 복잡하게 만들었고, 어떤 문제를 해결하려고 했는가? |

---

## 6가지 분석 기법

Reverse Engineering을 실제로 수행하려면 여러 분석 기법을 조합해야 한다.

### 1. 정적 분석 (Static Analysis)

코드를 **실행하지 않고** 소스 코드 자체를 읽고 분석하는 방법이다.

**기본 단계:**

1. **파일 구조 파악**
   ```
   src/
   ├─ services/
   │  ├─ user-service.ts
   │  ├─ order-service.ts
   │  └─ payment-service.ts
   ├─ domain/
   │  ├─ user.ts
   │  └─ order.ts
   ├─ infrastructure/
   │  ├─ db/
   │  └─ cache/
   └─ api/
      └─ routes.ts
   ```
   
   디렉토리 구조만 봐도 시스템의 대략적인 계층 구조를 파악할 수 있다.

2. **의존성 그래프 작성**
   ```
   routes.ts
     ├→ user-service.ts
     ├→ order-service.ts
     └→ payment-service.ts
   
   order-service.ts
     ├→ payment-service.ts
     ├→ db/order-repository.ts
     └→ cache/order-cache.ts
   ```
   
   어떤 모듈이 어떤 모듈에 의존하는지 추적하면 시스템의 의존성 구조가 드러난다. 순환 의존성이 있는지, 계층이 명확한지 파악할 수 있다.

3. **인터페이스와 계약 읽기**
   ```typescript
   interface OrderService {
     createOrder(req: CreateOrderRequest): Promise<OrderResponse>;
     getOrder(orderId: string): Promise<OrderResponse>;
     cancelOrder(orderId: string): Promise<void>;
   }
   ```
   
   인터페이스의 메서드 시그니처와 파라미터만 봐도 이 서비스가 어떤 역할을 하는지 알 수 있다. 어떤 입력을 받고 어떤 출력을 하는지가 명확하다.

4. **주요 상수와 설정 분석**
   ```typescript
   const MAX_RETRY_ATTEMPTS = 3;
   const CIRCUIT_BREAKER_THRESHOLD = 50;
   const CACHE_TTL_SECONDS = 3600;
   const REQUEST_TIMEOUT_MS = 5000;
   ```
   
   이런 상수들은 시스템이 어떤 실패 시나리오에 대비했는지, 어떤 성능 특성을 목표로 하는지를 나타낸다.

**정적 분석의 장점:**
- 빠르고 비용이 없다 (코드 읽기만 하면 됨)
- 전체 구조를 조감도처럼 볼 수 있다
- 설계 의도가 코드에 반영되어 있는 경우가 많다

**정적 분석의 한계:**
- 실제로 어떻게 동작하는지는 알 수 없다
- 죽은 코드(사용되지 않는 코드)와 실제 실행 경로를 구분하기 어렵다
- 동적 행동(런타임 타입 결정, 조건부 로딩 등)을 파악하기 어렵다

---

### 2. 동적 분석 (Dynamic Analysis)

코드를 **실제로 실행하면서** 시스템의 동작을 관찰하는 방법이다.

**기본 단계:**

1. **실행 흐름 추적**
   ```javascript
   // 디버거나 trace 라이브러리로 함수 호출 추적
   handleOrder()
     ├→ validateOrder() [12ms]
     ├→ checkInventory() [45ms]
     ├→ createPayment() [320ms]
     │  ├→ callStripeAPI() [300ms]
     │  └─→ updatePaymentStatus() [20ms]
     ├→ updateOrderStatus() [8ms]
     └─→ sendNotification() [15ms]
   
   총 소요 시간: 400ms
   ```
   
   실제 실행 중에 어떤 함수가 호출되는지, 각각 얼마나 오래 걸리는지 관찰할 수 있다.

2. **상태 변화 모니터링**
   ```
   초기 상태: order = { status: "pending", items: [...] }
            inventory = { count: 100 }
   
   validateOrder 후: order = { status: "validated", items: [...] }
   
   createPayment 후: order = { status: "payment_processing", paymentId: "..." }
   
   completePayment 후: order = { status: "confirmed", items: [...] }
                      inventory = { count: 98 }
   ```
   
   각 단계에서 데이터 구조가 어떻게 변하는지 보면, 시스템이 어떤 상태를 추적하고 관리하는지 알 수 있다.

3. **에러 경로 탐색**
   - 정상 케이스만 테스트하면 안 된다
   - 의도적으로 에러를 발생시켜서 시스템이 어떻게 대응하는지 본다
   - 예: 결제 API 타임아웃 → 재시도? 즉시 실패? 큐에 저장?

**동적 분석의 장점:**
- 실제 동작을 직접 관찰한다
- 사실(fact)을 확인할 수 있다
- 성능 병목을 정확히 측정할 수 있다

**동적 분석의 한계:**
- 테스트 케이스를 모두 작성할 수 없다 (특히 복잡한 시스템)
- 프로덕션 환경의 실제 동작을 재현하기 어렵다
- 전체 시스템을 로컬에서 돌리기 불가능할 수 있다

---

### 3. 로그 분석 (Log Analysis)

실행 중인 시스템이 남긴 **로그 메시지**를 분석하는 방법이다.

**기본 단계:**

1. **로그의 밀도와 타이밍 분석**
   ```
   [2026-06-29 10:15:42.123] INFO: Order received: order_id=12345
   [2026-06-29 10:15:42.156] DEBUG: Validating order items...
   [2026-06-29 10:15:42.201] DEBUG: Inventory check passed
   [2026-06-29 10:15:42.456] INFO: Calling payment service...
   [2026-06-29 10:15:43.123] ERROR: Payment service timeout
   [2026-06-29 10:15:43.125] WARN: Retrying payment (attempt 2/3)
   [2026-06-29 10:15:43.789] INFO: Payment successful
   [2026-06-29 10:15:43.834] INFO: Order confirmed
   ```
   
   로그의 시간차이로 각 단계가 얼마나 오래 걸리는지 파악할 수 있다. 특정 구간의 로그가 없으면 그 부분이 빠르거나 에러가 발생해 건너뛰었다는 의미다.

2. **에러 로그 패턴 인식**
   ```
   ERROR: Database connection timeout
   ERROR: Connection pool exhausted
   ERROR: Query took 5s (slow log threshold: 1s)
   ```
   
   에러 메시지의 패턴으로 시스템의 약점을 파악한다. 자주 나타나는 에러는 시스템이 자주 직면하는 문제를 의미한다.

3. **로그 레벨의 의미 파악**
   - DEBUG: 개발자가 디버깅할 때 필요한 상세 정보
   - INFO: 주요 이정표 (요청 시작, 처리 완료)
   - WARN: 예상 밖의 상황이지만 계속 실행 가능
   - ERROR: 뭔가 실패했지만 시스템은 계속 작동
   - FATAL: 시스템이 더 이상 작동할 수 없음

**로그 분석의 장점:**
- 프로덕션 환경의 실제 동작을 관찰한다
- 대규모 데이터에서 패턴을 찾을 수 있다
- 사용자의 실제 행동을 추적할 수 있다

**로그 분석의 한계:**
- 로그가 충분하지 않으면 정보를 얻을 수 없다
- 민감한 정보는 로깅되지 않을 수 있다
- 로그 간의 인과관계를 추론해야 한다

---

### 4. 네트워크 분석 (Network Analysis)

시스템이 외부와 주고받는 **네트워크 트래픽**을 분석하는 방법이다.

**기본 단계:**

1. **HTTP 요청/응답 패턴**
   ```
   GET /api/users/12345 HTTP/1.1
   Host: api.example.com
   Authorization: Bearer token123
   
   HTTP/1.1 200 OK
   Content-Type: application/json
   {
     "id": "12345",
     "name": "John",
     "email": "john@example.com",
     "roles": ["user", "admin"]
   }
   ```
   
   어떤 엔드포인트들이 있는지, 어떤 형식의 데이터를 주고받는지, 어떤 헤더를 사용하는지 보면 API의 설계 의도를 파악할 수 있다.

2. **외부 API 호출 추적**
   ```
   POST /orders HTTP/1.1
   → 내부 처리 중...
   → GET https://payment-service/validate-card HTTP/1.1
   → POST https://stripe.com/v1/charges HTTP/1.1
   → POST https://sns.aws.com/publish HTTP/1.1 (알림 발송)
   ```
   
   시스템이 어떤 외부 서비스에 의존하는지 알 수 있다. 외부 서비스의 장애가 자신의 시스템에 어떻게 영향을 미칠 수 있는지 파악할 수 있다.

3. **데이터베이스 쿼리 분석**
   ```
   SELECT * FROM users WHERE id = '12345' [2ms]
   SELECT * FROM orders WHERE user_id = '12345' [145ms] ← 느림
   SELECT * FROM order_items WHERE order_id IN (...)  [34ms]
   UPDATE orders SET status = 'confirmed' WHERE id = '...' [8ms]
   ```
   
   느린 쿼리를 찾아서 최적화할 수 있다. 불필요한 쿼리가 많이 실행되는 부분을 찾을 수 있다.

**네트워크 분석의 장점:**
- 시스템의 외부 의존성을 명확하게 파악할 수 있다
- API 계약을 정확히 알 수 있다
- 데이터 흐름을 추적할 수 있다

**네트워크 분석의 한계:**
- 암호화된 통신은 분석하기 어렵다
- 내부 IPC(Inter-Process Communication)는 보이지 않는다
- 비동기 처리의 인과관계를 파악하기 어렵다

---

### 5. 성능 프로파일링 (Performance Profiling)

시스템의 **리소스 사용 패턴**을 분석하는 방법이다.

**기본 단계:**

1. **CPU 프로파일링**
   ```
   함수별 CPU 사용 시간:
   
   processOrder() ............................ 450ms (75%)
     ├─ validateOrder() ...................... 80ms (18%)
     ├─ calculateDiscount() ................. 200ms (44%) ← 병목!
     └─ saveToDatabase() ..................... 170ms (38%)
   
   notifyUser() ............................. 50ms (8%)
   logEvent() ............................... 100ms (17%)
   ```
   
   어떤 함수가 CPU를 가장 많이 사용하는지 알 수 있다. 보통 병목은 가장 많은 CPU를 사용하는 부분이다.

2. **메모리 프로파일링**
   ```
   메모리 할당 분포:
   
   Order 객체 ............................ 12MB (45%)
   Cache 메모리 .......................... 8MB (30%)
   임시 버퍼 ............................. 5MB (19%)
   기타 .................................. 1MB (6%)
   ```
   
   어떤 데이터 구조가 가장 많은 메모리를 사용하는지 알 수 있다. 메모리 누수가 있는지 감지할 수 있다.

3. **I/O 대기 시간**
   ```
   대기 시간 분포:
   
   데이터베이스 쿼리 대기 ................. 65% (병목)
   외부 API 호출 대기 .................... 25%
   디스크 I/O 대기 ....................... 8%
   기타 .................................. 2%
   ```
   
   시스템이 어디서 가장 많이 기다리는지 알 수 있다. I/O 대기 시간이 크면 병렬화나 캐싱으로 개선할 여지가 있다.

**성능 프로파일링의 장점:**
- 병목 지점을 객관적으로 확인할 수 있다
- 성능 최적화의 우선순위를 정할 수 있다
- 시스템의 물리적 제약을 이해할 수 있다

**성능 프로파일링의 한계:**
- 개발 환경과 프로덕션 환경의 성능 특성이 다를 수 있다
- 간헐적인 문제를 포착하기 어렵다
- 샘플링 기반이므로 매우 짧은 함수는 놓칠 수 있다

---

### 6. 데이터 역공학 (Data Reverse Engineering)

시스템이 저장하고 처리하는 **데이터 구조**를 분석하는 방법이다.

**기본 단계:**

1. **데이터 모델 추론**
   ```
   데이터베이스 테이블 구조를 보면:
   
   users (id, name, email, role, created_at, updated_at)
   orders (id, user_id, total, status, created_at, updated_at)
   order_items (id, order_id, product_id, quantity, price)
   products (id, name, category, price, stock)
   ```
   
   테이블과 컬럼만 봐도:
   - 사용자가 있고
   - 사용자는 여러 주문을 가질 수 있고
   - 각 주문은 여러 상품을 포함하고
   - 상품은 재고를 관리한다
   
   는 것을 알 수 있다.

2. **관계와 제약 조건 분석**
   ```
   FK: orders.user_id → users.id (1:N 관계)
   FK: order_items.order_id → orders.id (1:N 관계)
   FK: order_items.product_id → products.id (N:1 관계)
   
   UK: users.email (유니크, 중복 불가)
   CK: orders.status IN ('pending', 'confirmed', 'shipped', 'delivered')
   ```
   
   제약 조건은 시스템의 비즈니스 규칙을 나타낸다. 주문 상태가 특정 값으로만 제한되는 것은 워크플로우가 정해져 있다는 의미다.

3. **인덱스 분석**
   ```
   테이블: orders
   - PK: orders.id
   - IDX: orders.user_id (자주 조회할 컬럼)
   - IDX: orders.status (상태 별 필터링)
   - IDX: orders.created_at DESC (최신순 정렬)
   ```
   
   인덱스가 있다는 것은 그 컬럼으로 자주 검색하거나 정렬한다는 의미다. 시스템의 주요 쿼리 패턴을 알 수 있다.

4. **데이터 분포와 크기**
   ```
   users 테이블: 1,000,000 행
   orders 테이블: 10,000,000 행
   order_items 테이블: 50,000,000 행
   ```
   
   데이터 크기로 시스템의 규모를 가늠할 수 있다. 대규모 데이터는 성능 최적화가 중요하다는 의미다.

**데이터 역공학의 장점:**
- 시스템의 비즈니스 로직을 이해할 수 있다
- 데이터 일관성 규칙을 파악할 수 있다
- 마이그레이션이나 통합 시 필요한 정보를 얻을 수 있다

**데이터 역공학의 한계:**
- 데이터베이스 스키마에만 접근 가능해야 한다
- 응용 계층의 비즈니스 로직은 완전히 파악하기 어렵다
- 역사적 변화나 이유는 알 수 없다

---

## 종합: 여러 기법을 조합하기

실제로 복잡한 시스템을 이해하려면 **한 가지 기법만으로는 부족하다.** 여러 기법을 조합해야 한다.

### 시나리오: "API 응답이 느리다"는 문제를 분석하는 과정

**1단계: 정적 분석** - 코드 구조 파악
```
routes.ts → order-service.ts → order-repository.ts → database
```

**2단계: 네트워크 분석** - API 호출 추적
```
GET /api/orders → 외부 inventory-service 호출 → payment-service 호출
```

**3단계: 성능 프로파일링** - 병목 측정
```
inventory-service 호출: 850ms (전체 시간의 85%)
```

**4단계: 로그 분석** - 근본 원인 찾기
```
[10:15:42] inventory-service 호출 시작
[10:15:43.8] ERROR: Connection timeout to inventory DB
[10:15:43.9] RETRY: Retrying with exponential backoff
[10:15:44.7] SUCCESS: 재시도 후 성공
```

**5단계: 데이터 역공학** - 데이터 크기 확인
```
inventory 테이블: 100만 행
인덱스: product_id만 존재 (warehouse_id 인덱스는 없음)
→ warehouse별 조회가 풀 테이블 스캔하고 있음
```

**결론:** inventory-service가 인덱스 없이 느린 쿼리를 실행 중이고, 동시에 연결 타임아웃이 발생하고 있다. 재시도 로직이 있어서 결국 성공하지만 성능 저하가 심하다.

---

## 실전 가이드: 미지의 시스템을 읽는 체크리스트

새로운 복잡한 시스템을 맡았을 때:

**1주차: 구조 파악**
- [ ] 파일 디렉토리 구조 다이어그램 그리기
- [ ] 주요 모듈 간 의존성 파악
- [ ] README나 문서 찾아 높은 수준의 개요 이해
- [ ] 핵심 인터페이스와 API 목록화

**2주차: 동작 이해**
- [ ] 정상적인 케이스 한 가지를 끝까지 추적 (동적 분석)
- [ ] 각 단계별 소요 시간 측정 (성능 프로파일링)
- [ ] 데이터 구조 다이어그램 작성 (데이터 역공학)
- [ ] 외부 의존성 목록화 (네트워크 분석)

**3주차: 문제 케이스 분석**
- [ ] 에러가 발생하는 경우를 추적
- [ ] 로그 패턴 분석으로 자주 발생하는 문제 파악
- [ ] 성능이 저하되는 조건 찾기

**4주차: 문서화**
- [ ] 발견한 내용을 문서로 정리
- [ ] 아키텍처 다이어그램 작성
- [ ] 주요 데이터 플로우 문서화
- [ ] 팀과 함께 검증

---

## 정리: Reverse Engineering의 핵심

Reverse Engineering은 **문서의 부재를 동작의 관찰로 보완하는 기법**이다.

여섯 가지 기법의 특징:

| 기법 | 관찰 대상 | 얻을 수 있는 것 | 한계 |
|------|---------|--------------|------|
| **정적 분석** | 소스 코드 | 구조, 의도 | 실제 동작은 모름 |
| **동적 분석** | 실행 흐름 | 행동, 성능 | 모든 경로를 테스트할 수 없음 |
| **로그 분석** | 로그 메시지 | 실제 문제, 패턴 | 충분한 로그가 필요 |
| **네트워크 분석** | 트래픽 | 외부 의존성, API | 암호화된 통신 분석 불가 |
| **성능 프로파일링** | 리소스 사용 | 병목, 제약 | 샘플링 기반 분석 |
| **데이터 역공학** | 데이터 구조 | 비즈니스 규칙 | 응용 로직은 불명확 |

복잡한 시스템을 이해하는 네 단계의 마지막에서:

1. [[observability-seeing-invisible-systems|**2편: Observability**]] - 시스템이 **뭘 하는지** 본다
2. [[distributed-tracing-following-service-traces|**3편: Distributed Tracing**]] - **어떻게 작동하는지** 따라간다
3. **4편: Reverse Engineering** - **왜 이렇게 설계했는지** 역으로 읽는다 (현재)
4. **5편: Domain Modeling** (예정) - **무엇을 나타내는지** 개념적으로 이해한다

Observability와 Distributed Tracing이 시스템을 **보이게** 만든다면, Reverse Engineering은 그 관찰 결과로부터 **의미를 추출**한다. 두 기법은 보완적이다.

[[domain-modeling-understanding-domain-before-system|다음 편]]에서는 시스템을 읽은 후, 그것이 나타내는 도메인과 비즈니스 개념을 이해하는 방법인 Domain Modeling을 다룬다.

---

*관련 포스트: [[understanding-complex-systems|우리는 미지의 시스템을 어떻게 이해하는가]] · [[observability-seeing-invisible-systems|Observability: 보이지 않는 시스템을 보는 기술]] · [[distributed-tracing-following-service-traces|Distributed Tracing: 서비스의 발자취를 따라가기]] · [[why-backend-architecture-grows-complex|왜 백엔드 아키텍처는 점점 더 복잡해지는가]]*
