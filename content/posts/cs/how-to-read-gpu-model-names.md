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
