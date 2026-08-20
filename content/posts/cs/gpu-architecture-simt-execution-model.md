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
