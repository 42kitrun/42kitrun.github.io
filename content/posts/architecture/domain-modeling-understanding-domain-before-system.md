---
title: "Domain Modeling: 시스템보다 먼저 도메인을 이해하라"
date: 2026-07-01
updated: 2026-07-02
tags:
  - domain-modeling
  - domain-driven-design
  - ubiquitous-language
  - bounded-context
  - business-logic
  - system-design
  - complexity-management
  - requirements
  - software-architecture
  - system-understanding
  - reverse-engineering
  - knowledge-transfer
  - legacy-systems
  - refactoring
  - microservices
related_projects: []
summary: "코드 구조보다 비즈니스 도메인을 먼저 이해해야 하는 이유와, DDD의 핵심 개념으로 미지의 시스템을 읽어내는 방법을 다룬다."
ai_agent: Claude-Code, ChatGPT
devto: false
devto_id:
devto_url:
---

# Domain Modeling: 시스템보다 먼저 도메인을 이해하라

_written by Claude-Code, ChatGPT_

## 지금까지의 여정

지난 4편에 걸쳐 미지의 시스템을 이해하는 방법을 배웠다.

1. **Observability**: 시스템이 지금 뭘 하는지 봤다
2. **Distributed Tracing**: 요청이 어떻게 흘러가는지 따라갔다
3. **Reverse Engineering**: 동작에서 설계의 의도를 역으로 읽었다

하지만 여전히 놓친 것이 있다. **시스템이 왜 이렇게 설계되었는지, 그 근본적인 목적이 무엇인지**는 여전히 불명확하다.

코드는 읽었다. 로그도 봤다. 트레이스도 따라갔다. 그런데도 "왜?"라는 질문에는 답할 수 없다.

이것이 마지막 단계인 **Domain Modeling**이 필요한 이유다.

![Domain Modeling: 시스템보다 먼저 도메인을 이해하라](/assets/posts/architecture/domain-modeling-understanding-domain-before-system/domain-modeling.png)

---

## 코드를 읽으면 보이지 않는 것

어느 전자상거래 회사의 오래된 주문 처리 시스템을 맡았다고 하자. 복잡한 마이크로서비스 아키텍처다.

```
OrderService
  ├─ Order 엔티티
  ├─ OrderItem 엔티티
  ├─ OrderStatusEnum: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  └─ OrderRepository: create, findById, update, cancel...

PaymentService
  ├─ Payment 엔티티
  ├─ PaymentStatusEnum: INITIATED, PROCESSING, COMPLETED, FAILED, REFUNDED
  └─ PaymentRepository: create, findById, process, refund...

InventoryService
  ├─ InventoryItem 엔티티
  ├─ ReservationStatusEnum: RESERVED, COMMITTED, RELEASED
  └─ InventoryRepository: reserve, commit, release...
```

코드 구조는 명확하다. 각 서비스의 책임도 이해할 수 있다. 데이터베이스 스키마도 합리적이다.

하지만 여전히 답할 수 없는 질문들이 있다:

- "왜 주문을 취소할 때 재고는 즉시 해제되는데, 환불은 별도의 배치 작업에서 처리하는가?"
- "왜 PaymentService는 PaymentStatus를 갖고 있는데, 그 상태 전이 로직은 어디에 정의되어 있는가?"
- "왜 일부 비즈니스 규칙은 OrderService에 있고, 일부는 PaymentService에 있고, 일부는 별도의 워크플로우 엔진에 있는가?"

코드는 **뭘 하는지**를 보여주지만, **왜 하는지**와 **무엇을 의미하는지**는 보여주지 않는다.

---

## Domain이란 무엇인가

**Domain(도메인)**은 비즈니스가 해결하려는 문제 영역이다.

전자상거래 회사라면:
- 고객이 상품을 선택하고 구매한다
- 결제를 처리한다
- 재고를 관리한다
- 배송을 한다
- 반품을 처리한다

이런 **비즈니스의 핵심 활동들**이 도메인이다.

