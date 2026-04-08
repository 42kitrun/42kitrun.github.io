---
title: "의료 데이터 교환 표준: HL7, FHIR, DICOM 비교"
date: 2026-03-28
updated: 2026-03-28
tags:
  - healthcare
  - standards
  - hl7
  - fhir
  - dicom
  - interoperability
  - data-formats
  - data-governance
  - medical-code
  - api
summary: "병원과 의료기관들이 환자 데이터를 주고받을 때 사용하는 통신 표준들: HL7 v2, FHIR, DICOM의 차이점과 최근 트렌드"
devto: false
devto_id:
devto_url:
---

# 의료 데이터 교환 표준: HL7, FHIR, DICOM 비교

## 한 문장 요약

**의료기관들이 환자 데이터를 주고받을 때 사용하는 표준들이 있고, 레거시(HL7 v2)에서 모던(FHIR)으로 전환 중입니다.**

---

## 🏥 배경: 왜 표준이 필요할까?

### 표준 없을 때의 현실

```
병원 A (자체 시스템)
병원 B (다른 회사 시스템)
병원 C (또 다른 회사 시스템)

환자가 병원을 옮기면:
병원 A → 병원 B: "데이터 형식이 다르네..."
환자: "의료기록 파일로 줄 수 있어요?"

→ 호환성 없음, 수동 작업
→ 의료 섬(silo) 현상
```

### 표준의 역할

```
모든 병원이 같은 형식을 사용
→ 자동 데이터 교환 가능
→ 환자 데이터 통합 가능
→ 더 나은 의료 서비스
```

---

## 🔑 핵심 3가지 표준

### 1️⃣ HL7 v2 (1987년 ~ 현재)

#### 정의
**가장 오래되고 현재 가장 많이 사용되는 의료 데이터 교환 표준**

#### 형식
```
파이프(|)로 구분된 텍스트 형식

MSH|^~\&|MediDaily|Hospital A|HIS|Hospital B|20260328120000||ADT^A01|MSG001|P|2.5
PID|1||12345^^^MRN||Kim^Chulsu||19900101|M|
PV1|1|O|ER||^^^Dr.Lee||||||||||||||
OBX|1|NM|25064002||7|||N|||F

각 줄의 의미:
- MSH: 메시지 헤더 (누가, 언제, 뭘 보냄?)
- PID: 환자 ID, 이름, 생년월일
- PV1: 방문 정보 (ER 방문, 담당의)
- OBX: 진단 데이터 (증상코드, 수치)
```

#### 특징
```
✅ 장점:
  - 매우 널리 사용 (전 세계 70% 이상)
  - 오랜 역사로 검증됨
  - 대부분 병원 EMR과 호환

❌ 문제점:
  - 파싱이 복잡함
  - 각 병원이 HL7을 "자신만의 방식으로" 확장
  - 표준이 표준이 아님 (dialect 문제)
  - 웹/모바일 환경과 안 맞음
```

#### 현황
```
- 한국 의료기관: 70% 이상 사용
- 미국 병원: 주로 v2 사용 중
- 단계적으로 FHIR로 전환 중
```

#### 공식 정보
🔗 [HL7 International - HL7 v2 Product Brief](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185)

---

### 2️⃣ HL7 FHIR (2011년 ~ 현재)

#### 정의
**Fast Healthcare Interoperability Resources - 현대적 웹 API 기반 의료 데이터 표준**

#### 형식
```
RESTful API + JSON/XML

GET /Patient/12345
{
  "resourceType": "Patient",
  "id": "12345",
  "name": [
    {
      "use": "official",
      "family": "Kim",
      "given": ["Chulsu"]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "010-1234-5678"
    }
  ],
  "birthDate": "1990-01-01",
  "address": [
    {
      "use": "home",
      "text": "Seoul, Korea"
    }
  ]
}
```

#### 특징
```
✅ 장점:
  - JSON/XML (파싱 쉬움)
  - RESTful API (웹 개발자 친숙)
  - 모바일 앱에 최적
  - 마이크로서비스 아키텍처 호환
  - 표준화된 Resource 타입 (Patient, Observation, etc.)

❌ 단점:
  - 상대적으로 새로움
  - 도입 학습곡선
  - 아직 레거시 HL7 v2만큼 널리 채택 안 됨
```

#### 최신 트렌드: 미국 의료법 지원
```
2021년: 21st Century Cures Act (미국)
→ 의료기관들이 FHIR API 제공 의무화

결과:
- Epic, Cerner 등 주요 EHR 벤더: FHIR API 제공
- Apple Health: FHIR 기반
- Google Health: FHIR 지원
- AWS HealthLake: FHIR 기반
```

#### 도입 추세
```
2020년: HL7 v2 90%, FHIR 5%
2024년: HL7 v2 70%, FHIR 25%
2026년: HL7 v2 60%, FHIR 35% (예상)
2030년: FHIR이 주류 (예상)
```

