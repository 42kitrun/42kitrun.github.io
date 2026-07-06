---
title: 계층으로 이해하는 저장장치 — HDD와 SSD의 외형, 커넥터, 버스, 프로토콜
date: '2026-07-06'
updated: '2026-07-06'
tags:
  - hdd
  - ssd
  - storage
  - nvme
  - ahci
  - sata
  - pcie
  - m2
  - u2
  - u3
  - form-factor
  - computer-hardware
  - storage-device
  - fundamentals
related_projects: []
summary: "HDD와 SSD를 외형, 커넥터, 버스, 명령 프로토콜 네 계층으로 나눠 비교하고, SSD가 왜 같은 모양이라도 성능이 갈리는지 정리한다"
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# 계층으로 이해하는 저장장치 — HDD와 SSD의 외형, 커넥터, 버스, 프로토콜

_written by Claude-Code_

## 배경: 작전명 AI, 코드네임 23

새로운 작전에 투입됐다. 작전명은 AI — Actually Individuals. 코드네임은 23.

임무는 거창하지 않다. 매일 마주치는 저장장치, HDD와 SSD의 정체를 정확히 파악하는 것이다. "SSD가 빠르다"는 말은 누구나 안다. 그런데 왜 어떤 M.2 SSD는 느리고, 어떤 2.5인치 SSD는 노트북용 HDD와 형태만 같을 뿐 내부 동작 방식이 완전히 다른지 설명하려면 이야기가 복잡해진다. 이 복잡함의 원인은 저장장치가 하나의 규격이 아니라 **외형, 커넥터, 버스, 명령 프로토콜**이라는 서로 독립된 네 계층으로 이루어져 있다는 데 있다. 계층을 나눠서 보면 혼란이 사라진다.

---

## 저장장치를 구분하는 4계층

```
계층 4 (명령 프로토콜) │ AHCI, NVMe                          ← 실질적 성능을 결정
계층 3 (버스/전송)     │ SATA, PCIe                          ← 데이터가 오가는 전기적 통로
계층 2 (커넥터)       │ SATA 포트, M.2 슬롯, U.2/U.3 슬롯, PCIe 슬롯 ← 물리적으로 꽂히는 위치
계층 1 (외형)         │ 2.5인치, M.2(껌카드), PCIe 확장카드       ← 눈에 보이는 생김새
```

네 계층은 서로 독립적으로 조합된다. 겉모습(외형)이 같다고 성능이 같은 게 아니고, 커넥터가 같다고 버스가 같은 것도 아니다. 진짜 성능을 가르는 것은 가장 안쪽에 있는 **명령 프로토콜**이다. 이 원칙 하나만 잡고 가면 HDD와 SSD의 차이, 그리고 SSD들 사이의 차이가 명확해진다.
