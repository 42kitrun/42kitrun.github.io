---
title: GPU는 왜 병렬 연산에 강한가 — CPU와의 구조 차이와 SIMT 실행 모델
date: 2026-07-21
updated: 2026-08-21
tags:
  - gpu
  - cpu
  - gpu-architecture
  - cpu-architecture
  - simd
  - simt
  - warp
  - thread-block
  - streaming-multiprocessor
  - cuda
  - gpgpu
  - parallel-computing
  - memory-hierarchy
  - shared-memory
  - global-memory
  - register
  - computer-hardware
  - fundamentals
  - cuda-core
  - tensor-core
  - l2-cache
  - nvidia
  - amd
  - intel
  - apple
  - apple-silicon
related_projects: []
summary: "CPU-GPU 구조 차이, SIMT 실행 모델과 워프, SM 구성, 제조사별(NVIDIA·AMD·Intel·Apple) 구조 비교, 메모리 계층까지 GPU의 핵심 구조를 표로 정리한다"
ai_agent: Claude-Code, ChatGPT
devto: false
devto_id:
devto_url:
---

# GPU는 왜 병렬 연산에 강한가 — CPU와의 구조 차이와 SIMT 실행 모델

_written by Claude-Code,ChatGPT_

## 배경: 작전명 AI, 코드네임 23 — 세번째 미션

[[semiconductor-chip-types-and-gpgpu|이전 미션]]에서 반도체 칩을 메모리반도체와 시스템반도체로 나누고, GPU가 그래픽 처리를 넘어 범용 연산에 쓰이는 GPGPU 개념까지 훑었다. 이번 미션은 GPU 안에서 무슨 일이 일어나길래 병렬 연산에 강한지, 핵심 구조만 짚고 넘어간다.

![GPU 아키텍처: 처리량을 만드는 구조 — CPU 비교, SM 내부, 메모리 계층|800](/assets/posts/cs/gpu-architecture-simt-execution-model/gpu-architecture-overview.png)

이 인포그래픽 한 장에 CPU-GPU 비교, SM 내부 구성, 메모리 계층, 제조사별 명칭까지 이 글에서 다룰 내용이 요약되어 있다.

세번째 미션의 범위는 셋이다. CPU와 GPU의 설계 목표 차이, GPU가 수천 개의 코어를 다루는 SIMT 실행 모델, 그리고 그 위에 얹힌 메모리 계층.

## CPU와 GPU, 설계 목표부터 다르다

CPU와 GPU는 둘 다 연산을 담당하는 시스템반도체지만 다이 면적을 쓰는 방식이 반대다. CPU는 제어 로직과 캐시에 면적 대부분을 쓰고, GPU는 ALU(연산 유닛)에 면적 대부분을 쓴다. CPU는 작업 하나를 최대한 빨리 끝내는 지연시간 최소화를, GPU는 작업 전체를 최대한 많이 동시에 끝내는 처리량 극대화를 목표로 삼는다.

| 구분 | CPU | GPU |
|------|-----|-----|
| 다이 면적 비중 | Control·Cache 위주 | ALU 위주 |
| 코어 수 | 수 개 ~ 수십 개 | 수천 개 |
| 코어 하나의 성능 | 강력함(분기 예측, OoO 실행) | 단순함 |
| 캐시 | 크고 다단계(L1/L2/L3) | 작음, 공유 자원 |
| 강점 | 복잡한 제어 흐름, 순차 처리 | 동일 연산의 대량 병렬 처리 |
| 설계 목표 | 지연시간(Latency) 최소화 | 처리량(Throughput) 극대화 |

## SIMT와 워프 — 명령어 하나로 수천 스레드를 묶는다

SIMT(Single Instruction, Multiple Thread)는 명령어 하나로 여러 스레드를 동시에 실행하는 모델이다. 스레드 하나하나가 독립된 흐름을 가진 것처럼 코드를 짜지만, 하드웨어는 스레드를 묶어 같은 명령어를 동시에 실행한다.

이 묶음의 크기가 워프(Warp)다. NVIDIA GPU에서 워프는 32개의 스레드로 구성되고, 워프 안의 스레드는 항상 같은 명령어를 같은 사이클에 실행하는 락스텝(lockstep) 방식으로 움직인다.

워프 안에서 조건문 결과가 스레드마다 다르면 참인 경로와 거짓인 경로를 순차적으로 나눠 실행해야 한다. 이를 워프 분기(Warp Divergence)라 부르고, 분기가 갈릴수록 워프의 실질 처리량은 그만큼 줄어든다.

스레드가 코드 상에서 다뤄지는 계층은 다음과 같이 쌓인다.

