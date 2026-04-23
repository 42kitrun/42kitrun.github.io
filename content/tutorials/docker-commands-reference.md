---
title: Docker 명령어 레퍼런스
date: '2026-03-30'
updated: '2026-03-30'
tags:
  - docker
  - commands
  - reference
  - cli
related_projects:
  - nowinseoul
description: 자주 사용하는 Docker 명령어 정리
---

# Docker 명령어 레퍼런스

Docker CLI에서 자주 사용하는 명령어를 정리한 레퍼런스입니다.

## 이미지 관련 명령어

### 이미지 빌드

```bash
# 기본 빌드
docker build -t 이미지명:태그 .

# 플랫폼 지정 + 캐시 무시
docker build --platform linux/amd64 --no-cache -t 이미지명:태그 .

# 빌드 컨텍스트 지정
docker build -t 이미지명:태그 -f ./Dockerfile ./src
```

### 이미지 목록 조회

```bash
# 모든 이미지 목록
docker image ls

# 또는 간단 표기
docker images

# 크기 포함
docker images --no-trunc

# 특정 이미지만 조회
docker images 이미지명
```

### 이미지 태그 추가

```bash
docker tag 소스이미지:태그 대상이미지:태그

# 예시
docker tag my-app:local myusername/my-app:v1.0
```

### 이미지 삭제

```bash
# 이미지 ID로 삭제
docker rmi 이미지ID

# 이미지명으로 삭제
docker rmi 이미지명:태그

# 강제 삭제
docker rmi -f 이미지ID

# 사용 중이 아닌 모든 이미지 삭제
docker image prune
```

### 이미지 정보 조회

```bash
# 이미지 상세 정보
docker image inspect 이미지ID

# 이미지 히스토리 (레이어 확인)
docker image history 이미지명:태그
```

### 이미지 검색

```bash
# Docker Hub에서 이미지 검색
docker search 이미지명

# 별 개수 필터
docker search --filter "stars=100" 이미지명
```

---

## 컨테이너 관련 명령어

### 컨테이너 실행

```bash
# 기본 실행
docker run -d my-app:latest

# 포트 바인딩
docker run -d -p 5000:8000 my-app:latest

# 볼륨 마운트
docker run -d -v /host/path:/container/path my-app:latest

# 환경변수 지정
docker run -d -e DB_HOST=localhost my-app:latest

# 환경변수 파일 사용
docker run -d --env-file .env my-app:latest

# 컨테이너명 지정
docker run -d --name my-container my-app:latest

# 리소스 제한
docker run -d -m 512m --cpus 0.5 my-app:latest

# 상호작용 모드 (TTY + 입력)
docker run -it my-app:latest /bin/bash

# 모두 함께 사용
docker run -d \
  --name my-app \
  -p 5000:8000 \
  -v /app/data:/data \
  --env-file .env \
  -m 512m \
  my-app:latest
```

### 컨테이너 목록 조회

```bash
# 실행 중인 컨테이너
docker ps

# 모든 컨테이너 (실행 중 + 중지됨)
docker ps -a

# 최근 N개 컨테이너
docker ps -n 5

# 상세 정보 포함
docker ps --no-trunc
```

### 컨테이너 생명주기

```bash
# 컨테이너 중지
docker stop 컨테이너ID

# 컨테이너 중지 (강제)
docker kill 컨테이너ID

# 중지된 컨테이너 재시작
docker start 컨테이너ID

# 컨테이너 재시작
docker restart 컨테이너ID

# 컨테이너 일시 정지
docker pause 컨테이너ID

# 일시 정지 해제
docker unpause 컨테이너ID

# 컨테이너 삭제
docker rm 컨테이너ID

# 강제 삭제
docker rm -f 컨테이너ID

# 사용 중이 아닌 모든 컨테이너 삭제
docker container prune
```

### 컨테이너 내부 접근

```bash
# 실행 중인 컨테이너에서 명령어 실행
docker exec -it 컨테이너ID /bin/bash

# 특정 명령어 실행
docker exec 컨테이너ID ls -la

# 파일 복사 (컨테이너 → 호스트)
docker cp 컨테이너ID:/path/to/file ./local/path

# 파일 복사 (호스트 → 컨테이너)
docker cp ./local/file 컨테이너ID:/container/path
```

