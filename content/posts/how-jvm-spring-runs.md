---
title: HW부터 JVM + Spring까지 — 서버 실행 구조
date: 2026-04-05
updated: 2026-04-05
tags:
  - java
  - jvm
  - spring
  - spring-boot
  - tomcat
  - jit
  - bytecode
  - classloader
  - garbage-collection
  - thread
  - http
  - operating-system
  - systems
  - hardware
  - kernel
summary: "하드웨어 네트워크 카드부터 JVM 위의 Spring Boot HTTP 요청이 처리되기까지의 전 과정 도식화"
devto: false
devto_id:
devto_url:
---

# HW부터 JVM + Spring까지 — 서버 실행 구조

## 한 문장 요약

**NIC → OS TCP 스택 → Tomcat/NIO 커넥터 → JVM 스레드 → Spring DispatcherServlet → 애플리케이션 코드 → 응답**

---

## 전체 실행 스택 (HTTP 요청 기준)

```
┌─────────────────────────────────────────────────────┐
│  클라이언트 (브라우저 / 앱 / curl)                  │
│  GET /users HTTP/1.1                                │
└──────────────────────┬──────────────────────────────┘
                       │  TCP 패킷
                       ▼
┌─────────────────────────────────────────────────────┐
│  NIC (Network Interface Card)                       │
│  - 전기/광 신호를 디지털 패킷으로 변환              │
│  - DMA로 패킷을 RAM에 적재                          │
│  - 인터럽트 또는 polling으로 CPU에 수신 알림        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  OS 커널 네트워크 스택                               │
│                                                     │
│  이더넷 → IP → TCP → 소켓 버퍼(fd)에 데이터 적재    │
│                                                     │
│  Java 서버는 socket fd를 epoll/kqueue/select로 감시 │
│  → 읽기 가능 이벤트 발생                            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  JVM 프로세스 시작                                   │
│                                                     │
│  java -jar app.jar                                  │
│    ↓                                                │
│  OS 로더가 JVM 바이너리 실행                         │
│    ↓                                                │
│  JVM이 힙/메타스페이스/스레드 스택 등 런타임 준비    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  클래스 로딩 + 바이트코드 검증                        │
│                                                     │
│  .class 파일 (Java 바이트코드)                       │
│    ↓ ClassLoader                                     │
│  Bootstrap → Platform → AppClassLoader              │
│    ↓                                                 │
│  Bytecode Verifier                                   │
│  - 타입 안정성 확인                                  │
│  - 스택 언더플로우/오버플로우 검사                   │
│  - 불법 메모리 접근 방지                             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  JVM 실행 엔진                                        │
│                                                     │
│  1. 처음에는 인터프리터가 바이트코드 실행            │
│  2. 자주 실행되는 Hot Method 감지                    │
│  3. C1/C2 JIT 컴파일러가 기계어 생성                 │
│                                                     │
│  예시 바이트코드:                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  iload_1                                     │   │
│  │  iload_2                                     │   │
│  │  iadd                                        │   │
│  │  ireturn                                     │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  → [[how-javascript-runs|JS JIT]]와 비슷하게         │
│    반복 코드는 네이티브로 최적화                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Spring Boot 부트스트랩                              │
│                                                     │
│  main() → SpringApplication.run()                   │
│      ↓                                              │
│  ApplicationContext 생성                            │
│      ↓                                              │
│  Bean 정의 스캔 (@Component, @Service, @Controller) │
│      ↓                                              │
│  의존성 주입(DI)으로 싱글턴 Bean 초기화             │
│      ↓                                              │
│  내장 Tomcat/Jetty/Undertow 서버 시작               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Tomcat / Servlet 컨테이너                           │
│                                                     │
│  Acceptor 스레드: 새 TCP 연결 수락                  │
│  Poller/NIO: 읽기 가능한 소켓 감시                  │
│  Worker 스레드: 요청을 하나 가져와 처리             │
│                                                     │
│  전통적인 Servlet 모델:                              │
│  요청 1개 ↔ 작업 스레드 1개                          │
│  DB나 외부 API를 기다리는 동안 해당 스레드는 점유    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Spring MVC 요청 처리 파이프라인                      │
│                                                     │
│  HTTP 요청                                           │
│    ↓                                                │
│  Filter (서블릿 레벨 전처리)                         │
│    ↓                                                │
│  DispatcherServlet                                  │
│    ↓                                                │
│  HandlerMapping  → 어떤 Controller 메서드인지 결정  │
│    ↓                                                │
│  HandlerAdapter  → 메서드 인자 바인딩               │
│    ↓                                                │
│  @Controller / @RestController 메서드 실행          │
│    ↓                                                │
│  @Service / Repository 호출                          │
│    ↓                                                │
│  HttpMessageConverter로 JSON 직렬화                 │
│    ↓                                                │
│  HttpServletResponse.write()                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  JVM 메모리 구조                                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Heap                                         │   │
│  │  - Young Generation (Eden, Survivor)         │   │
│  │  - Old Generation                            │   │
│  │                                              │   │
│  │  Metaspace                                   │   │
│  │  - 클래스 메타데이터                         │   │
│  │                                              │   │
│  │  Thread Stack                                │   │
│  │  - 메서드 프레임, 지역변수, 리턴 주소         │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  GC가 사용 안 하는 객체를 회수                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  응답 전송                                           │
│                                                     │
│  Tomcat이 응답 바이트를 소켓에 write                │
│    ↓                                                │
│  커널 TCP 버퍼 → NIC → 클라이언트                   │
└─────────────────────────────────────────────────────┘
```

