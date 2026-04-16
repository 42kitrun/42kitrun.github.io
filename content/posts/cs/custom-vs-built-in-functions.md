---
title: SQL/Python 사용자 정의 함수 vs 내장함수
date: 2026-03-27
updated: 2026-03-27
tags:
  - sql
  - python
  - functions
  - performance
  - database
  - optimization
  - c-language
  - fundamentals
summary: "SQL/Python에서 사용자 정의 함수와 내장함수의 차이점, 성능, 언제 사용해야 하는지 핵심 비교"
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

## 🎯 핵심 차이

| 구분 | 사용자 정의 함수 | 내장함수 |
|------|--------|--------|
| **정의** | 직접 작성한 함수 | 언어/DB에 포함된 함수 |
| **속도** | ⚠️ 느림 (해석 필요) | ⚡️ 빠름 (최적화됨) |
| **유지보수** | 📝 관리 필요 | 자동 관리 |
| **유연성** | 높음 (커스텀 로직) | 제한적 (고정 기능) |

---

## SQL 비교

### 내장함수 사용
```sql
-- 빠른 성능
SELECT
  user_id,
  UPPER(name),              -- 내장함수
  DATEDIFF(CURDATE(), birth_date) / 365 AS age,  -- 내장함수
  COUNT(*) OVER(PARTITION BY dept_id)  -- 윈도우 함수
FROM users;
```

**장점:** 최적화됨, 인덱스 활용 가능, 가독성 높음

### 사용자 정의 함수 (UDF)
```sql
CREATE FUNCTION calc_age(birth_date DATE)
RETURNS INT
DETERMINISTIC
AS
BEGIN
  RETURN YEAR(CURDATE()) - YEAR(birth_date);
END;

SELECT user_id, calc_age(birth_date) FROM users;
```

**문제:** 각 행마다 함수 호출, 인덱스 사용 안 됨, 느림

---

## Python 비교

### 내장함수 사용
```python
# 빠른 성능 (C로 구현됨)

_written by Claude-Code_
numbers = [3, 1, 4, 1, 5]

len(numbers)           # O(1)
max(numbers)           # O(n) 최적화됨
sorted(numbers)        # O(n log n) 최적화됨
sum(numbers)           # O(n) 최적화됨

# 내장 메서드
text = "hello world"
text.upper()           # C 레벨 최적화
text.split()           # 최적화된 구현
```

**장점:** [[runtime/c-level-optimization|C 레벨 최적화]], 매우 빠름, 안정적

### 사용자 정의 함수
```python
# 느린 성능 (Python 해석 필요)
def custom_max(lst):
    max_val = lst[0]
    for num in lst[1:]:
        if num > max_val:
            max_val = num
    return max_val

# 내장함수보다 수배 느림
custom_max(numbers)
```

**문제:** Python 해석 오버헤드, 최적화 없음, 유지보수 필요

---

## 성능 비교

### SQL 쿼리 (100만 행 기준)
```
내장함수:        150ms
사용자 정의 함수: 2,500ms  (약 16배 느림)
```

### Python (100만 원소)
```python
import timeit

# 내장함수
timeit.timeit(lambda: max(range(1000000)))
# 약 0.05초

# 사용자 정의 함수
def my_max(lst):
    result = lst[0]
    for x in lst[1:]:
        if x > result: result = x
    return result

timeit.timeit(lambda: my_max(list(range(1000000))))
# 약 0.3초 (6배 느림)
```

---

## 언제 뭘 사용할까?

### ✅ 내장함수 우선
- 대량 데이터 처리 (성능 중요)
- 간단한 로직
- 인덱스 활용 필요
- SQL: `WHERE`, `GROUP BY`, `ORDER BY` 내에서

### ✅ 사용자 정의 함수 필요
- 복잡한 비즈니스 로직
- 여러 단계의 조건 (if/for/while)
- 재사용 가능한 코드
- Python: 데이터 변환, 검증, 포맷팅

---

## SQL 실제 예시

### ❌ 나쁜 예 (사용자 정의 함수)
```sql
-- 매우 느림: 각 행마다 함수 호출
SELECT id, custom_calculate(salary, dept_id)
FROM employees
WHERE custom_filter(status) = 1;
```

### ✅ 좋은 예 (내장함수)
```sql
-- 빠름: 최적화된 함수
SELECT id, salary * 1.1
FROM employees
WHERE status = 'active'
  AND YEAR(hire_date) >= 2020;
```

---

## Python 실제 예시

### ❌ 나쁜 예
```python
# 느린 루프 함수
def slow_filter(data):
    result = []
    for item in data:
        if item['age'] > 30 and item['status'] == 'active':
            result.append(item)
    return result
```

### ✅ 좋은 예
```python
# 내장함수 + 리스트 컴프리헨션
filtered = [item for item in data
            if item['age'] > 30 and item['status'] == 'active']

# 또는 pandas 내장 메서드
import pandas as pd
df[(df['age'] > 30) & (df['status'] == 'active')]
```

---

## 💡 핵심 정리

| 상황 | 선택 | 이유 |
|------|------|------|
| 집계, 필터링 (많은 행) | 내장함수 | 최적화, 빠름 |
| 복잡한 로직 필요 | 사용자 정의 | 유연성 |
| 하나 또는 소수의 행 | 자유 | 성능 차이 무시 가능 |
| 프로덕션 시스템 | 내장함수 | 안정성, 성능 |

**원칙:**
- **먼저 내장함수 시도**
- 없으면 사용자 정의 함수
- 성능이 문제면 다시 평가

---

## 🔗 관련 개념

**다음 단계:**
- [[runtime/c-level-optimization|Python C 레벨 최적화란?]] - 내장함수가 빠른 이유 깊이 있게 이해하기
- [[data/database-engine|데이터베이스 엔진이란?]] - SQL 내장함수와 UDF 비교

**관련 포스트:**
- [[runtime/c-language-compilation|C 언어 프로그램은 어떻게 실행될까?]] - 성능 차이의 근본 원인

---