| 단위 | 설명 |
|------|------|
| 스레드(Thread) | 가장 작은 실행 단위, 데이터 하나를 처리 |
| 워프(Warp) | 스레드 32개를 하드웨어가 묶어 스케줄링하는 단위 |
| 스레드 블록(Thread Block) | 워프 여러 개의 묶음, 하나의 SM에서 실행되며 공유 메모리를 함께 씀 |
| 그리드(Grid) | 스레드 블록 전체의 묶음, 커널 하나를 실행할 때 생성 |

## SM 내부 구조와 제조사별 비교

SM(Streaming Multiprocessor)은 워프가 실제로 실행되는 연산 장치 묶음이다. 같은 스레드 블록에 속한 스레드는 하나의 SM 위에서 실행된다. 아래는 NVIDIA를 기준으로 그 내부를 펼친 구성이다.

| 구성 요소 | 역할 |
|-----------|------|
| 워프 스케줄러 | 매 사이클마다 실행 준비된 워프를 골라 실행 유닛에 배정 |
| CUDA Core | 일반 산술 연산 전담, 개수가 가장 많음 |
| Tensor Core | 행렬곱-누산(MAC) 전담, 딥러닝 연산 가속 |
| L1 캐시 / 공유 메모리 | SM 내부 온칩 자원, 블록 단위로 공유 |

이 SM에 해당하는 상위 묶음과 실행 단위의 이름은 제조사마다 다르다.

| 계층 | NVIDIA | AMD | Intel | Apple |
|------|--------|-----|-------|-------|
| 상위 묶음 | GPC → TPC | Shader Engine | Render Slice | 비공개 |
| 실행 단위 | SM | CU / WGP | Xe-core | GPU 코어 |

이름과 세부 구조는 다르지만, 병렬 연산 단위를 묶어 처리량을 높인다는 목적은 같다. NVIDIA·AMD·Intel은 독립형 그래픽카드로 판매되는 반면, Apple은 M 시리즈 칩에 GPU를 직접 통합해 별도 카드 없이 Metal API로 프로그래밍하며, CPU와 메모리를 공유하는 UMA(Unified Memory Architecture) 구조를 쓴다. 2026년 8월 현재 Apple Silicon은 M5 계열까지 확장됐고, M5 Pro·M5 Max에서는 GPU 코어 안에 Neural Accelerator를 넣어 온디바이스 AI 처리 비중을 더 키웠다.

## 메모리 계층

| 메모리 | 접근 범위 | 속도 | 관리 방식 |
|--------|-----------|------|-----------|
| 레지스터 | 스레드 1개 | 가장 빠름 | 스레드 전용, 하드웨어 자동 할당 |
| 공유 메모리 / L1 캐시 | 블록 1개 | 매우 빠름(온칩) | 공유 메모리는 수동 관리, L1은 하드웨어 자동 관리 |
| L2 캐시 | 칩 전체(모든 SM) | 빠름(온칩) | 하드웨어 자동 관리 |
| 글로벌 메모리(VRAM) | 그리드 전체 | 느림 | GPU 밖 DRAM |

행렬곱처럼 같은 데이터를 여러 스레드가 반복해서 읽는 연산에서는, 글로벌 메모리 접근을 공유 메모리 접근으로 바꾸는 것만으로 처리 속도가 크게 개선된다.

## 핵심 정리

- CPU는 제어 로직과 캐시에, GPU는 ALU에 다이 면적을 집중한다. 목표는 각각 지연시간 최소화와 처리량 극대화다.
- GPU는 SIMT 모델로 코어 수천 개를 관리한다. 스레드 32개를 워프로 묶어 같은 명령어를 락스텝으로 실행한다.
- 워프 안에서 분기가 갈리면(Warp Divergence) 경로를 순차 실행해야 해서 처리량이 떨어진다.
- 실행 단위는 스레드 → 워프 → 스레드 블록 → 그리드로 쌓이고, SM이 이를 물리적으로 스케줄링한다.
- SM(NVIDIA 기준) 안에는 CUDA Core와 Tensor Core가 역할을 나눠 맡는다. 실행 단위 이름은 제조사마다 다르지만(AMD의 CU/WGP, Intel의 Xe-core, Apple의 GPU 코어) 병렬 연산 단위를 묶어 처리량을 높인다는 목적은 같다.
- Apple은 독립형 그래픽카드 없이 M 시리즈 칩에 GPU를 통합하고, UMA로 CPU와 메모리를 공유한다. 2026년 8월 기준 최신 M5 계열은 GPU 안의 AI 가속 구조도 강화했다.
- 메모리는 레지스터 → 공유 메모리/L1 → L2 캐시 → 글로벌 메모리 순으로 범위가 넓어지고 속도는 느려진다.

## 관련 글

- [[semiconductor-chip-types-and-gpgpu|메모리반도체와 시스템반도체, 그리고 GPGPU]]
- [[parallelism-concurrency-context-switching|병렬성과 동시성, 그리고 컨텍스트 스위칭]]
- [[how-to-read-gpu-model-names|그래픽카드 모델명 읽는 법]]
