---
title: 그래픽카드 모델명 읽는 법
date: 2026-08-04
updated: 2026-08-20
tags:
  - gpu
  - graphics-card
  - nvidia
  - amd
  - intel
  - rtx
  - radeon
  - arc
  - naming-convention
  - gpu-selection
  - computer-hardware
summary: "NVIDIA RTX, AMD Radeon RX, Intel Arc의 그래픽카드 모델명 규칙을 표로 비교하며, 모델명만 봐도 성능 등급과 세대를 읽을 수 있도록 정리한다"
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# 그래픽카드 모델명 읽는 법

_written by Claude-Code_

## 배경: 작전명 AI, 코드네임 23 — 네번째 미션

[[gpu-architecture-simt-execution-model|이전 미션]]에서 GPU 내부 구조를 파고들었다. SM이 몇 개인지, SM 안에 CUDA Core와 Tensor Core가 어떻게 배치되는지, 워프가 어떻게 스케줄링되는지까지 확인했다. 그런데 정작 매장에 진열된 그래픽카드 앞에 서면 "RTX 4090", "RX 7900 XTX", "Arc A770" 같은 이름만 보일 뿐, 그 안의 SM 개수는 보이지 않는다.

<!-- TODO: 이미지 삽입 - gpu-naming-comparison.png (NVIDIA/AMD/Intel 3사 모델명 비교 인포그래픽) -->

이번 미션의 목표는 명확하다. 그래픽카드 모델명이 왜 GPU 모델명과 같은지 이해하고, NVIDIA·AMD·Intel 세 제조사의 명명규칙을 표로 정리해서 모델명만 보고도 세대와 성능 등급을 읽어내는 것이다.

## 그래픽카드 = GPU를 사는 것

그래픽카드와 GPU는 다른 대상이다. GPU는 실리콘 다이 위에 새겨진 연산 칩 한 개이고, 그래픽카드는 그 GPU에 전원 회로, VRAM, 냉각 장치, 출력 포트, 외장 케이스를 더한 완제품이다. 그런데도 매장에서 그래픽카드를 살 때 부르는 이름은 "RTX 4090"이다. 이는 그래픽카드 제조사(ASUS, MSI, Gigabyte 등)가 자체 브랜드명 대신 내부에 탑재된 GPU 모델명을 그대로 제품명으로 쓰기 때문이다. 즉 그래픽카드 이름은 GPU 이름과 같으며, 이 GPU 이름 안에 제조사·세대·성능 등급 정보가 압축되어 있다.

이제 이 압축된 정보를 제조사별로 풀어본다.

## NVIDIA RTX 명명규칙

NVIDIA GeForce RTX 시리즈의 모델명은 세대 코드, 성능 등급, 옵션 접미사 세 부분으로 구성된다. 앞 두 자리는 세대와 아키텍처를, 뒤 한 자리는 성능 계층을 나타낸다.

| 세대 | 코드 | 아키텍처 | 출시년 | 플래그십 | 고성능 | 중상위 | 중간 |
|------|------|---------|--------|---------|--------|--------|------|
| 20세대 | 20XX | Turing | 2018 | RTX 2080 Ti | RTX 2080 | RTX 2070 | RTX 2060 |
| 30세대 | 30XX | Ampere | 2020 | RTX 3090 | RTX 3080 | RTX 3070 | RTX 3060 |
| 40세대 | 40XX | Ada Lovelace | 2022 | RTX 4090 | RTX 4080 | RTX 4070 | RTX 4060 |
| 50세대 | 50XX | Blackwell | 2025(예정) | RTX 5090 | RTX 5080 | RTX 5070 | RTX 5060 |

뒷자리 숫자는 성능 계층을 나타낸다.

- **X0**: 플래그십. 해당 세대 최고 성능 (예: 4090)
- **X8**: 고성능 (예: 4080)
- **X7**: 중상위 (예: 4070)
- **X6**: 중간 (예: 4060)

같은 세대 안에서는 이 숫자가 클수록 성능이 높고, 세대가 바뀌면 아키텍처 이름도 Turing에서 Ampere, Ada Lovelace, Blackwell 순으로 함께 바뀐다.

## AMD Radeon RX 명명규칙

AMD Radeon RX 시리즈는 NVIDIA와 다른 체계를 쓴다. 모델명은 세대 숫자, 성능 등급, 옵션 접미사로 구성되며, 천의 자리가 아키텍처 세대를 나타낸다.

| 세대 | 코드대 | 아키텍처 | 출시년 | 플래그십 | 고성능 | 중상위 | 중간 |
|------|--------|---------|--------|---------|--------|--------|------|
| RDNA 1 | RX 5000 | RDNA | 2019 | RX 5700 XT | RX 5700 | RX 5600 XT | RX 5500 XT |
| RDNA 2 | RX 6000 | RDNA 2 | 2020 | RX 6900 XT | RX 6800 XT | RX 6700 XT | RX 6600 XT |
| RDNA 3 | RX 7000 | RDNA 3 | 2022 | RX 7900 XTX | RX 7900 XT | RX 7800 XT | RX 7700 XT |

접미사는 같은 등급 안에서의 세부 차이를 나타낸다.

- **XT**: 기본형보다 클럭과 메모리 대역폭을 높인 상위 버전
- **XTX**: 해당 세대에서 가장 높은 사양, 플래그십 전용 표기

백의 자리 숫자가 성능 계층을 구분하는 방식은 NVIDIA와 비슷하지만, RDNA라는 아키텍처 이름이 세대 이름과 그대로 겹쳐 쓰인다는 점이 다르다.