Domain Modeling은 이 도메인을 **코드로 표현하기 전에** 먼저 제대로 이해하는 과정이다. Domain-Driven Design(DDD)의 저자 Eric Evans는 이렇게 정의했다:

> 도메인 모델이란 비즈니스 도메인의 개념과 규칙을 코드로 표현한 것이 아니라, 그것을 정확하게 반영하기 위한 설계 전략이다.

즉, **도메인을 제대로 이해해야만 좋은 설계가 가능하다**는 뜻이다.

---

## Ubiquitous Language (유비쿼터스 언어)

이제 미지의 시스템을 이해해야 한다면, 먼저 해야 할 일은 **그 시스템이 사용하는 언어를 배우는 것**이다.

예를 들어 주문 시스템에서:

- 개발자는 "OrderStatusEnum.PENDING"이라고 부르지만, 비즈니스팀은 "확인 대기 중"이라고 부른다
- 결제팀은 "결제 승인 대기"라고 부르는데, 배송팀은 "주문 처리 시작 가능"이라고 부른다

이런 불일치가 있으면:

```
// 코드에서 본 것:
if (order.status == OrderStatus.PENDING) {
    payment.process();
}

// 하지만 비즈니스 규칙은:
// "결제가 실패하면 30분 후 재시도하지만,
//  고객이 다른 결제 수단을 등록했으면 그것을 먼저 시도한다"
```

코드와 비즈니스 의도가 맞지 않는다.

**Ubiquitous Language(유비쿼터스 언어)**는 비즈니스팀과 개발팀이 같은 용어를 같은 의미로 사용하는 것이다.

미지의 시스템을 이해할 때:

1. **도메인 전문가(사업가, 기획자, 운영팀)를 찾는다**
2. **그들이 사용하는 용어를 정확히 기록한다**
3. **코드의 클래스/메서드 이름이 그 용어와 일치하는지 본다**

불일치가 크면, 그 부분이 가장 복잡하고 이해가 어려운 부분일 가능성이 높다.

예:

```
// 나쁜 예: 코드만 봐서는 의미를 알 수 없다
def process_trx_v2(payload):
    if payload['type'] == 'A':
        calc_fee(payload)
        update_ledger(payload)
    elif payload['type'] == 'B':
        apply_discount(payload)
        create_credit()

// 좋은 예: 도메인 언어를 코드에 반영
def process_payment_initiation(payment_request):
    if payment_request.is_credit_card():
        calculate_processing_fee(payment_request)
        record_transaction_in_ledger(payment_request)
    elif payment_request.is_wallet_payment():
        apply_loyalty_discount(payment_request)
        issue_credit_for_future_purchase(payment_request)
```

---

## Bounded Context (한정된 컨텍스트)

복잡한 시스템에서 같은 용어가 다른 의미로 사용되는 경우가 많다.

"주문"을 예로 들면:

- **주문 서비스**: "주문은 고객이 상품을 선택하고 결제 수단을 선택한 것"
- **배송 서비스**: "주문은 창고에서 준비되어야 할 상품 목록"
- **회계 서비스**: "주문은 수익 인식의 근거가 되는 거래"

같은 "주문"이지만, 각 팀마다 관심 있는 속성이 다르다.

```
주문 서비스의 Order:
  - 주문자 ID
  - 선택된 상품들
  - 배송 주소
  - 선택된 결제 수단

배송 서비스의 Order:
  - 주문 ID
  - 상품 목록 (SKU + 수량)
  - 배송 주소
  - (고객 정보는 없음)

회계 서비스의 Order:
  - 주문 ID
  - 판매액
  - 예상 마진
  - 배송비
  - 세금
```

**Bounded Context**는 도메인을 의미 있는 경계로 나누는 것이다. 각 경계 내에서 같은 용어가 일관되게 같은 의미를 갖도록 한다.

미지의 시스템을 이해할 때:

