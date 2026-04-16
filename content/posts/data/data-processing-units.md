---
title: 데이터를 묶어서 처리하는 단위들
date: 2026-04-04
updated: 2026-04-04
tags:
  - storage
  - networking
  - operating-system
  - database
  - fundamentals
  - systems
  - performance
  - data-formats
  - layers
summary: 스토리지, 네트워크, CPU/메모리, DB, 파일시스템, 메시지큐까지 레이어별로 데이터 처리 단위를 한눈에 정리한다
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

# 데이터를 묶어서 처리하는 단위들 

_written by Claude-Code_

## 왜 "묶어서" 처리하는가?

컴퓨터는 데이터를 1바이트씩 처리하지 않는다.  
1바이트씩 처리하면 **I/O 횟수**가 폭발적으로 늘고, 그만큼 시간이 낭비된다.

> **핵심 원리**: 각 레이어는 자신에게 적합한 크기로 데이터를 묶어 한 번에 처리한다.  
> 이 묶음 단위가 작으면 오버헤드가 크고, 크면 불필요한 데이터까지 읽게 된다.

모든 레이어는 이 트레이드오프를 자신만의 단위로 해결한다.

---

## 레이어 전체 지도

```
애플리케이션 레이어  →  Message / Record / Event
      ↓
메시지큐 레이어      →  Message / Batch / Partition Segment
      ↓
네트워크 레이어      →  Frame / Packet / Segment / Datagram
      ↓
OS / 파일시스템      →  File / Cluster / Block / Page
      ↓
스토리지 레이어      →  Extent / Block / Sector / Bit
      ↓
CPU / 메모리 레이어  →  Cache Line / Page / Word / Byte / Bit
      ↓
DB 레이어           →  Tablespace / Segment / Extent / Page / Row
```

---

## 1. 스토리지 레이어

디스크(HDD/SSD)가 데이터를 읽고 쓰는 물리적 단위들이다.

```
┌──────────────────────────────────────────────────┐
│  Tablespace / Volume                             │
│  ┌───────────────────────────────────────────┐  │
│  │  Segment                                  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Extent (연속된 Block 묶음)          │  │  │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐        │  │  │
│  │  │  │Block │ │Block │ │Block │  ...   │  │  │
│  │  │  │ 4KB  │ │ 4KB  │ │ 4KB  │        │  │  │
│  │  │  └──┬───┘ └──────┘ └──────┘        │  │  │
│  │  │     │                               │  │  │
│  │  │  ┌──▼────────────────────────────┐  │  │  │
│  │  │  │ Sector 512B | Sector 512B | …  │  │  │  │
│  │  │  └───────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

| 단위 | 일반 크기 | 설명 |
|------|----------|------|
| **Bit** | 1 bit | 0 또는 1, 물리적 최소 단위 |
| **Byte** | 8 bit | 문자 하나, 주소 지정 최소 단위 |
| **Sector** | 512B ~ 4KB | 디스크 물리 최소 R/W 단위 |
| **Block** | 4KB ~ 64KB | OS·파일시스템 I/O 단위, Sector 묶음 |
| **Cluster** | Block 묶음 | Windows NTFS의 파일 할당 단위 |
| **Extent** | Block 연속 묶음 | 미리 예약된 연속 공간, 단편화 방지 |

> **Sector vs Block**: Sector는 디스크가 아는 단위, Block은 OS가 아는 단위다.  
> 1바이트를 수정해도 Block 전체를 읽어 수정 후 다시 쓴다.

---

## 2. CPU / 메모리 레이어

CPU가 데이터를 연산하고 캐시에 올리는 단위들이다.

```
CPU
 ├── Register (1 Word)
 ├── L1 Cache  ← Cache Line 단위로 채워짐 (64B)
 ├── L2 Cache
 └── L3 Cache
        ↕ (Page 단위 스왑)
RAM  ← Page 단위로 관리 (4KB)
        ↕ (Page Fault 시)
