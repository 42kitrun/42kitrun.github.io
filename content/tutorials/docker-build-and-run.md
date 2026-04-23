---
title: Docker 이미지 빌드 및 컨테이너 실행
date: '2026-03-30'
updated: '2026-03-30'
tags:
  - docker
  - build
  - container
  - run
  - execution
related_projects:
  - nowinseoul
description: Dockerfile로 이미지 빌드하기, 컨테이너 실행 및 포트 바인딩
---

# Docker 이미지 빌드 및 컨테이너 실행

## Docker 이미지 빌드

### 빌드 명령어

```bash
docker build [옵션] -t 이미지명:태그 .
```

**실제 예시**

```bash
docker build --platform linux/amd64 --no-cache -t my-app:v1.0 .
```

### 주요 옵션 설명

**`--platform linux/amd64`**
- 내 컴퓨터의 아키텍처와 다른 아키텍처용 이미지를 빌드할 때 사용합니다.
- M1 맥북 같은 ARM64 아키텍처 환경에서 리눅스 x86_64 서버에 배포할 도커 이미지를 만들 때 필요합니다.
- 현대 Docker 엔진은 대부분 다중 플랫폼을 지원합니다: `arm64`, `amd64`, `riscv64`, `ppc64le`, `s390x`, `386`, `arm/v7`, `arm/v6`

**`--no-cache`**
- 빌드 과정의 캐시를 사용하지 않습니다.
- 패키지의 최신 버전을 설치하거나, 캐시로 인한 문제를 해결할 때 사용합니다.

**`-t 이미지명:태그`**
- 빌드할 이미지에 이름과 태그를 붙입니다.
- 예: `my-app:v1.0`, `my-app:v1.0`, `my-app:latest`
- 태그는 버전 관리나 여러 버전을 구분하기 위해 사용합니다.

**`.`(점)**
- 현재 디렉터리를 "빌드 컨텍스트"로 사용하겠다는 뜻입니다.
- Dockerfile과 필요한 파일들을 이 위치에서 찾아 이미지를 만듭니다.

### 빌드 후 보안 검사

```bash
docker scout quickview my-app:v1.0
```

**docker scout quickview의 역할**
- 도커 이미지의 취약점 요약과 개선 권고사항을 빠르게 보여줍니다.
- 베이스 이미지의 취약점 및 업데이트 권고를 제공합니다.
- 중간/낮음 수준의 취약점 수를 표시하여 보안 상태를 평가할 수 있습니다.

## Docker 컨테이너 실행

### 기본 실행 명령어

```bash
docker run [옵션] 이미지명:태그
```

### 주요 옵션

| 옵션 | 설명 | 예시 |
|-----|------|------|
| `-p 호스트포트:컨테이너포트` | 포트 바인딩 | `-p 5000:8000` |
| `-v 호스트경로:컨테이너경로` | 볼륨 마운트 (파일 공유) | `-v /app/data:/data` |
| `--env-file .env` | 환경변수 파일 사용 | `--env-file .env` |
| `-e 변수명=값` | 환경변수 직접 지정 | `-e DB_HOST=localhost` |
| `-d` | 백그라운드 실행 (Detach) | `-d` |
| `-it` | 상호작용 모드 | `-it` |
| `--name 컨테이너명` | 컨테이너 이름 지정 | `--name my-container` |
| `-m 메모리` | 메모리 제한 | `-m 512m` |
| `--cpus 개수` | CPU 할당 제한 | `--cpus 0.5` |

### 실행 예시

**기본 실행**

```bash
docker run -d -p 5000:8000 my-app:v1.0
```

이 명령어는:
- `-d`: 백그라운드에서 실행
- `-p 5000:8000`: 호스트의 5000 포트를 컨테이너의 8000 포트로 연결
- 웹브라우저에서 `http://localhost:5000`으로 접속하면 컨테이너의 8000 포트에 연결됩니다.

**환경변수 + 볼륨 마운트**

```bash
docker run --env-file .env \
           -p 5000:8000 \
           -v /app/data:/data \
           my-app:v1.0
```

호스트의 `/app/data` 디렉토리가 컨테이너의 `/data`로 마운트되어 파일을 공유합니다.

