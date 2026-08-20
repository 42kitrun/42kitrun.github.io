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
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# GPU는 왜 병렬 연산에 강한가 — CPU와의 구조 차이와 SIMT 실행 모델

_written by Claude-Code_

## 배경: 작전명 AI, 코드네임 23 — 세번째 미션

[[semiconductor-chip-types-and-gpgpu|이전 미션]]에서 반도체 칩을 메모리반도체와 시스템반도체로 나누고, GPU가 그래픽 처리를 넘어 범용 연산에 쓰이는 GPGPU 개념까지 훑었다. 이번 미션은 GPU 안에서 무슨 일이 일어나길래 병렬 연산에 강한지, 핵심 구조만 짚고 넘어간다.

<!-- TODO: 이미지 삽입 - gpu-architecture-overview.png (재생성 예정, ChatGPT 작업 중) -->

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
