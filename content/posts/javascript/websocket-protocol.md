---
title: WebSocket 프로토콜과 HTTP 비교
date: '2026-04-01'
updated: '2026-04-01'
tags:
  - websocket
  - networking
  - protocol
  - real-time
  - http
  - web
  - ipc
  - osi
related_projects: []
summary: WebSocket 개념과 OSI 동작 방식, HTTP와의 차이, Unix Domain Socket과의 비교를 핵심만 정리
devto: false
devto_id: null
devto_url: null
ai_agent: Claude-Code
---
# WebSocket 프로토콜과 HTTP 비교

_written by Claude-Code_

## 1.  왜 궁금할까? (Why)

**배경:** iCON(AI 욕창 단계 분류) 앱은 모바일 ↔ 백엔드 통신에 **WebSocket**을 사용한다.

- 사용자가 이미지를 전송하면 모델이 **분류 결과 + 정확도**를 실시간으로 돌려준다.
- 단순 REST로도 가능하지만, **서버가 먼저 응답을 밀어줄 수 있는 양방향 채널**이 필요한 경우 WebSocket을 선택한다.

> 443이 아닌 별도 포트(~~메롱 궁금하냐 안알랴줌 ^^~~)를 쓰는 이유는 일반 HTTPS 트래픽과 AI 추론 트래픽을 **포트 레벨에서 분리**해 운영하기 위함이다.

---

## 2. WebSocket 개요 (What)

### 정의

> WebSocket은 **하나의 TCP 연결 위에서 양방향 전이중(Full-Duplex) 통신**을 제공하는 L7 애플리케이션 프로토콜이다. (RFC 6455, 2011)

HTTP 요청으로 시작해 프로토콜을 **Upgrade**한 뒤, 이후 메시지는 HTTP 없이 WebSocket 프레임으로만 주고받는다.

### OSI 7계층에서의 위치

```
┌─────────────────────────────────┐
│  7. 응용 계층 (Application)      │  ← WebSocket 프로토콜 (ws://, wss://)
│                                 │     HTTP도 여기에 위치
├─────────────────────────────────┤
│  6. 표현 계층 (Presentation)     │  ← TLS/SSL (wss:// 사용 시)
├─────────────────────────────────┤
│  5. 세션 계층 (Session)          │
├─────────────────────────────────┤
│  4. 전송 계층 (Transport)        │  ← TCP (WebSocket의 기반)
├─────────────────────────────────┤
│  3. 네트워크 계층 (Network)       │  ← IP
├─────────────────────────────────┤
│  2. 데이터링크 / 1. 물리 계층     │
└─────────────────────────────────┘
```

HTTP와 같은 L7에 위치하지만, 연결을 유지하며 **프레임 단위**로 데이터를 교환한다는 점이 다르다.

### 연결 수립 과정 (HTTP Upgrade)

```
1. 클라이언트 → 서버  (HTTP 요청)
   GET /ws HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZQ==

2. 서버 → 클라이언트  (101 Switching Protocols)
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

3. 이후 ── WebSocket 프레임으로만 통신 ──────────────
```

### 주요 특징

| 특징 | 설명 |
|------|------|
| 전이중 통신 | 클라이언트·서버 모두 언제든 메시지 전송 가능 |
| 지속 연결 | 한 번 연결하면 명시적으로 닫을 때까지 유지 |
| 낮은 오버헤드 | 핸드셰이크 이후 헤더 최소화 (2~10 바이트/프레임) |
| 이벤트 기반 | 폴링 없이 데이터 도착 시 즉시 처리 |
| 보안 | `wss://` = WebSocket over TLS (HTTPS처럼 암호화) |

### 실무에서 자주 쓰는 경우

| 케이스 | 예시 |
|--------|------|
| 실시간 채팅 | Slack, 카카오톡 웹 버전 |
| AI 추론 결과 스트리밍 | GPT 답변 스트리밍, 이미지 분류 결과 반환 |
| 실시간 알림 | 주문 상태, 배달 위치 |
| 협업 도구 | Google Docs 동시 편집 |
| 게임·금융 | 실시간 시세, 멀티플레이어 게임 |

### 장단점

| 구분 | 내용 |
|------|------|
| 장점 | 서버 Push 가능 → 폴링 불필요 |
| 장점 | 헤더 오버헤드 낮음 → 고빈도 통신에 유리 |
| 장점 | 지연 시간 최소화 |
| 단점 | 연결 유지 → 서버 리소스 점유 (접속자 수 비례) |
| 단점 | HTTP 캐싱·CDN 적용 불가 |
| 단점 | 로드밸런서에서 **Sticky Session** 또는 별도 설정 필요 |
| 단점 | REST보다 디버깅·모니터링 도구가 적음 |