### 컨테이너 생명주기 관리

**docker run**
- 새로운 컨테이너를 이미지로부터 **생성(Create)**하고, 즉시 **실행(Start)**합니다.
- `Ctrl + C`로 중지시키면 컨테이너도 사라집니다.

```bash
docker run -d my-app:v1.0
```

**docker stop**
- **실행 중인 컨테이너를 중지(Stop)**합니다.
- 컨테이너 자체는 시스템에 남아 있습니다.

```bash
docker stop 컨테이너ID
docker ps -a  # 중지된 컨테이너 확인
```

**docker start**
- **이미 생성되었지만 중지된 컨테이너를 다시 시작(Start)**합니다.
- 새로운 컨테이너를 생성하지는 않습니다.

```bash
docker start 컨테이너ID
```

### 컨테이너 생명주기 비교

| 명령어 | 역할 | 컨테이너 존재 여부 |
|--------|------|------------------|
| `docker run` | 새로운 컨테이너 생성 + 실행 | 컨테이너 없어도 됨 |
| `docker stop` | 실행 중인 컨테이너 중지 | 실행 중인 컨테이너 필요 |
| `docker start` | 중지된 컨테이너 재시작 | 중지된 컨테이너 필요 |

## 포트 바인딩 이해하기

### 호스트 포트 vs 컨테이너 포트

```bash
docker run -p 5000:8000 my-app:v1.0
        ↑        ↑      ↑
      옵션   호스트포트 컨테이너포트
```

- **호스트 포트 (5000)**: EC2 또는 로컬 PC에서 접속할 때 사용하는 포트
- **컨테이너 포트 (8000)**: Gunicorn, Flask 등 애플리케이션이 내부에서 실행되는 포트

### 요청 흐름

```
외부 브라우저
    ↓
http://localhost:5000 (호스트 포트)
    ↓
Docker 호스트 (5000 포트)
    ↓
Docker 컨테이너 (8000 포트)
    ↓
Gunicorn / Flask 애플리케이션
```

## 환경변수 관리

### .env 파일 형식

```bash
# .env 파일
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_database
API_KEY=your_api_key_here
```

**주의사항**
- 변수명과 등호 주위 공백을 제거하세요.
- 공백이 포함된 값은 따옴표로 감싸지 마세요 (Docker CLI에서 지원 안 됨).
- 멀티라인 값이 필요하면 docker-compose를 사용하세요.

### 환경변수 사용

```bash
# .env 파일로 모든 환경변수 적용
docker run --env-file .env my-app:v1.0

# 또는 개별적으로 지정
docker run -e DB_HOST=localhost -e DB_PORT=5432 my-app:v1.0
```

## 볼륨 마운트

컨테이너와 호스트 간에 파일을 공유합니다.

### 사용 사례

**정적 파일 공유**
```bash
docker run -v /app/static:/app/static my-app:v1.0
```

**데이터베이스 파일 공유**
```bash
docker run -v /app/data:/data my-app:v1.0
```

**여러 볼륨 마운트**
```bash
docker run -v /app/static:/app/static \
           -v /app/data:/data \
           my-app:v1.0
```

### 호스트 권한 설정

정적 파일에 대해 웹 서버 사용자의 읽기 권한을 설정하는 예:

```bash
# Linux 호스트
sudo setfacl -R -m u:www-data:rx /app/static
sudo setfacl -R -d -m u:www-data:rx /app/static
```

## 유용한 docker 명령어

```bash
# 이미지 목록 조회
docker image ls

# 생성된 컨테이너 목록 (실행 중)
docker ps

# 모든 컨테이너 목록 (실행 중 + 중지됨)
docker ps -a

# 컨테이너 내부에서 명령어 실행
docker exec -it 컨테이너ID /bin/bash

# 로그 확인
docker logs 컨테이너ID

# 컨테이너 삭제
docker rm 컨테이너ID

# 이미지 삭제
docker rmi 이미지ID
```

## 참고 링크

- [[dockerfile-writing|Dockerfile 작성 가이드]]
- [[docker-hub-publish|Docker Hub에 푸시하기]]
- [[nowinseoul]] - 이 튜토리얼의 실제 적용 프로젝트