#### 공식 정보
🔗 [HL7 International - FHIR Standard](https://www.hl7.org/fhir/)

---

### 3️⃣ DICOM (1985년 ~ 현재)

#### 정의
**Digital Imaging and Communications in Medicine - 의료 영상 전송 표준**

#### 용도
```
X-ray, CT, MRI, 초음파, PET 등 모든 의료 영상
및 영상 관련 메타데이터 전송
```

#### 특징
```
형식: 바이너리 (이미지 + 메타데이터 포함)

특징:
✅ 의료 영상의 국제 표준
✅ 매우 안정적 (40년 이상 사용)
✅ PACS (영상저장시스템)와 완벽 호환
✅ 영상 + 환자정보 + 진단 결과를 한 파일에 포함

예시:
DICOM 파일
├─ 환자 정보 (이름, ID, 생년월일)
├─ 촬영 정보 (날짜, 시간, 촬영 부위)
├─ 의사 정보 (이름, 서명)
├─ 진단 코드 (SNOMED-CT)
└─ 의료 영상 데이터 (바이너리)
```

#### 한국 의료
```
- 모든 병원의 영상의학과: 100% DICOM 사용
- 영상 저장소(PACS): DICOM 표준
- 진료기록과 별도로 관리됨 (중요!)
```

#### 공식 정보
🔗 [DICOM Standard - Official Website](https://www.dicomstandard.org/)

---

## 📊 HL7 v2 vs FHIR 비교표

| 항목 | HL7 v2 | HL7 FHIR |
|------|--------|----------|
| **형식** | 파이프(│) 텍스트 | JSON/XML |
| **아키텍처** | HL7 메시징 | RESTful API |
| **등장 시기** | 1987년 | 2011년 |
| **사용 난이도** | 높음 (파싱 복잡) | 낮음 (일반 웹 API) |
| **확장성** | 낮음 | 높음 |
| **웹 친화성** | 낮음 | 높음 |
| **모바일 호환** | 어려움 | 최적 |
| **마이크로서비스** | 부적합 | 최적 |
| **현재 도입률** | 70%+ (레거시) | 25%+ (증가 중) |
| **5년 후 예상** | 60% | 35% |

---

## 🌍 한국 의료 현황

### 현재 상황

```
┌──────────────────────────────┐
│ 의료 섬(Silo) 현상           │
├──────────────────────────────┤
│                              │
│ 병원 A ─┐                    │
│         │ (호환 안 됨)        │
│ 병원 B ─┤ ❌                 │
│         │                    │
│ 병원 C ─┘                    │
│                              │
│ 각 병원은 자신의 시스템만 사용 │
│ 환자가 수동으로 이동 필요     │
└──────────────────────────────┘
```

### 원인
```
1. 의료법 (의료기관 자율성 강조)
2. EMR 벤더들의 폐쇄성 (자신의 시스템 고착)
3. 정부 주도 표준화 미흡
4. 보안/개인정보 우려
```

### 한국의 표준들

#### EDI (전자상거래 데이터 교환)
```
용도: 병원 → 건강보험공단 청구/심사

특징:
- 의료보험 청구의 사실상 표준
- 고정 길이 텍스트 형식
- 각 병원은 EDI를 EMR에 통합
- 의료법으로 강제됨

→ 병원 간 데이터 교환 아님 (청구 전용)
```

#### KPIS (Korean Prescription Information System)
```
용도: 의사 → 약사 처방 전달

특징:
- 한국 의약분업법 기반
- 의사가 처방 → 약사가 수행
- EDI 기반

→ 의료기관 간 호환 아님
```

### 최근 변화
```
2024년 이후:
- 정부 (보건복지부): 상호운용성 추진
- FHIR 도입 권장 시작
- 하지만 실제 도입은 아직 미미
- 대형 병원 중심으로 시작될 예상
```

---

## 🔧 추가 표준들 (개요)

### CDA (Clinical Document Architecture)
```
용도: 임상 문서 (의료 보고서, 퇴원 요약, 처방전)
형식: XML
링크: https://www.hl7.org/implement/standards/product_brief.cfm?product_id=7
```

### NCPDP (National Council for Prescription Drug Programs)
```
용도: 약국 처방, 약물 정보
형식: EDI 기반
링크: https://www.ncpdp.org/
```

### openEHR (Open Electronic Health Records)
```
용도: 개방형 전자건강기록
특징: 의료기관 독립적 (누가 만든 EHR이든 호환)
주도: 유럽 (북유럽 광범위 도입)
한국: 거의 미채택
링크: https://www.openehr.org/
```

### IHE (Integrating the Healthcare Enterprise)
```
용도: 기존 표준들(HL7, DICOM)을 어떻게 함께 사용할지 정의
특징: "표준들의 표준화"
예시: IHE XDS (DICOM + HL7 + CDA 통합)
링크: https://www.ihe.net/
```

---

## 🚀 최근 트렌드 (2024-2026)

### 1. FHIR로의 대전환

```
미국: 21st Century Cures Act (2021)
→ 의료기관들이 FHIR API 제공 의무화

결과:
- Epic, Cerner 같은 EHR 벤더: FHIR API 제공
- Apple Health: FHIR 기반
- Google Health: FHIR 지원
```

### 2. API-First 아키텍처

```
이전 (배치 처리):
MediDaily → hospital.hl7 파일 생성
         → FTP로 전송
         → 병원이 다음날 처리

현재 (실시간 API):
사용자 입력 → MediDaily API
          → Hospital FHIR API
          → 실시간 EMR 업데이트
```

### 3. 클라우드 기반 데이터 교환

```
이전: 병원들의 폐쇄 시스템 (각각 독립)

현재: 클라우드 중개자 모델
Hospital A \
Hospital B  → AWS/Azure 의료 클라우드 → 앱/환자
Hospital C /

서비스:
- Microsoft Azure Health Data Services
- AWS HealthLake
- Google Cloud Healthcare API
(모두 FHIR 기반)
```

### 4. 환자 주도 데이터 (Patient-Centric)

```
이전: 의료기관 중심
병원 A → 병원 B로 데이터 전송 (환자는 모름)

현재: 환자 중심 (미국 정책)
환자가 자신의 데이터 소유
→ 어느 앱/병원에 공유할지 결정
→ Apple Health처럼 개인 의료 허브

기술: SMART on FHIR (환자 인증 + 권한)
```

---

## 💡 헬스케어 앱 개발자 관점

### MediDaily 같은 헬스케어 앱이라면?

```
지금 (2026):
✅ PDF 내보내기 (의료기관 제출용)
✅ 기본 데이터 구조 설계 (SNOMED-CT 코드 사용)

1-2년 후:
✅ FHIR API 구현 (병원 연동 준비)
✅ 데이터 유효성 검증 강화

3-5년 후:
✅ SMART on FHIR (환자 주도 권한)
✅ 주요 병원 시스템과 연동
✅ HL7 v2는 필요할 때만
```

### 설계 원칙

```
1️⃣ 의료 코드 표준화 (SNOMED-CT)
   → 병원과의 호환을 위해 필수

2️⃣ 데이터 구조 정규화
   → "환자정보", "증상", "진단" 분리

3️⃣ API 설계 (RESTful)
   → 병원 시스템과 연동 시 FHIR 기반

4️⃣ 보안/인증
   → HIPAA 준수, 환자 동의 관리
```

---

## 📚 참고 자료

### 공식 사이트
- 🔗 [HL7 International](https://www.hl7.org/)
- 🔗 [HL7 FHIR Standard](https://www.hl7.org/fhir/)
- 🔗 [DICOM Standard](https://www.dicomstandard.org/)
- 🔗 [openEHR Foundation](https://www.openehr.org/)
- 🔗 [NCPDP](https://www.ncpdp.org/)
- 🔗 [IHE](https://www.ihe.net/)

### 한국 관련 기관
- 🔗 [건강보험심사평가원 - EDI 표준](https://www.hira.or.kr/)
- 🔗 [한국보건의료정보원 - KPIS](https://www.khidi.or.kr/)

### 최신 정보
- 🔗 [Microsoft Azure Health Data Services](https://learn.microsoft.com/en-us/azure/healthcare-apis/)
- 🔗 [AWS HealthLake](https://aws.amazon.com/healthlake/)
- 🔗 [Google Cloud Healthcare API](https://cloud.google.com/healthcare-api/docs)

---

## 🔗 관련 개념

**다음 단계:**
- [[healthcare/snomed-ct|국제 의료표준 코드(SNOMED-CT) 도입기]] - 의료 데이터의 표준 코드 체계
- [[cs/essential-specifications|필수 표준 & 명세서 가이드]] - HL7, FHIR의 기술적 명세

**관련 포스트:**
- [[healthcare/privacy-policy-healthcare|헬스케어 앱 개인정보처리방침 작성법]] - 의료 데이터 보호와 규제

---

## 🎯 핵심 요점

| 표준 | 현재 | 5년 후 | 학습 우선순위 |
|------|------|--------|-------------|
| **HL7 v2** | 70% 사용 | 60% 사용 | 낮음 (필요할 때) |
| **HL7 FHIR** | 25% 사용 | 35% 사용 | ⭐⭐⭐ 높음 |
| **DICOM** | 필수 (영상) | 필수 | ⭐ (영상만) |

**결론:**
> 헬스케어 앱을 만든다면 **FHIR을 기준**으로 설계하되, **SNOMED-CT 같은 의료 코드**도 함께 고려하세요. HL7 v2는 기존 병원 시스템과 연동할 때만 필요합니다.

---