---

## 2. HTTP vs WebSocket 비교

### 공통점

| 항목        | 설명                                         |
| --------- | ------------------------------------------ |
| 전송 계층     | 둘 다 TCP 위에서 동작                             |
| 핸드셰이크     | WebSocket은 **HTTP Upgrade 요청**으로 시작        |
| TLS 적용 가능 | `https://` → `wss://`, `http://` → `ws://` |

### 핵심 차이

```
HTTP (요청-응답)
  Client ──────────────────────────────────→ Server
  Client ←────────────────────────────────── Server
  (연결 끊김)
  Client ──────────────────────────────────→ Server  (재연결)
  ...

WebSocket (양방향 지속 연결)
  Client ──── HTTP Upgrade 핸드셰이크 ──────→ Server
         ←──────────────────────────────────
         ════════════════════════════════════ (연결 유지)
  Client ──── 이미지 전송 ──────────────────→ Server
  Client ←──── 분류 결과 + 정확도 ────────── Server
  Client ←──── 추가 메시지 ───────────────── Server  (서버 주도 가능)
```

| 구분 | HTTP/HTTPS | WebSocket |
|------|-----------|-----------|
| 연결 방식 | 요청마다 연결·해제 | 한 번 연결 후 유지 |
| 방향 | 클라이언트 → 서버 (단방향 요청) | 양방향 (서버 Push 가능) |
| 헤더 오버헤드 | 매 요청마다 수백 바이트 | 최초 핸드셰이크 이후 최소화 |
| 실시간성 | Polling/Long-polling으로 우회 | 네이티브 지원 |
| 상태 | Stateless | Stateful (세션 유지) |
| 기본 포트 | 80 / 443 | 80(ws) / 443(wss) / 커스텀 |

### HTTP가 더 적합한 경우

- 단순 CRUD, 조회 API → REST가 캐싱·표준화·로드밸런서 친화적
- 연결을 유지할 필요 없는 일회성 요청
- CDN 캐싱이 필요한 정적 콘텐츠

---

## 3. Unix Domain Socket과의 비교

> UDS에 대한 자세한 내용은 [[infrastructure/unix-domain-socket|Unix Domain Socket]] 포스트 참고.

```
통신 범위 기준

[같은 호스트 내부]          [네트워크 너머]
  Unix Domain Socket   ←→   WebSocket / HTTP
  파일 경로 (.sock)          URL (ws://, http://)
  커널 내부 버퍼             TCP 네트워크 스택
  네트워크 스택 우회          방화벽·포트 필요
```

| 구분 | Unix Domain Socket | WebSocket |
|------|--------------------|-----------|
| 계층 | OS 커널 IPC | L7 애플리케이션 프로토콜 |
| 통신 범위 | **동일 호스트 전용** | **네트워크 너머 가능** |
| 주소 | 파일 경로 (`.sock`) | `ws://host:port/path` |
| 실시간 양방향 | O | O |
| 용도 | 서버 내부 프로세스 간 (nginx↔gunicorn) | 클라이언트↔서버 (모바일↔백엔드) |

**iCON 아키텍처에서의 위치:**

```
[모바일 앱]
    │  WebSocket  ← 네트워크 구간
[백엔드 서버 / AI 추론 엔드포인트]
```

---

## 4. 언제 무엇을 쓸까?

| 상황 | 선택 |
|------|------|
| REST API, 단순 조회 | HTTP/HTTPS |
| 실시간 알림, 채팅, AI 추론 결과 스트리밍 | WebSocket |
| 서버 내부 nginx↔앱 서버 | Unix Domain Socket |
| 서버 내부 + 성능 최적화 불필요 | TCP localhost |

---

## 5. 마무리

- WebSocket은 HTTP 핸드셰이크로 시작하지만, 이후 **지속 연결·양방향 전이중**으로 전환된다.
- 실시간 응답이 필요한 AI 추론(이미지 → 분류 결과)처럼 **서버가 결과를 먼저 밀어줘야 하는 경우** 적합하다.
- UDS는 동일 호스트 IPC 최적화, WebSocket은 네트워크 너머 실시간 통신 — 이름에 "소켓"이 공통이지만 목적이 다르다.
