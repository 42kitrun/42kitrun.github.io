---
title: "Dockerfile 작성 가이드"
date: 2026-03-30
updated: 2026-03-30
tags: [docker, dockerfile, containerization, python]
description: "Dockerfile 문법, 베이스 이미지 선택, 보안 설정 방법"
---

# Dockerfile 작성 가이드

## 공식 문서
[Docker Dockerfile 참고](https://docs.docker.com/build/concepts/dockerfile/)

## Dockerfile 예시 (Python 앱)

```dockerfile
## Dockerfile

# 사용할 베이스 이미지 (Python 3.13 버전 사용)
# 도커 허브에서 파이썬 이미지 찾기: https://hub.docker.com/_/python
FROM python:3.13-slim

# 컨테이너의 작업 디렉터리를 /app으로 설정
WORKDIR /app

# 로컬의 requirements.txt 파일을 컨테이너의 /app 디렉터리로 복사
COPY requirements.txt .

# requirements.txt에 명시된 모든 파이썬 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# 로컬의 모든 파일을 컨테이너의 /app 디렉터리로 복사
COPY . .

# Entrypoint 스크립트 복사
COPY docker-entrypoint.sh .

# 일반 사용자 생성 (보안 모범사례)
# 컨테이너 내에서 root가 아닌 다른 사용자로 프로세스를 실행하는 것은 보안 모범사례
RUN adduser --uid 1001 --disabled-password --gecos "" --ingroup www-data appuser && \
    chown -R appuser:www-data /app

# 일반 사용자로 전환
USER appuser

# Entrypoint 지정
ENTRYPOINT ["./docker-entrypoint.sh"]

# 포트 노출 (선택사항이지만 모범사례)
EXPOSE 8000

# 앱 실행
# CMD ["gunicorn", "-w", "2", "--bind", "0.0.0.0:8000", "app:app"]
```

## docker-entrypoint.sh 예시

```bash
#!/bin/bash
set -e

# Unix socket 파일이 충돌하므로 파일이 있으면 지워야 함
if [ -e /var/run/app.sock ]; then
    rm /var/run/app.sock
fi

# 환경변수 DB_PATH가 설정되어 있지 않을 때 기본 경로 지정
DB_PATH="${DB_PATH:=./instance/app.db}"

# instance 폴더가 없으면 생성
mkdir -p "$(dirname "$DB_PATH")"

# DB 파일 존재하지 않으면 초기화 스크립트 실행
if [ ! -f "$DB_PATH" ]; then
  echo "[ENTRYPOINT] Database not found at $DB_PATH. Initializing..."
  python init_app.py
else
  echo "[ENTRYPOINT] Database found at $DB_PATH. Skipping initialization."
fi

# Gunicorn으로 앱 실행 (프로덕션 권장)
echo "[ENTRYPOINT] Starting Gunicorn..."

# Unix 소켓 통신
exec gunicorn -w 2 --umask 007 --bind unix:/var/run/app.sock app:app
```

## 베이스 이미지 태그 선택

### Python 공식 이미지 태그별 특징

[Python 도커 이미지](https://hub.docker.com/_/python)

**slim 태그**
- **일반적인 이미지에서 문서, 소스 코드, 캐시 파일 등 불필요한 파일을 제거하여 용량을 대폭 줄인 경량 버전**입니다.
- 용량이 작아 컨테이너 빌드 및 배포 속도가 빠르다는 장점이 있습니다.
- 대부분의 웹 앱을 배포할 때 가장 많이 권장되는 버전입니다.
- 예: `python:3.13-slim`

**alpine 태그**
- **Alpine Linux를 기반으로 하는 이미지**입니다.
- Alpine Linux는 매우 작고 가벼운 리눅스 배포판으로, 이미지를 **최소한의 크기**로 만들 때 사용됩니다.
- `slim`보다도 더 작지만, 특정 C 라이브러리 등이 없어 호환성 문제가 발생할 수 있습니다.
- ⚠️ **주의**: Python Alpine은 일부 패키지의 빌드 시간이 길어질 수 있으므로 신중하게 선택하세요.

**Debian 버전 (bookworm, trixie)**
- **Debian GNU/Linux의 특정 버전을 기반으로 하는 이미지**입니다.
- `bookworm`은 현재 Debian 안정 버전입니다.
- `trixie`는 다음 버전의 코드네임으로 테스트 브랜치에 속합니다.

## Flask vs Gunicorn 비교

### Flask 내장 개발 서버

```dockerfile
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
```

| 특징 | 설명 |
|-----|------|
| 용도 | 개발용 내장 서버 |
| 동시 접속 처리 | 단일 프로세스, 제한적 |
| 성능 및 안정성 | 낮음 (테스트/개발만 추천) |
| Docker 권장도 | ❌ 비권장 |

### Gunicorn (프로덕션 권장)

```dockerfile
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

| 특징 | 설명 |
|-----|------|
| 용도 | 프로덕션용 WSGI 서버 |
| 동시 접속 처리 | 여러 워커 프로세스로 병렬 요청 처리 |
| 성능 및 안정성 | 높음 (실제 운영 서버로 적합) |
| Docker 권장도 | ✅ 권장 |

**Gunicorn 옵션 설명**
- `-w 4`: 워커 프로세스 4개 (동시 요청 병렬 처리)
- `-b 0.0.0.0:8000`: 모든 IP에서 8000 포트로 바인딩
- `app:app`: `app.py` 파일의 Flask 인스턴스 `app` 지정

## .dockerignore 파일

Docker가 이미지를 빌드할 때 빌드 컨텍스트에 포함하지 않을 파일이나 폴더를 지정합니다.

`.gitignore`과 비슷하게 동작하며, 불필요한 파일들을 제외해 이미지 크기를 줄이고 빌드 속도를 향상시킵니다.

### 권장 .dockerignore 설정

```bash
# Git 관련
.git
.gitignore

# IDE 및 시스템
.vscode/
.DS_Store
._*

# 민감정보
.env
.env.local

# 파이썬
__pycache__/
*.pyc
*.pyo
*.egg-info/
.pytest_cache/
.tox/

# 데이터베이스 및 임시 파일
*.db
*.sqlite
instance/*
*.log
test/*

# 개발용 파일
.editorconfig
README.md
CONTRIBUTING.md
LICENSE

# 미사용 리소스
node_modules/
tmp/
temp/
```

**주의사항**
- 이 파일이 없으면 모든 파일이 빌드 컨텍스트에 포함되어 이미지가 커지고 빌드 시간이 늘어날 수 있습니다.
- 민감한 정보(.env, 개인 키 등)는 반드시 제외하세요.

## Dockerfile 작성 모범사례

### 1. 다단계 빌드 (Multi-stage Build)

이미지 크기를 줄이기 위해 빌드 단계와 실행 단계를 분리합니다.

```dockerfile
# 빌드 단계
FROM python:3.13 AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 실행 단계
FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

### 2. 레이어 캐싱 활용

변경 빈도가 낮은 것부터 먼저 COPY하여 빌드 속도를 향상시킵니다.

```dockerfile
# ❌ 비효율적: 코드 변경 시마다 패키지 재설치
COPY . .
RUN pip install -r requirements.txt

# ✅ 효율적: 패키지는 캐시되고 코드만 다시 복사
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

### 3. 보안: 일반 사용자로 실행

```dockerfile
# root가 아닌 사용자로 실행하여 보안 향상
RUN adduser --uid 1001 --disabled-password --gecos "" appuser
USER appuser
```

## 참고 링크

- [[docker-architecture|Docker 아키텍처 이해하기]]
- [[docker-build-and-run|Docker 빌드 및 실행하기]]
- [[nowinseoul]] - 이 튜토리얼의 실제 적용 프로젝트