### 컨테이너 로그 확인

```bash
# 로그 조회
docker logs 컨테이너ID

# 실시간 로그 조회
docker logs -f 컨테이너ID

# 마지막 N줄만 조회
docker logs --tail 100 컨테이너ID

# 타임스탑 포함
docker logs -t 컨테이너ID

# 시간 기준 조회
docker logs --since 2026-03-30T14:00:00 컨테이너ID
```

### 컨테이너 정보 조회

```bash
# 상세 정보
docker inspect 컨테이너ID

# 포트 정보만 조회
docker port 컨테이너ID

# 리소스 사용량
docker stats 컨테이너ID

# 파일 변경사항
docker diff 컨테이너ID
```

---

## Docker Hub 명령어

```bash
# Docker Hub에 로그인
docker login

# Docker Hub에서 로그아웃
docker logout

# 이미지 다운로드
docker pull myusername/my-app:latest

# 이미지 업로드
docker push myusername/my-app:latest

# Docker Hub에서 이미지 검색
docker search 이미지명
```

---

## 네트워크 관련 명령어

```bash
# 네트워크 목록
docker network ls

# 네트워크 생성
docker network create 네트워크명

# 네트워크 정보 조회
docker network inspect 네트워크명

# 네트워크 연결
docker network connect 네트워크명 컨테이너ID

# 네트워크 분리
docker network disconnect 네트워크명 컨테이너ID

# 네트워크 삭제
docker network rm 네트워크명
```

---

## 볼륨 관련 명령어

```bash
# 볼륨 목록
docker volume ls

# 볼륨 생성
docker volume create 볼륨명

# 볼륨 정보 조회
docker volume inspect 볼륨명

# 볼륨 삭제
docker volume rm 볼륨명

# 사용 중이 아닌 볼륨 삭제
docker volume prune
```

---

## 시스템 명령어

```bash
# Docker 버전
docker version

# Docker 정보
docker info

# 시스템 리소스 사용량
docker stats

# 디스크 사용량
docker system df

# 사용하지 않는 리소스 정리
docker system prune

# 강제 정리 (경고 없음)
docker system prune -a --volumes
```

---

## 유용한 팁

### 모든 컨테이너 중지

```bash
docker stop $(docker ps -q)
```

### 모든 컨테이너 삭제

```bash
docker rm -f $(docker ps -aq)
```

### 모든 이미지 삭제

```bash
docker rmi -f $(docker images -q)
```

### 컨테이너명으로 이미지 빌드 및 실행

```bash
# 빌드
docker build -t my-app:latest .

# 실행
docker run -d --name my-container my-app:latest

# 접속
docker exec -it my-container /bin/bash
```

### 로그인 없이 이미지 다운로드

```bash
# 공개 이미지만 가능
docker pull python:3.13-slim
```

---

## 자주 사용하는 조합 명령어

### 개발 중 빠른 테스트

```bash
# 이미지 빌드 + 실행
docker build -t my-app:local . && \
docker run -it --rm -p 5000:8000 my-app:local
```

### 프로덕션 배포

```bash
# 빌드 + 태그 + 푸시
docker build -t my-app:v1.0 . && \
docker tag my-app:v1.0 myusername/my-app:v1.0 && \
docker push myusername/my-app:v1.0
```

### 로그 모니터링

```bash
# 컨테이너 실행 후 실시간 로그 보기
docker run -d \
  --name my-app \
  -p 5000:8000 \
  my-app:latest && \
docker logs -f my-app
```

---

## 공식 문서

- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [Docker 공식 가이드](https://docs.docker.com/get-started/)

---

## 참고 링크

- [[docker-architecture|Docker 아키텍처 이해하기]]
- [[dockerfile-writing|Dockerfile 작성 가이드]]
- [[docker-build-and-run|Docker 빌드 및 실행]]
- [[docker-hub-publish|Docker Hub 푸시하기]]
- [[nowinseoul]] - 이 튜토리얼의 실제 적용 프로젝트