1. **여러 서비스/모듈이 있다면, 각각이 어떤 컨텍스트인지 파악한다**
2. **경계 간의 통신 방식을 본다** (API 호출? 메시지? 공유 DB?)
3. **경계를 넘을 때 개념이 어떻게 변환되는지 본다**

예:

```typescript
// OrderService의 Order (Order Context)
interface Order {
  id: OrderId;
  customerId: CustomerId;
  items: OrderItem[];
  status: OrderStatus; // PENDING, CONFIRMED, PROCESSING
  createdAt: Date;
}

// ShippingService의 Order (Shipping Context)
interface ShippingOrder {
  id: OrderId;
  items: ShippingItem[]; // SKU와 수량만
  address: ShippingAddress;
  status: ShippingStatus; // RESERVED, PACKED, SHIPPED
}

// 경계 통과: Order → ShippingOrder 변환
// OrderService가 ShippingService에 요청할 때
function createShippingOrder(order: Order): ShippingOrder {
  return {
    id: order.id,
    items: order.items.map(item => ({
      sku: item.product.sku,
      quantity: item.quantity
    })),
    address: order.shippingAddress
    // 고객 정보는 버린다 - Shipping Context에선 불필요
  };
}
```

---

## Core Domain vs Supporting Domain vs Generic Domain

모든 도메인 영역이 같은 중요도를 갖지는 않는다.

### Core Domain (핵심 도메인)

비즈니스의 경쟁력을 결정하는 영역이다.

전자상거래라면:
- 추천 알고리즘
- 가격 결정 전략
- 고객 세분화

이 영역은:
- ✅ 직접 구축한다
- ✅ 최고의 개발자를 투입한다
- ✅ 정기적으로 개선한다

### Supporting Domain (지원 도메인)

비즈니스에 필요하지만, 경쟁력을 결정하지는 않는 영역이다.

전자상거래라면:
- 배송 처리
- 환불 처리
- 인벤토리 추적

이 영역은:
- ✅ 잘 구축해야 하지만 혁신적일 필요는 없다
- ✅ 자동화와 효율성에 중점

### Generic Domain (일반 도메인)

기술적으로는 필요하지만, 비즈니스와는 상관없는 영역이다.

- 인증/인가
- 로깅
- 캐싱

이 영역은:
- ✅ 기존 라이브러리나 서비스를 사용한다 (자체 구축 X)
- ✅ 표준을 따른다

미지의 시스템을 이해할 때:

```
"왜 이 부분은 복잡하고, 저 부분은 단순한가?"

→ Core Domain인 부분은 복잡한 비즈니스 규칙이 있어서 복잡하다
→ Supporting Domain인 부분도 복잡할 수 있지만, 개선 여지가 있다
→ Generic Domain인데 복잡하면, 라이브러리로 교체하는 게 나을 수 있다
```

---

## Value Object와 Entity

도메인을 모델링할 때 자주 나오는 개념이다.

### Entity (엔티티)

식별자를 갖는 객체. 시간이 지나도 같은 개체다.

```typescript
// 고객: Customer ID가 바뀌지 않으면 같은 고객
class Customer {
  id: CustomerId;
  name: string;
  email: string;
  // 이름이 바뀌어도 같은 고객
}

// 주문: Order ID가 바뀌지 않으면 같은 주문
class Order {
  id: OrderId;
  customerId: CustomerId;
  total: Money;
  // 금액이 바뀌어도 같은 주문
}
```

### Value Object (값 객체)

식별자를 갖지 않으며, 값으로만 비교한다. 불변이다.

```typescript
// 금액: 돈은 얼마인지만 중요하고, "누가 가지고 있는 돈"이 아니다
class Money {
  readonly amount: number;
  readonly currency: string;
  
  equals(other: Money): boolean {
    return this.amount === other.amount && 
           this.currency === other.currency;
  }
}

// 주소: 주소는 값이다
class Address {
  readonly street: string;
  readonly city: string;
  readonly postalCode: string;
  
  equals(other: Address): boolean {
    return this.street === other.street &&
           this.city === other.city &&
           this.postalCode === other.postalCode;
  }
}

// 사용
const order1 = new Order(new Money(100, "USD"));
const order2 = new Order(new Money(100, "USD"));
// order1과 order2는 다른 주문(Entity)이지만,
// order1의 금액과 order2의 금액은 같다(Value Object)
```