---

## 바이트코드에서 기계어까지

```
UserService.class
  ↓ ClassLoader
JVM Method Area / Metaspace 등록
  ↓ Interpreter
Java 바이트코드 한 줄씩 실행
  ↓ HotSpot 프로파일링
  - 호출 횟수
  - 분기 패턴
  - 타입 정보
  ↓ C1/C2 JIT 컴파일
네이티브 기계어 캐시
  ↓
CPU Fetch-Decode-Execute

핵심:
  Java는 "한 번 컴파일해서 어디서나 실행"이지만
  실제 실행 시점에는 JVM이 다시 해석/JIT 최적화를 수행한다.
```

---

## Spring이 Controller를 호출하는 과정

```
GET /users
  ↓
Tomcat Worker Thread
  ↓
FilterChain
  ↓
DispatcherServlet
  ↓
RequestMappingHandlerMapping
  ↓
UsersController#getUsers()
  ↓
UserService#getUsers()
  ↓
UserRepository.findAll()
  ↓
Jackson ObjectMapper
  ↓
HTTP Response Body
```

Spring 핵심 포인트:
  - DispatcherServlet이 모든 요청의 중앙 진입점
  - HandlerMapping이 URL과 메서드를 연결
  - DI 컨테이너가 Controller/Service/Repository를 미리 생성

---

## Node.js 서버와 비교하면

```
Node.js:
  이벤트 루프 1개가 많은 연결을 번갈아 처리
  I/O 대기 중에는 다른 콜백 실행

Spring MVC:
  요청당 작업 스레드 1개를 점유하는 모델이 기본
  코드 흐름은 직선적이고 디버깅이 쉬움

고부하 환경 차이:
  Node.js  → 적은 스레드 + 논블로킹 I/O
  Spring   → 더 많은 스레드 + 커넥션 풀 + 튜닝
```

WebFlux는 예외:
  Spring도 WebFlux + Netty 조합이면 이벤트 루프 기반으로 동작 가능.
  하지만 가장 흔한 Spring Boot 기본 구조는 Tomcat + Servlet 스레드 모델.

---

## 핵심 요약

```
GET /users 요청
  ↓ NIC (패킷 수신)
  ↓ OS TCP 스택 (소켓 버퍼)
  ↓ Tomcat NIO 커넥터 (연결 수락 + 워커 할당)
  ↓ JVM 스레드에서 Spring DispatcherServlet 실행
  ↓ Controller → Service → Repository
  ↓ Jackson JSON 직렬화
  ↓ 소켓 write() → NIC → 클라이언트

동시에 JVM 내부에서는:
  .class 바이트코드 로딩
  ↓ 인터프리터 실행
  ↓ Hot Code는 JIT 컴파일
  ↓ GC가 힙 메모리 관리

핵심: Spring은 직접 CPU 위에서 실행되지 않는다.
      JVM이 바이트코드를 해석/JIT하고,
      Spring은 그 위에서 HTTP 요청 처리 구조를 제공한다.
```
