---
title: CPU 모델명 읽는 법
date: 2026-08-21
updated: 2026-08-21
tags:
  - cpu
  - cpu-naming
  - cpu-architecture
  - intel
  - amd
  - arm
  - isa
  - x86
  - apple-silicon
  - m-series
  - ryzen
  - xeon
  - snapdragon
summary: "Intel, AMD, ARM 기반, Apple 네 계열의 CPU 모델명 구조를 표로 정리해 이름만 보고 세대와 성능 등급을 읽는 법을 다룬다"
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# CPU 모델명 읽는 법

_written by Claude-Code_

## 배경: 작전명 AI("AI" stands for "Actually Individuals"), 코드네임 23 — 여섯번째 미션

[[cpu-structure|이전 미션]]에서는 CPU가 명령어를 가져오고 해석하고 실행하는 내부 구조를 살펴봤다. 이번 미션은 그 구조를 만드는 제조사들이 자사 칩에 어떤 이름을 붙이는지, 그 이름 안에 어떤 정보가 담겨 있는지 정리한다.

<!-- TODO: 이미지 삽입 - CPU 모델명 구조 비교 인포그래픽 -->

## 두 계열로 나뉘는 명령어 집합 구조(ISA)

CPU는 크게 x86-64 계열과 ARM 계열로 나뉜다. 어떤 ISA를 쓰느냐가 제조사와 모델명 체계를 가른다.

| ISA | 제조사 | 대표 제품군 | 주 용도 |
|-----|--------|-------------|---------|
| x86-64 | Intel, AMD | Core, Ryzen, Xeon, EPYC | 데스크톱, 노트북, 서버 |
| ARM | Apple, Qualcomm, MediaTek | M 시리즈, Snapdragon, Dimensity | 모바일, 맥, 임베디드 |

## Intel

| 요소 | 의미 | 예시 |
|------|------|------|
| 라인 | 성능 등급 순서 | i3 < i5 < i7 < i9 |
| 세대 | 세대 숫자 (앞 2자리) | i7-**13**700K = 13세대 |
| SKU | 같은 등급 내 성능 차이 | 700이 500보다 상위 |
| 접미사 K | 오버클럭 가능 | 13700**K** |
| 접미사 F | 내장그래픽 없음 | 13700**F** |
| 접미사 H/U | 모바일용 (고성능/저전력) | 13700**H** |

서버용은 Xeon이며 Platinum > Gold > Silver > Bronze 순으로 등급이 나뉜다.

## AMD

| 요소 | 의미 | 예시 |
|------|------|------|
| 라인 | 성능 등급 순서 | 3 < 5 < 7 < 9 |
| 세대 | 세대 숫자 (첫 자리) | Ryzen **5**800X = 5세대 |
| SKU | 같은 등급 내 성능 차이 | 800이 600보다 상위 |
| 접미사 X | 고클럭 | 5800**X** |
| 접미사 X3D | 대용량 캐시 추가 | 5800**X3D** |
| 접미사 G | 내장그래픽 포함 | 5600**G** |

서버용은 EPYC이며 코어 수와 세대 코드명(Genoa, Bergamo 등)으로 구분한다.

## ARM 기반: Qualcomm, MediaTek

ARM은 설계만 제공하고, 실제 칩은 Qualcomm이나 MediaTek 같은 제조사가 만든다.

| 제조사 | 라인 | 세대 표기 | 예시 |
|--------|------|-----------|------|
| Qualcomm | Snapdragon | 등급 + Gen 번호 | Snapdragon **8** Gen **3** |
| MediaTek | Dimensity | 4자리 모델 번호 | Dimensity **9300** |

Snapdragon은 8(플래그십) > 7(중상급) > 6, 4(보급형) 순으로 등급이 나뉘고, Gen 뒤 숫자가 세대다.

## Apple

| 요소 | 의미 | 예시 |
|------|------|------|
| 세대 | M 뒤 숫자 | M**4** |
| 성능 계층 | 기본 < Pro < Max < Ultra | M4 **Pro** |

기본은 일상 작업, Pro는 전문 작업, Max는 영상·3D 작업, Ultra는 최고 성능이 필요한 작업에 대응한다.

## 제조사별 비교

| 기준 | Intel | AMD | Qualcomm | Apple |
|------|-------|-----|----------|-------|
| 세대 표기 | 앞 2자리 숫자 | 첫 자리 숫자 | Gen 뒤 숫자 | M 뒤 숫자 |
| 성능 등급 | i3~i9 | 3~9 | 4~8 | 기본~Ultra |
| 접미사 | K, F, H, U | X, X3D, G | 없음 | Pro, Max, Ultra |
| 서버 라인 | Xeon | EPYC | 해당 없음 | 해당 없음 |

## 핵심 정리

- CPU는 x86-64(Intel, AMD)와 ARM(Apple, Qualcomm, MediaTek) 두 계열로 나뉜다.
- Intel과 AMD는 등급 숫자 + 세대 숫자 + SKU + 접미사로 모델명을 구성한다.
- Qualcomm은 등급 + Gen 번호로, Apple은 세대 + 성능 계층(Pro/Max/Ultra)으로 구성한다.
- 제조사가 달라도 숫자가 클수록 상위 등급 또는 최신 세대라는 원칙은 동일하다.

작전명 AI, 코드네임 23의 여섯번째 미션은 여기까지다. CPU 이름 하나를 봤을 때 어느 계열이고, 어느 등급이고, 몇 세대인지 세 가지만 분리해서 읽으면 나머지는 자연스럽게 따라온다.

## 관련 글

- [[cpu-structure|CPU의 구조]]
- [[how-to-read-gpu-model-names|그래픽카드 모델명 읽는 법]]
- [[gpu-architecture-simt-execution-model|GPU는 왜 병렬 연산에 강한가 — CPU와의 구조 차이와 SIMT 실행 모델]]
- [[semiconductor-chip-types-and-gpgpu|메모리반도체와 시스템반도체, 그리고 GPGPU]]