미지의 시스템을 이해할 때:

```
"왜 이 값은 별도 테이블로 관리되고, 
 저 값은 문자열 컬럼에 저장되어 있는가?"

→ Entity: 독립적 생명주기를 가짐
→ Value Object: 의미 있는 개념이지만, 독립적일 필요 없음
```

---

## 시나리오: 미지의 시스템을 Domain Modeling으로 이해하기

새로운 팀에 입사해서 '멤버십 시스템'을 맡았다고 하자. 코드는 복잡하지만, 문서는 없다.

### 1단계: 도메인 전문가 찾기

```
나: "이 시스템에서 멤버십이란?"

멤버십팀장: "고객이 가입 수수료를 내고, 매월 혜택을 받는 거죠.
세 등급이 있는데, 실버(월 9,900원), 골드(월 19,900원), 플래티넘(월 49,900원)."

나: "등급은 어떻게 올라가나?"

멤버십팀장: "골드는 연간 구매액이 100만원 이상이면 자동 업그레이드.
플래티넘은 고객 센터에서 수동으로 변경하는데...
아, 근데 30일 이내에 구매가 없으면 자동으로 한 등급 내려가요."
```

이 대화에서 핵심 개념이 보인다:
- **Membership**: Silver, Gold, Platinum
- **Tier Upgrade**: 자동 (구매액), 수동 (고객 센터)
- **Tier Downgrade**: 자동 (30일 미사용)

### 2단계: Ubiquitous Language 확인

```
코드에서 본 것:
- MembershipTier.LEVEL_1, LEVEL_2, LEVEL_3
- is_active: bool
- upgrade_date, downgrade_date 컬럼

멤버십팀 용어:
- Silver, Gold, Platinum
- "구독 중", "구독 해지", "휴면"
- 기간 범위가 있음 (예: 2024-01-01 ~ 2024-12-31)

불일치가 크다!
```

### 3단계: Bounded Context 파악

```
MembershipService (Membership Context):
- 멤버십 등급
- 가입/해지
- 등급 변경 로직

PaymentService (Payment Context):
- 구독료 청구
- 결제 실패 처리
- 환불

BenefitService (Benefit Context):
- 혜택 적용
- 할인 계산
```

경계를 넘을 때:
```
MembershipService → PaymentService:
"사용자 123, 2024년 1월 골드 구독 시작"
→ 구독료 19,900원 청구 요청

PaymentService → BenefitService:
"사용자 123, 2024년 1월 골드 멤버 상태 확인"
→ 적용할 할인율 계산

BenefitService → PaymentService:
"상품 주문 금액 100,000원"
→ 골드 멤버 10% 할인 적용
```

### 4단계: 복잡한 비즈니스 규칙 발견

```python
# 코드에서 본 것:
def process_monthly_billing():
    for member in active_members:
        if member.last_purchase_date < 30.days.ago:
            member.tier = max(member.tier - 1, SILVER)
        charge_subscription_fee(member)

# 하지만 비즈니스 규칙은:
# 1. 플래티넘 회원이 구매 없이 30일이 지나면 골드로 내려간다
# 2. 이때 한 달치 차액(49,900 - 19,900 = 30,000원)은?
#    - 환불하나? 다음 달에서 공제하나?
# 3. 은행 휴무일에는 청구를 미루나?
# 4. 청구 실패 시 몇 번까지 재시도?
```

이 규칙들은 코드에서는 찾기 어렵다. 비즈니스팀에 직접 물어봐야 한다.

---

## Domain Modeling을 통해 얻는 것

미지의 시스템을 Domain Modeling으로 접근하면:

### 1. 의도가 명확해진다

