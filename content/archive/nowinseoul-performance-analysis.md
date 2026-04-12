---
title: nowinseoul 서버 - 성능 및 리소스 효율화 설계 분석
tags: [backend, performance, python, flask, architecture]
created: 2026-04-12
status: complete
---

# nowinseoul 서버 — 성능 및 리소스 효율화 설계 분석

> 이 문서는 [[archive/nowinseoul|Now in Seoul]] 프로젝트의 성능·리소스 설계를 심층 분석한 기술 문서입니다.

> 서울시 실시간 도시데이터(인구밀도·날씨·도로)를 다국어로 제공하는 Flask 기반 웹 서비스의 성능 설계를 정리한 문서입니다.

---

## 1. 아키텍처 개요

```
[외부 공공 API] ──(Cron)──▶ [*_raw 테이블] ──(ETL)──▶ [*_cache 테이블] ──▶ [웹 요청 응답]
```

**핵심 원칙**: 웹 요청 경로(critical path)에서 외부 API 호출을 완전히 제거.  
데이터 수집과 서비스 응답을 완전히 분리함으로써 외부 API의 지연·장애가 사용자 응답에 영향을 주지 않는 구조.

---

## 2. 비동기 + 스레드풀 하이브리드 수집 파이프라인

### 설계 판단

| 작업 유형 | 적용 기술 | 이유 |
|---|---|---|
| 외부 API 호출 (I/O 대기) | `asyncio` + `aiohttp` | GIL 우회, 대기 시간 중 다른 요청 처리 |
| 응답 데이터 파싱 (CPU 작업) | `ThreadPoolExecutor` | 병렬 파싱으로 처리 시간 단축 |

### 수집 모듈별 구성

```
weather_fetcher     : aiohttp로 N개 좌표 동시 fetch → ThreadPool로 시간대 그룹핑/파싱
bike_station_fetcher: aiohttp로 9개 페이지 URL 동시 fetch → ThreadPool로 결과 필터링
realtime_pop_fetcher: ThreadPool로 80개 관광지 API 동시 호출
realtime_traffic    : ThreadPool로 80개 관광지 API 동시 호출
```

### 실측 성과

> [!success] 날씨 수집 파이프라인 개선
> - **Before** (서울시 도시데이터 API + 동기 처리): **30.6초** / 1,920건
> - **After** (기상청 API + 비동기 처리): **0.46초** / 216건
> - **약 66배 단축** — API 소스 교체 + 비동기 전환을 동시에 적용한 결과

---

## 3. 좌표 중복 제거로 API 호출 수 최소화

### 문제 인식

날씨 예보는 기상청 격자 좌표(nx, ny) 단위로 제공됨.  
서비스 대상 80개 관광지 중 다수가 동일 격자에 속함 → 좌표별 1회만 호출하면 충분.

### 구현

```python
# 80개 관광지 → 고유 좌표(nx, ny)로 그룹핑
xy_id_map = defaultdict(list)
for d in db.get_data('id,nx,ny', 'attraction'):
    xy_id_map[f"{d['nx']}_{d['ny']}"].append(d['id'])

# API 호출: 80회 → ~18회
fetch_tasks = [fetch_weather_async(session, url, nx, ny) for xy in xy_list]
results = await asyncio.gather(*fetch_tasks)

# insert 시점에 동일 좌표의 attraction_id들로 팬아웃
insert_data = [
    {**d, 'id': id_}
    for d in final_results
    for id_ in xy_id_map.get(f"{d['nx']}_{d['ny']}", [])
]
```

> [!info] 효과
> 기상청 API 호출 횟수 **80회 → 약 18회** (약 78% 감소)  
> API 사용량 절감 + Rate Limit 여유 확보

---

## 4. Raw / Cache 2계층 DB 구조

### 설계 의도

수집(쓰기)과 서비스(읽기)를 테이블 단위로 분리해 서로의 작업이 간섭하지 않도록 함.

```
detail_raw   ──ETL──▶ detail_cache    (실시간 인구밀도 + 도로 / 5분 갱신)
density_raw  ──ETL──▶ density_cache   (인구밀도 예측 12시간 / 1시간 갱신)
weather_raw  ──ETL──▶ weather_cache   (날씨 예측 / 3시간 갱신, 기상청 발표 주기 동기화)
```

### ETL 원자성 보장

```python
def raw_to_cache_etl(domain):
    cursor.execute(f'DELETE FROM {domain}_cache')        # 기존 데이터 전체 제거
    cursor.executemany(f'INSERT INTO {domain}_cache ...') # 신규 데이터 일괄 적재
    conn.commit()
```

`DELETE + INSERT`를 단일 트랜잭션으로 처리 → 웹 요청이 캐시 교체 중간 상태를 읽지 않도록 보장.

---

## 5. 앱 시작 시 태그 조합 사전 계산 (메모리 캐싱)

### 문제

메인 페이지는 4개 태그(`food`, `beauty`, `drama`, `movie`)의 조합 선택에 따라 관광지 목록을 변경.  
조합 수 = $2^4 - 1 = 15$가지 → 요청마다 계산 시 불필요한 DB 반복 쿼리 발생.

### 해결

```python
@app.before_request
def initialize_cache():
    current_app.config['tag_cases'] = db.generate_tag_cases()
    # 앱 시작 시 15가지 조합 × 3개 언어(ko/en/ja) = 45개 목록을 메모리에 저장
```

요청 처리 시 `current_app.config.get('tag_cases', {}).get(locale, {})` 조회만으로 O(1) 응답.

---

## 6. Singleton 패턴으로 관광지 목록 중복 조회 제거

