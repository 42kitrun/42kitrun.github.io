---
title: Now in Seoul — 서울 실시간 관광 정보 플랫폼
date: 2026-04-05
updated: 2026-04-12
tags:
  - python
  - flask
  - sqlite
  - flask-babel
  - gunicorn
  - docker
  - aws-ec2
  - aws-route53
  - nginx
  - leaflet
  - github-actions
  - open-api
  - i18n
  - data-pipeline
  - cron
  - etl
  - web
  - unix-domain-socket
  - ipc
  - performance
status: published
excerpt: 서울 120개 주요 명소의 실시간 인구밀도·교통·날씨를 한/영/일 3개 언어로 제공하는 관광 정보 플랫폼 — Flask-Babel 다국어, 공공 API 데이터 파이프라인, AWS 인프라 구성까지
---

## 프로젝트 개요

**Now in Seoul**은 서울을 방문하는 외국인 관광객과 국내 여행자를 위한 실시간 관광 정보 플랫폼입니다.

서울시 120개 주요 명소의 **실시간 인구밀도(혼잡도), 교통 상황, 날씨**를 한꺼번에 확인하고, 지도에서 원하는 장소를 탐색할 수 있습니다. 한국어·영어·일본어 3개 언어를 완벽 지원해 외국인 방문객도 불편 없이 이용할 수 있습니다.

> **팀 구성 · Team Seoul Friends**

| 이름  | 역할                                           |
| --- | -------------------------------------------- |
| 원정  | PM · 기획 · 지도 및 다국어 구현 · 인프라 구성               |
| 홍민  | 프로젝트 컨셉 구성 · 메인/상세페이지 개발 · 다국어 데이터 검수        |
| 지연  | DB 설계 및 구현 · 데이터 파이프라인 개발 · 스케줄러 개발 · 성능 최적화 |
| 지윤  | 로고 제작 · 화면 구성 아이디어 제공                        |

---