Disk (스왑 영역)
```

| 단위 | 일반 크기 | 설명 |
|------|----------|------|
| **Bit** | 1 bit | 전기 신호 하나 |
| **Byte** | 8 bit | 주소 지정 기본 단위 |
| **Word** | 4B (32bit) / 8B (64bit) | CPU가 한 번에 처리하는 크기 |
| **Cache Line** | 64B | CPU가 캐시에 올리는 최소 단위 |
| **Page** | 4KB (보통) | 가상 ↔ 물리 메모리 매핑 단위 |
| **Huge Page** | 2MB ~ 1GB | 대용량 메모리 최적화용 Page |

> **Cache Line의 함정**: 배열을 순서대로 접근하면 Cache Line 덕에 빠르다.  
> 하지만 열(column) 방향으로 접근하면 Cache Line을 매번 새로 불러와 느려진다.

---

## 3. OS / 파일시스템 레이어

OS가 파일과 프로세스 메모리를 관리하는 단위들이다.

### 파일시스템

| 단위 | 설명 |
|------|------|
| **File** | 데이터의 논리적 묶음, 이름·메타데이터 포함 |
| **Block / Cluster** | 파일 저장의 최소 할당 단위 |
| **Inode** | 파일 메타데이터 구조체 (Unix) |
| **Directory** | 파일 이름 → Inode 매핑 테이블 |

### 프로세스 메모리 (세그멘테이션)

```
프로세스 주소 공간
┌─────────────────┐  높은 주소
│   Stack Segment │  ← 함수 호출, 로컬 변수 (위→아래 성장)
├─────────────────┤
│       ↓         │
│       ↑         │
├─────────────────┤
│   Heap Segment  │  ← 동적 할당 (아래→위 성장)
├─────────────────┤
│   BSS Segment   │  ← 초기화되지 않은 전역 변수
├─────────────────┤
│  Data Segment   │  ← 초기화된 전역·정적 변수
├─────────────────┤
│  Text Segment   │  ← 실행 코드 (읽기 전용)
└─────────────────┘  낮은 주소
```

| 단위 | 설명 |
|------|------|
| **Page** | 가상 메모리 관리 기본 단위 (4KB) |
| **Segment** | 역할별 메모리 영역 (코드/데이터/스택/힙) |
| **Region / VMA** | 연속 Page 묶음, Linux의 가상 메모리 영역 |
| **Buffer** | I/O 대기 중인 임시 데이터 영역 |
| **Chunk** | malloc이 관리하는 힙 할당 단위 |

---

## 4. 네트워크 레이어

OSI 7계층에 따라 각 레이어마다 자신만의 전송 단위가 있다.

```
L7 응용 계층     →  Message (HTTP, DNS, WebSocket)
L6 표현 계층     →  (TLS Record)
L5 세션 계층     →  (세션 관리)
L4 전송 계층     →  Segment (TCP) / Datagram (UDP)
L3 네트워크 계층 →  Packet (IP)
L2 데이터링크   →  Frame (Ethernet)
L1 물리 계층    →  Bit (전기/광 신호)
```

| 단위 | 레이어 | 일반 크기 | 설명 |
|------|--------|----------|------|
| **Bit** | L1 | 1 bit | 물리 신호 |
| **Frame** | L2 | 최대 1518B | 이더넷 전송 단위, MAC 주소 포함 |
| **Packet** | L3 | 최대 65535B | IP 전송 단위, IP 주소 포함 |
| **Segment** | L4 TCP | 최대 ~64KB | TCP 전송 단위, 순서·재조합 보장 |
| **Datagram** | L4 UDP | 최대 65507B | UDP 전송 단위, 순서 보장 없음 |
| **TLS Record** | L5~L6 | 최대 16KB | 암호화된 전송 블록 |
| **Message** | L7 | 가변 | HTTP 요청/응답, WebSocket 메시지 등 |

> **MTU(최대 전송 단위)**: 이더넷 기본 MTU는 1500B.  
> Packet이 이보다 크면 **단편화(Fragmentation)**가 발생한다.

---

## 5. DB 레이어

DB는 자체적인 계층 구조로 데이터를 관리한다.

```
Tablespace (물리 파일 묶음)
  └── Segment (테이블 or 인덱스)
        └── Extent (연속 Page 묶음, 선할당)
              └── Page (DB I/O 기본 단위, 8KB~16KB)
                    └── Row (실제 데이터 행)
