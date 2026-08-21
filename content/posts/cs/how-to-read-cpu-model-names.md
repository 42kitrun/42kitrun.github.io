---
title: CPU 모델명 읽는 법
date: 2026-08-21
updated: 2026-08-21
tags:
  - cpu
  - cpu-naming
  - cpu-architecture
  - microarchitecture
  - intel
  - amd
  - arm
  - isa
  - x86
  - apple-silicon
  - m-series
  - ryzen
  - snapdragon
summary: "ISA, 마이크로아키텍처, 모델명 표기 세 층위로 나눠 Intel, AMD, Apple, ARM 기반 칩의 이름을 읽는 법과 구매 체크리스트를 정리한다"
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# CPU 모델명 읽는 법

_written by Claude-Code_

## 배경: 작전명 AI("AI" stands for "Actually Individuals"), 코드네임 23 — 여섯번째 미션

[[cpu-structure|이전 미션]]에서는 CPU가 명령어를 가져오고 해석하고 실행하는 내부 구조를 살펴봤다. 이번 미션은 그 구조를 만드는 제조사들이 자사 칩에 어떤 이름을 붙이는지, 그 이름 안에 어떤 정보가 담겨 있는지 정리한다.

![CPU를 읽는 법 — ISA, 마이크로아키텍처, 모델명, 구매 체크리스트|900](/assets/posts/cs/how-to-read-cpu-model-names/cpu-naming-overview.png)

CPU 이름을 정확히 읽으려면 세 층위를 구분해야 한다. **ISA**(어떤 프로그램을 실행할 수 있는가), **마이크로아키텍처**(내부적으로 어떻게 설계되었는가), **모델명**(어떤 제품군과 등급에 속하는가)이다. 하나씩 살펴본다.

## ISA — 프로그램 호환성

ISA(Instruction Set Architecture)는 CPU가 이해하는 명령어 체계다. 같은 프로그램이 돌아가려면 ISA가 맞아야 한다.

| ISA | 의미 | 대표 기기 |
|-----|------|-----------|
| x86 | 32비트 명령어 체계 | 구형 PC |
| x64 / x86-64 / AMD64 | 64비트 PC용 | Intel·AMD 데스크톱, Intel Mac |
| ARM64 / AArch64 | ARM 기반 시스템용 | Apple Silicon Mac, ARM Windows |

설치 파일에 적힌 x64, ARM64 표기는 CPU 모델명이 아니라 ISA를 가리킨다. 같은 ISA를 쓰는 CPU끼리는 같은 프로그램을 실행할 수 있지만, 성능이나 설계는 전혀 다를 수 있다.

## 마이크로아키텍처 — 내부 설계

같은 ISA를 쓰더라도 제조사마다 내부 설계는 다르다. 이 설계를 마이크로아키텍처라고 부르며, 코드명으로 구분한다.

| 제조사 | 마이크로아키텍처 | 적용 예시 |
|--------|------------------|-----------|
| Intel | Arrow Lake | Core Ultra 200 시리즈 |
| AMD | Zen 5 | Ryzen 9000 시리즈 |
| Apple | M4 계열 설계 | M4, M4 Pro, M4 Max |

마이크로아키텍처는 코어 구성, 캐시 크기, 파이프라인, 분기 예측, 전력 효율 방식을 결정한다. 같은 ISA, 같은 등급이어도 마이크로아키텍처가 다르면 실제 성능과 발열, 배터리 지속시간이 달라진다.

## CPU 모델명 읽는 법

모델명은 제조사, 제품군, 성능 등급, 모델 번호, 접미사로 쪼갤 수 있다. 세 제조사의 실제 모델명으로 확인한다.

**Intel: Core Ultra 7 265H**

| 요소 | Core Ultra | 7 | 265 | H |
|------|-----------|---|-----|---|
| 의미 | 제품군 | 성능 등급 | 모델 번호 | 고성능 노트북 계열 |

**AMD: Ryzen 7 9700X**

| 요소 | Ryzen | 7 | 9700 | X |
|------|-------|---|------|---|
| 의미 | 제품군 | 성능 등급 | 모델 번호 | 상위 성능 특성 |

**Apple: M4 Pro**

| 요소 | M4 | Pro |
|------|-----|-----|
| 의미 | 제품·세대 계열 | 상위 구성 |

**주의할 점 두 가지**

- i5, i7, Ryzen 5, Ryzen 7 같은 숫자는 세대가 아니라 성능 등급이다. 세대는 모델 번호나 제품군 이름(Core Ultra 200 시리즈 등)에서 확인해야 한다.
- 모델 번호의 첫 자리만 보고 세대를 판단하면 안 된다. 제조사와 제품군마다 번호를 매기는 규칙이 다르기 때문이다.

## 모바일 SoC: Qualcomm과 MediaTek

스마트폰과 일부 ARM Windows 기기에는 Qualcomm이나 MediaTek이 만든 ARM 기반 칩이 들어간다.

| 제조사 | 제품군 | 예시 | 등급 |
|--------|--------|------|------|
| Qualcomm | Snapdragon | Snapdragon 8 Gen 3 | 8(플래그십) > 7 > 6, 4(보급형) |
| MediaTek | Dimensity | Dimensity 9300 | 9000대(플래그십) > 8000대 > 7000대 |

Snapdragon은 등급 숫자 뒤에 "Gen + 세대 번호"를 붙이고, Dimensity는 4자리 모델 번호 하나로 등급과 세대를 함께 표기한다.

## 구매할 때 확인하는 순서

| 순서 | 확인 항목 | 확인할 정보 |
|------|-----------|-------------|
| 1 | ISA | x64인지 ARM64인지 |
| 2 | 기기 형태 | 데스크톱인지 노트북인지 |
| 3 | 제품군과 성능 등급 | Core Ultra 7, Ryzen 7, M4 Pro 등 |
| 4 | 세대와 마이크로아키텍처 | Arrow Lake, Zen 5, M4 계열 등 |
| 5 | 접미사 | U, H, HX, K, F, X, X3D 등 |
| 6 | 실제 사양 | 코어·스레드 수, 캐시, 전력, 내장그래픽 |

## 핵심 정리

- CPU 이름은 ISA, 마이크로아키텍처, 모델명 세 층위로 나눠 읽는다.
- ISA가 같아야 같은 프로그램을 실행할 수 있지만, 성능까지 같은 것은 아니다.
- 마이크로아키텍처는 코어 구성과 전력 효율 등 내부 설계를 결정한다.
- 모델명의 등급 숫자(i7, Ryzen 7 등)는 세대가 아니라 성능 순서를 나타낸다.
- 세대나 성능을 정확히 비교하려면 모델 번호와 마이크로아키텍처 코드명을 함께 확인해야 한다.

작전명 AI, 코드네임 23의 여섯번째 미션은 여기까지다. CPU 이름 하나를 봤을 때 ISA, 설계, 등급 세 가지를 분리해서 읽으면 나머지 숫자와 접미사는 자연스럽게 따라온다.

## 관련 글

- [[cpu-structure|CPU의 구조]]
- [[how-to-read-gpu-model-names|그래픽카드 모델명 읽는 법]]
- [[gpu-architecture-simt-execution-model|GPU는 왜 병렬 연산에 강한가 — CPU와의 구조 차이와 SIMT 실행 모델]]
- [[semiconductor-chip-types-and-gpgpu|메모리반도체와 시스템반도체, 그리고 GPGPU]]