코드는 그저 "이렇게 한다"를 보여주지만, Domain Modeling은 "왜 이렇게 하는가"를 설명한다.

```
코드만 본 개발자: "이 메서드는 사용자를 업그레이드한다"
Domain Modeling으로 본 개발자: "이 메서드는 연간 구매액이 임계값을 넘으면, 
                         멤버십 등급을 한 단계 올리고, 
                         변경일을 기록하고, 
                         새로운 혜택을 적용한다"
```

### 2. 경계가 명확해진다

각 마이크로서비스나 모듈이 어디까지 책임져야 하는지 알 수 있다.

### 3. 새로운 기능을 추가할 때 올바른 위치에 추가할 수 있다

"VIP 회원을 위한 특별 할인"이라는 기능이 생겼다면:
- 코드 구조만 봐서는 어디에 추가해야 할지 모른다
- Domain Modeling으로 이해한다면, 어떤 Bounded Context에 속하는지, 다른 Context와 어떻게 통신해야 하는지 알 수 있다

### 4. 기술 부채를 식별할 수 있다

```
"왜 이 부분이 이렇게 복잡한가?"

Core Domain이라면:
→ 비즈니스 규칙이 복잡해서다. 리팩토링해도 복잡할 수밖에 없다.
  대신 테스트를 철저히 하자.

Supporting Domain인데 복잡하다면:
→ 개선 기회가 있다. 자동화나 표준화를 고려하자.

Generic Domain인데 복잡하다면:
→ 라이브러리나 서비스로 교체하는 게 나을 수 있다.
```

---

## Domain Modeling과 이전 4단계의 연결

이제 전체 그림이 보인다.

```
1. Observability: 시스템이 지금 뭘 하는지 본다
   → 로그에서 "멤버십 등급 변경 이벤트"를 발견

2. Distributed Tracing: 요청이 어떻게 흘러가는지 따라간다
   → 멤버십 업그레이드 요청이 3개 서비스를 거쳐 간다

3. Reverse Engineering: 동작에서 설계의 의도를 추론한다
   → "왜 3개 서비스로 나뉘어 있을까?" 궁금해진다

4. Domain Modeling: 비즈니스 도메인을 이해한다
   → 각 서비스가 다른 Bounded Context를 담당한다는 걸 안다

5. 이제 비로소 코드를 수정할 때 올바른 판단을 할 수 있다
```

---

## 정리: 시스템보다 먼저 도메인을 이해하라

미지의 시스템을 맡았을 때:

1. **도메인 전문가를 찾아서 대화한다**
   - "이 시스템이 해결하는 비즈니스 문제가 뭔가?"
   - "이 개념들은 무엇을 의미하는가?"

2. **Ubiquitous Language를 배운다**
   - 비즈니스팀이 사용하는 용어를 정확히 알아둔다
   - 코드에서 그 용어가 올바르게 사용되었는지 확인한다

3. **Bounded Context를 파악한다**
   - 시스템의 영역들을 비즈니스 의미로 나눈다
   - 경계 간의 상호작용을 본다

4. **Core/Supporting/Generic Domain을 구분한다**
   - 어디에 가장 신경을 써야 하는지 알 수 있다

5. **Entity와 Value Object를 구분한다**
   - 코드 구조가 비즈니스 의미를 올바르게 반영하는지 확인한다

이 모든 과정이 결국은 **코드가 아니라 도메인을 먼저 이해**하는 것이다. 도메인을 이해하면, 복잡한 시스템도 의미 있는 구조로 보인다.

---

*관련 포스트: [[understanding-complex-systems|우리는 미지의 시스템을 어떻게 이해하는가]] · [[observability-seeing-invisible-systems|Observability: 보이지 않는 시스템을 보는 기술]] · [[distributed-tracing-following-service-traces|Distributed Tracing: 서비스의 발자취를 따라가기]] · [[reverse-engineering-understanding-systems-without-documentation|Reverse Engineering: 문서 없는 시스템 읽기]]*
