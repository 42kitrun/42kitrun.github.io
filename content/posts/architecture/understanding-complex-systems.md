---
title: 우리는 미지의 시스템을 어떻게 이해하는가?
date: 2026-06-22
updated: 2026-06-22
tags:
  - system-understanding
  - complex-systems
  - observability
  - distributed-tracing
  - reverse-engineering
  - domain-modeling
  - system-analysis
  - debugging
  - legacy-systems
  - software-architecture
  - problem-solving
  - knowledge-transfer
  - documentation
  - performance-analysis
  - system-design
  - ai-agent
  - microservices
summary: 개발자가 미지의 시스템(레거시 코드, AI Agent가 만든 복잡한 시스템 포함)을 이해하기 위한 5단계 체계적 접근법을 소개한다.
ai_agent: Claude-Code, ChatGPT
devto: false
devto_id:
devto_url:
---

# 우리는 미지의 시스템을 어떻게 이해하는가?

_written by Claude-Code, ChatGPT_

![시스템 이해의 5단계](/assets/posts/architecture/understanding-complex-systems.png)

## 도입: 시스템 앞에 선 개발자

개발자는 수시로 "미지의 시스템"과 맞닥뜨린다.

- 회사에 입사해서 인수인계받은 10년 된 레거시 시스템
- 문서는 없고 코드만 있는 마이크로서비스
- 팀원이 떠나고 그가 만든 복잡한 시스템을 이어받은 상황
- 심지어 최근엔 AI Agent가 만든 복잡한 시스템까지도

마지막이 특별하지만, 사실 같은 문제다. AI Agent가 만든 시스템도 개발자 입장에선 "왜 이렇게 만들었을까?", "이게 어떻게 작동하는 건가?"라는 의문에 부딪힌다. 자동으로 생성된 복잡한 아키텍처, 추적하기 어려운 로직, 블랙박스 같은 동작들.

이런 상황에서 많은 개발자는 같은 실수를 한다. **"일단 코드를 읽어야겠다"는 생각으로 파고든다.**

하지만 복잡한 시스템은 코드만으로는 이해할 수 없다.

## 핵심: 시스템을 이해하는 단계별 접근

복잡한 시스템을 이해하려면 **체계적인 전략**이 필요하다.

이 연작 시리즈에서 다룰 5가지 접근법:

1. **Observability** (2편): 보이지 않는 시스템을 보는 기술 - 로그와 메트릭으로 시스템의 현재 상태를 파악
2. **Distributed Tracing** (3편): 서비스의 발자취를 따라가기 - 요청이 시스템을 통과하는 경로를 추적
3. **Reverse Engineering** (4편): 문서 없는 시스템 읽기 - 동작에서 의도를 역으로 추론
4. **Domain Modeling** (5편): 시스템보다 먼저 도메인을 이해하라 - 비즈니스 개념부터 시작하기

## 왜 이 순서인가?

시스템을 블랙박스로 보는 개발자와 그렇지 않은 개발자의 차이는 **관찰의 깊이**다.

- 먼저 시스템이 **지금 뭘 하는지** 봐야 한다 (Observability)
- 그 다음 **어떻게 작동하는지** 따라가야 한다 (Tracing)
- 그 후 **왜 이렇게 만들었는지** 역으로 읽어야 한다 (Reverse Engineering)
- 마지막으로 **무엇을 나타내는지** 이해해야 한다 (Domain Modeling)

이 순서는 우연이 아니다. 관찰 → 추적 → 분석 → 이해로 이어지는 자연스러운 흐름이다.

## 실무에서 어떻게 시작할 것인가?

새로운 복잡한 시스템을 맡았다면:

1. **로그를 켜자** - 시스템이 뭘 하고 있는지 먼저 봐야 한다
2. **한 가지 요청을 따라가자** - 한 사용자의 액션이 시스템을 어떻게 통과하는지 추적
3. **패턴을 찾자** - 반복되는 동작들이 뭔지 관찰
4. **의도를 추론하자** - 왜 이렇게 설계했을까 생각해보기
5. **개념을 정리하자** - 핵심 도메인 모델이 뭔지 이해하기

이 과정을 거치면 코드는 단순한 텍스트를 벗어나 **의미 있는 이야기**로 읽힌다.

## 다음: 2편에서 만나요

다음 편에서는 Observability로 시작한다. 시스템을 보이게 만드는 기술, 로그와 메트릭이 어떻게 미지의 시스템의 문을 열어주는지 살펴본다.