```

| 단위 | 일반 크기 | 설명 |
|------|----------|------|
| **Row / Record** | 가변 | 실제 데이터 한 행 |
| **Page / Block** | 8KB ~ 16KB | DB I/O 기본 단위 |
| **Extent** | Page 8~128개 | 연속 할당 공간, 단편화 방지 |
| **Segment** | Extent 묶음 | 테이블·인덱스·언두 등 논리 영역 |
| **Tablespace** | Segment 묶음 | 물리 파일과 연결되는 최상위 단위 |

> MySQL InnoDB 기준: Page=16KB, Extent=1MB(64 pages), Segment는 동적 확장

---

## 6. 메시지큐 레이어

Kafka, RabbitMQ 같은 메시지 브로커는 자체 단위를 사용한다.

### Kafka 기준

```
Cluster
  └── Topic
        └── Partition
              └── Segment (파일)
                    └── Record (메시지 하나)
```

| 단위 | 설명 |
|------|------|
| **Record / Message** | 메시지 하나 (Key + Value + Timestamp) |
| **Batch** | 네트워크 효율을 위해 묶은 Record 묶음 |
| **Segment** | Partition 내 실제 파일 단위 (기본 1GB) |
| **Partition** | 병렬 처리를 위한 Topic 분할 단위 |
| **Topic** | 메시지 분류 채널 |

> Kafka는 Segment 단위로 파일을 생성하고, 보존 기간이 지나면 Segment 단위로 삭제한다.

---

## 7. 스트리밍 / 미디어 레이어

오디오·비디오 스트리밍도 자체 단위를 사용한다.

| 단위 | 설명 |
|------|------|
| **Sample** | 오디오 최소 단위 (특정 시점의 진폭 값) |
| **Frame** | 비디오 이미지 한 장 / 오디오 샘플 묶음 |
| **GOP (Group of Pictures)** | 비디오 키프레임 + 델타프레임 묶음 |
| **Chunk / Segment** | HLS/DASH 스트리밍 분할 파일 (2~10초) |
| **Buffer** | 재생 끊김 방지를 위한 미리 로드 공간 |

> HLS(HTTP Live Streaming)는 영상을 Segment(`.ts` 파일)로 잘라 전송하고,  
> 클라이언트는 Buffer에 여러 Segment를 미리 쌓아 재생한다.

---

## 전체 비교 요약

| 레이어 | 주요 단위 (작은 것 → 큰 것) | 핵심 목적 |
|--------|---------------------------|----------|
| **스토리지** | Bit → Sector → Block → Extent | 물리 I/O 효율 |
| **CPU/메모리** | Bit → Byte → Word → Cache Line → Page | 연산·캐시 효율 |
| **OS/파일시스템** | Page → Segment → Region | 메모리 보호·관리 |
| **네트워크** | Bit → Frame → Packet → Segment → Message | 전송 신뢰성·효율 |
| **DB** | Row → Page → Extent → Segment → Tablespace | 데이터 접근·관리 |
| **메시지큐** | Record → Batch → Segment → Partition | 처리량·순서 보장 |
| **미디어** | Sample → Frame → GOP → Chunk | 스트리밍 연속성 |

---

## 공통 패턴

모든 레이어에 반복되는 원리가 있다.

**1. 묶음 크기와 오버헤드는 반비례**  
단위가 작을수록 정밀하지만 오버헤드가 커진다.  
단위가 클수록 효율적이지만 불필요한 데이터를 함께 읽는다.

**2. 계층 구조**  
작은 단위 → 묶어서 → 큰 단위.  
Bit → Byte → Word → Cache Line → Page처럼 아래가 위를 구성한다.

**3. 같은 이름, 다른 맥락**  
`Page`는 OS(4KB), DB(8~16KB), 네트워크(없음)에서 크기가 다 다르다.  
`Segment`는 메모리 영역, TCP 전송 단위, DB 논리 공간, Kafka 파일을 모두 가리킨다.  
레이어를 먼저 확인해야 이름의 의미가 명확해진다.