## 기술 스택

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white) ![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=flat&logo=gunicorn&logoColor=white) ![Jinja](https://img.shields.io/badge/Jinja2-B41717?style=flat&logo=jinja&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white) ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazonec2&logoColor=white) ![AWS Route53](https://img.shields.io/badge/AWS_Route_53-8C4FFF?style=flat&logo=amazonroute53&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white) ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

| 영역 | 기술 |
|------|------|
| Framework | Python Flask 3.x |
| Template Engine | Jinja2 |
| Database | SQLite |
| WSGI Server | Gunicorn |
| Reverse Proxy | Nginx |
| Multilingual | Flask-Babel (한국어 · 영어 · 일본어) |
| Map | Leaflet.js + OpenStreetMap |
| Container | Docker · DockerHub |
| CI/CD | GitHub Actions |
| Cloud | AWS EC2 · Route 53 |
| Public API | 서울 열린데이터 광장 (실시간 도시데이터) · 기상청 API Hub |

---

## 목차

- [서비스 구조](#서비스-구조)
- [핵심 기능](#핵심-기능)
  - [메인 페이지 — 테마별 명소 탐색](#메인-페이지--테마별-명소-탐색)
  - [상세 페이지 — 실시간 3종 정보](#상세-페이지--실시간-3종-정보)
  - [지도 탐색 — Leaflet 기반 인터랙티브 맵](#지도-탐색--leaflet-기반-인터랙티브-맵)
  - [다국어 지원 — Flask-Babel i18n](#다국어-지원--flask-babel-i18n)
- [데이터 파이프라인](#데이터-파이프라인)
- [인프라 구성](#인프라-구성)
- [특장점 요약](#특장점-요약)

---

## 서비스 구조

*(서비스 구조도 이미지 추후 포함 예정)*

---

## 핵심 기능

### 메인 페이지 — 테마별 명소 탐색

서울의 주요 명소를 #Food · #Drama · #Beauty · #Movie 테마로 분류해 한눈에 탐색할 수 있습니다. 각 카드에는 대표 이미지와 장소명이 표시되며, 데스크톱과 모바일 모두 최적화된 반응형 레이아웃으로 제공됩니다.

![메인 페이지 — 데스크톱 (일본어)](/assets/images/nowinseoul/nowinseoul_1.png)

*메인 페이지 데스크톱 뷰 (일본어)*

![메인 페이지 — 모바일 (한국어)](/assets/images/nowinseoul/nowinseoul_2.png)

*메인 페이지 모바일 뷰 (한국어)*

---

### 상세 페이지 — 실시간 3종 정보

명소 카드를 클릭하면 해당 장소의 실시간 정보를 즉시 확인할 수 있습니다.

| 정보 항목 | 데이터 출처 | 갱신 주기 |
|-----------|-------------|-----------|
| **혼잡도 (Crowd Density)** | 서울 실시간 도시데이터 API | 5분 |
| **교통 상황 (Traffic Conditions)** | 서울 실시간 도시데이터 API | 5분 |
| **날씨 (Weather)** | 기상청 단기예보 API | 3시간 |

혼잡도는 `여유 / 보통 / 붐빔 / 매우붐빔` 4단계로 색상 배지와 함께 표시되며, 시간대별 예측 그래프를 함께 제공해 방문 계획을 세울 때 유용합니다. 날씨는 기온과 강수 확률을 시간대별로 제공합니다.

![상세 페이지 — 혼잡도·날씨·공공자전거](/assets/images/nowinseoul/nowinseoul_5.png)

*상세 페이지: 실시간 혼잡도 · 날씨 · 인근 공공자전거 대여소 현황*

---

### 지도 탐색 — Leaflet 기반 인터랙티브 맵

**Leaflet.js + OpenStreetMap** 기반 지도에서 서울 전체 명소를 한 화면에서 탐색할 수 있습니다. 지도 핀을 클릭하면 해당 명소의 현재 혼잡도 상태가 팝업으로 표시되고, 상세 페이지로 바로 이동할 수 있습니다. 인근 **공공자전거(따릉이) 대여소 위치와 잔여 대수**도 함께 확인할 수 있어 이동 편의성을 높였습니다.

![모바일 화면 — 홈·상세·지도 뷰](/assets/images/nowinseoul/nowinseoul_7.png)

*모바일 확정안: 홈 / 상세 / 지도+필터 화면*

---

### 다국어 지원 — Flask-Babel i18n

**Flask-Babel**을 활용해 한국어·영어·일본어 3개 언어를 지원합니다. 언어는 URL 경로(`/<locale>/`)로 결정되며, 경로에 locale이 없을 경우 브라우저의 `Accept-Language` 헤더를 분석해 최적 언어를 자동 선택합니다.

외국인 방문자가 별도 설정 없이도 자신의 언어로 서비스를 이용할 수 있도록 설계했으며, 명소 설명·UI 라벨·혼잡도 및 교통 상태 문구 모두 3개 언어로 검수 완료했습니다.

![상세 페이지 — EN / JA / KO 비교](/assets/images/nowinseoul/nowinseoul8.png)

*동일 페이지의 영어(EN) · 일본어(JA) · 한국어(KO) 화면*

---

## 데이터 파이프라인

실시간성이 핵심인 서비스인 만큼, 안정적인 데이터 수집·가공·저장 파이프라인을 별도로 구축했습니다.

### 수집 대상 API

| 데이터 | API | 갱신 주기 |
|--------|-----|-----------|
| 실시간 인구밀도 + 교통 상황 | 서울 열린데이터 광장 — 실시간 도시데이터 | 5분 |
| 인구밀도 시간대별 예측값 | 서울 열린데이터 광장 — 실시간 도시데이터 | 1시간 |
| 단기 날씨 예보 | 기상청 API Hub | 3시간 |
| 공공자전거 대여소 현황 | 서울 공공자전거 API | 실시간 |

### ETL 구조

```
[외부 API 호출]
       │
       ▼
 {domain}_raw 테이블     ← 원본 데이터 적재
       │
       ▼
   ETL 처리              ← 정제·변환 (etl.py)
       │
       ▼
 {domain}_cache 테이블   ← 서비스 응답에 사용
```

`raw → cache` 2단계 구조로 원본 데이터를 보존하면서 서비스 응답에는 정제된 캐시 테이블만 사용합니다. 오류 발생 시 원본 데이터가 손상되지 않아 재처리가 용이합니다.

> [!note]- 성능 설계: 웹 요청 경로에서 외부 API 의존성 제거
> **핵심 원칙**: 수집과 서비스를 완전히 분리해 외부 API의 지연·장애가 사용자 응답에 영향을 주지 않도록 설계.
>
> | 설계 결정 | 기법 | 효과 |
> |---|---|---|
> | 수집 속도 개선 | `asyncio` + `ThreadPool` 하이브리드 | 날씨 수집 30.6s → 0.46s (66배) |
> | API 호출 최소화 | 좌표 중복 제거 + 팬아웃 | 80회 → 18회 (~78% 감소) |
> | 요청별 연산 제거 | 태그 조합 15가지 사전 계산 | O(n) DB 쿼리 → O(1) 메모리 조회 |
> | 반복 DB 조회 제거 | Singleton으로 정적 데이터 관리 | Cron마다 반복 조회 제거 |
>
> → [[archive/nowinseoul-performance-analysis|성능 및 리소스 효율화 전체 분석 보기]]

### Cron 스케줄러   [[flask-scheduler-vs-cron  |cron]]


  > [!note]- flask extension을 사용하지 않고 cron을 사용한 이유
  > ### 1. 프로세스 격리
  > - Flask 앱과 스케줄 잡을 **별도 프로세스**로 분리.
  > - 잡 실행 중 예외가 발생해도 Flask 앱에 영향 없음.
  > - 배포·재시작 중에도 잡은 독립적으로 동작.
  >
  > ### 2. 리소스 최적화 (AWS EC2 t3.small에서 )
  > - Flask 프로세스의 메모리·스레드 풀을 잡이 소비하지 않음
  > - 잡 실행 시간에만 프로세스가 생성되고 종료 → **유휴 시간 리소스 점유 없음**
  > - 외부 API 다량 호출, DB 배치 처리 등 무거운 작업에 적합
  >
  > ### 3. 성능 최적화
  > - HTTP 요청 처리와 배치 작업의 **CPU/메모리 경쟁 없음**
  > - APScheduler 백그라운드 스레드가 GIL을 점유하는 상황 원천 차단
  > - 잡 완료 후 프로세스 종료 → 메모리 누수 자동 정리
  >
  > ### 4. 운영 단순화
  > - 스케줄 고정적 → cron이 더 명확
  > - 단일 서버 환경에서는 APScheduler의 중복 실행 문제가 발생하지 않음
  > - 잡 로그를 Flask 앱 로그와 분리하여 독립적으로 추적 가능

crontab으로 API 호출·ETL·DB 반영을 자동화했습니다.

```cron
# 실시간 인구밀도 + 교통 상황 (5분 간격)
1/5 * * * *  /path/to/detail.sh

# 인구밀도 예측값 (매시 2분, 5분 간격)
2 * * * *    /path/to/density.sh
2/5 * * * *  /path/to/density.sh

# 날씨 예보 (하루 8회 — 3시간 간격)
3 2,5,8,11,14,17,20,23 * * *  /path/to/weather.sh
```

---

## 인프라 구성

GitHub Actions → DockerHub → AWS EC2의 자동 배포 파이프라인을 구성했습니다.

![AWS 인프라 아키텍처](/assets/images/nowinseoul/nowinseoul_4.png)

*AWS 인프라 구성도: Route 53 → Nginx → Gunicorn(Flask) + SQLite · GitHub Actions CI/CD*

| 구성 요소 | 역할 |
|-----------|------|
| **AWS Route 53** | 도메인 DNS 라우팅 |
| **AWS EC2** | 애플리케이션 서버 |
| **Nginx** | 리버스 프록시 · 정적 파일 서빙 |
| **Gunicorn** | Python WSGI 서버 (Flask 앱 실행) |
| **Docker · DockerHub** | 컨테이너 이미지 빌드 및 배포 |
| **GitHub Actions** | Push 이벤트 기반 자동 빌드·배포 |

배포 흐름:

```
git push → GitHub Actions (CI/CD)
              │  Build & Push
              ▼
          DockerHub
              │  Pull & Run
              ▼
          AWS EC2 (Docker 컨테이너)
              │
    Nginx Reverse Proxy
              │   Unix domain socket
    Gunicorn (Flask App)
              │
          SQLite DB
```

### Unix Domain Socket — Nginx ↔ Gunicorn IPC

Nginx와 Gunicorn 간 통신을 TCP 소켓에서 **Unix Domain Socket(UDS)** 으로 전환했습니다.

```
[TCP 방식 - 변경 전]
Nginx  →  127.0.0.1:8000  →  Gunicorn
          (네트워크 스택 경유)

[UDS 방식 - 변경 후]
Nginx  →  /path/to/gunicorn.sock  →  Gunicorn
          (커널 메모리 직접 전달)
```

> [!note]- TCP 대신 Unix Domain Socket으로 바꾼 이유
> ### 성능
> - 루프백(127.0.0.1)도 TCP/IP 스택(패킷 캡슐화·라우팅·포트 바인딩)을 전부 거침
> - UDS는 커널 내부에서 메모리 복사만으로 데이터 전달 → **레이턴시·CPU 사용량 감소**
> - 같은 서버 내 프로세스 간 통신에서 TCP보다 처리량이 높음
>
> ### 보안
> - TCP 포트를 열지 않아 외부 노출 면적 축소
> - 소켓 파일 권한(`chmod`)으로 접근 프로세스를 OS 수준에서 제한 가능
>
> ### 리소스
> - 포트 바인딩 불필요 → 포트 충돌 위험 없음
> - t3.small(2 vCPU 2GB RAM)처럼 리소스가 제한된 환경에서 네트워크 오버헤드 절감 효과가 두드러짐

→ 관련 글: [[posts/cs/unix-domain-socket|Unix Domain Socket이란?]]

---

## 특장점 요약

**1. 외국인 관광객 친화적 다국어 UX**
URL과 브라우저 언어 설정을 모두 활용하는 두 단계 locale 감지로, 별도 설정 없이도 방문자의 언어로 자동 전환됩니다. 명소 설명과 UI 문구 전체를 한·영·일로 검수해 번역 품질을 확보했습니다.

**2. 실시간 데이터 기반 방문 계획 지원**
혼잡도 배지·시간대별 예측 그래프·교통 상황·날씨를 한 화면에서 확인할 수 있어, 관광객이 혼잡한 시간을 피해 방문 계획을 세울 수 있습니다.

**3. 수집 파이프라인 66배 고속화 — 비동기 전환 설계**
날씨 수집 **30.6초 → 0.46초**, API 호출 **80회 → 18회(78% 감소)**. `asyncio` + `ThreadPoolExecutor` 하이브리드로 I/O 대기와 CPU 파싱을 분리하고, raw/cache 2계층 구조로 외부 API 지연이 웹 응답에 영향을 주지 않도록 설계했습니다.
→ [[archive/nowinseoul-performance-analysis|성능 및 리소스 효율화 설계 상세 분석]]

**4. 크론 기반 자동 스케줄링**
데이터 종류별 갱신 주기를 세분화(5분·1시간·3시간)해 API 호출 비용을 최소화하면서 실시간성을 유지합니다.

**5. GitHub Actions → DockerHub → EC2 자동 배포**
코드 푸시만으로 빌드·이미지 등록·서버 배포까지 자동화되어 운영 부담을 최소화했습니다.

**6. Leaflet.js 기반 인터랙티브 지도**
OpenStreetMap 위에 혼잡도 핀과 공공자전거 대여소 정보를 레이어로 올려, 지도 하나에서 명소 탐색과 이동 수단 계획을 동시에 지원합니다.