Cron 작업마다 80개 관광지 목록이 필요하지만, 이 데이터는 정적(변경 없음).

```python
class Attractions:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._attractions = cls._instance.get_station()  # DB 조회 1회
            cls._instance._id = cls._instance.get_id()
        return cls._instance  # 이후 호출은 기존 인스턴스 반환
```

`__iter__`, `__call__`, `__repr__` 구현으로 기존 리스트처럼 사용 가능하게 인터페이스를 유지.

---

## 7. 응답 데이터 최소화 (필요 컬럼만 추출)

외부 API 응답은 20개 이상의 속성을 포함하지만, 서비스에 필요한 것은 2~3개.  
응답 전체를 DB에 저장하지 않고 수집 시점에 즉시 필터링.

```python
# 실시간 인구밀도 fetch 시 (21개 속성 중 3개만 추출)
return (
    ('id',              city_data.get('AREA_CD')),
    ('AREA_CONGEST_LVL', city_data.get('AREA_CONGEST_LVL')),
    ('PPLTN_TIME',       city_data.get('PPLTN_TIME')),
)
```

> [!note] 의도
> DB 쓰기 시 불필요한 파싱·저장 비용 절감.  
> 네트워크 수신량은 동일하지만 **처리 및 저장 비용은 최소화**.

---

## 8. 재시도 전략 — 서비스 UX 우선 설계

```python
def fetch(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            print(f"Attempt {attempt+1}/{max_retries} failed: {err}")
    return {}  # 최종 실패 시 빈 dict 반환
```

**지수 백오프를 의도적으로 적용하지 않음.**  
이유: 백오프 적용 시 웹 응답 지연이 사용자에게 직접 노출되는 구조이기 때문.  
Cron 수집 실패는 다음 주기에 자연히 복구되므로, 빠른 실패(fast-fail) 후 빈 값 반환이 더 합리적 선택.

> [!note]- 지수 백오프 (Exponential Backoff)
> 실패할 때마다 재시도 간격을 2배씩 늘리는 전략
> 
> 1차 실패 → 1초 대기 → 재시도
>  2차 실패 → 2초 대기 → 재시도
>  3차 실패 → 4초 대기 → 재시도
>  4차 실패 → 8초 대기 → 재시도
> 
> 서버 과부하 상황에서 모든 클라이언트가 동시에 재시도하면 더 폭발하기 때문에, 간격을 벌려서 서버를 보호하는 목적으로 씁니다.
> AWS SDK, Google API 클라이언트 등이 기본으로 채택하는 방식입니다.

---

## 9. 따릉이 실시간 데이터 — 요청 분산 처리

따릉이 API는 최대 350건/요청으로 페이징 제한이 있음.

```python
# 9개 URL로 분할 후 aiohttp로 동시 fetch (전체 ~3,150개 대여소 커버)
urls = [f'...bikeList/{n*350+1}/{(n+1)*350}' for n in range(9)]

async with aiohttp.ClientSession() as session:
    tasks = [fetch_and_filter(session, url, station_id_dict) for url in urls]
    results = await asyncio.gather(*tasks)
```

각 페이지 응답에서 해당 관광지 주변 대여소만 즉시 필터링 → 불필요한 데이터가 메모리에 누적되지 않음.

---

## 10. Docker 경량화 및 보안

```dockerfile
FROM python:3.13-slim            # 불필요한 시스템 패키지 제거된 slim 이미지
RUN pip install --no-cache-dir   # pip 캐시 파일 이미지 레이어에 포함 안 함
RUN adduser --uid 1001 sesac     # 비root 사용자 생성 (UID 고정으로 볼륨 권한 일관성)
USER sesac                       # root 권한 없이 프로세스 실행
```

---

## 종합 요약

| 설계 결정 | 기법 | 정량적 효과 |
|---|---|---|
| 외부 API 지연 차단 | Raw/Cache 2계층 분리 | 웹 응답에서 외부 의존성 제거 |
| 수집 속도 개선 | async + ThreadPool 하이브리드 | 30.6s → 0.46s (날씨 기준) |
| API 호출 최소화 | 좌표 중복 제거 + 팬아웃 | 80회 → 18회 (~78% 감소) |
| 요청별 연산 제거 | 태그 조합 사전 계산 | O(n) DB 쿼리 → O(1) 메모리 조회 |
| 반복 DB 조회 제거 | Singleton 패턴 | 정적 데이터 1회 로드 후 재사용 |
| 저장·처리 비용 절감 | 응답 데이터 최소화 | 필요 컬럼만 추출해 파싱 부담 감소 |
| 이미지 크기 최소화 | slim 이미지 + no-cache-dir | 불필요한 레이어 제거 |
| 보안 강화 | 비root 실행 | 컨테이너 침해 시 권한 제한 |
>[!note]- 팬아웃(Fan-out)
>하나의 결과를 여러 대상으로 퍼뜨리는 것입니다.
>
 >nowinseoul 코드에서의 예시:
>
> 기상청 API 좌표 (37_126) 1회 호출
>            │
>           ├─▶ 경복궁 (attraction_id: 1)
>           ├─▶ 광화문 (attraction_id: 2)
>           └─▶ 청계천 (attraction_id: 5)
>
>  세 관광지가 같은 기상청 격자 좌표에 속해 있으므로, API는 1번만 호출하고 결과를 3개 row로 펼쳐서 DB에 씁니다.
>```python
>  insert_data = [
>      {**d, 'id': id_}
>      for d in final_results          # API 결과 1개
>      for id_ in xy_id_map[좌표키]    # → 3개 attraction_id로 팬아웃
>  ]
>  ```

---

*작성일: 2026-04-12*
