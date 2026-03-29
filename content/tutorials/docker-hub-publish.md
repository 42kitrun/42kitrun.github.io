---
title: "Docker Hub에 이미지 푸시하기"
date: 2026-03-30
updated: 2026-03-30
tags: [docker, docker-hub, publishing, registry]
description: "Docker 이미지를 Docker Hub에 올리고 다운받기"
---

# Docker Hub에 이미지 푸시하기

## 공식 문서

[Docker Hub 가이드](https://docs.docker.com/docker-hub/)

## Docker Hub에 이미지 올리기

### 1단계: Docker Hub에 로그인

터미널에서 아래 명령어를 실행하고 Docker Hub 계정 인증을 진행합니다.

```bash
docker login
```

**터미널 실행 결과 예시**

```bash
$ docker login
Authenticating with existing credentials...

Info → To login with a different account, run 'docker logout' followed by 'docker login'

Username: myusername
Password: ••••••••••

Login Succeeded
```

### 2단계: 이미지 태그 추가

로컬에 있는 이미지에 Docker Hub 리포지토리명과 태그를 붙여줍니다.

```bash
docker tag <로컬이미지명:태그> <Docker_Hub_ID>/<이미지명>:<태그>

# 예시
docker tag nowinseoul:2025_09_07_19 myusername/nowinseoul:2025_09_07_19
```

**Docker Hub ID 확인 방법**
- https://hub.docker.com/repositories 접속
- 오른쪽 상단 **프로필 아이콘** → 드롭다운 메뉴에서 사용자 이름 확인
- 또는 https://hub.docker.com/repositories/myusername

### 3단계: 이미지 푸시 (업로드)

태그를 붙인 이미지를 Docker Hub에 푸시합니다.

```bash
docker push <Docker_Hub_ID>/<이미지명>:<태그>

# 예시
docker push myusername/nowinseoul:2025_09_07_19
```

**터미널 실행 결과 예시**

```bash
$ docker push myusername/nowinseoul:2025_09_04_01
The push refers to repository [docker.io/myusername/nowinseoul]
a15746fb62d4: Pushing  15.11MB/63.39MB
e1dbe8851ff6: Pushed
b2231c2ea17d: Pushed
b574e89249d2: Pushing  34.19MB/63.38MB
951f03d204c0: Pushing  36.06MB/409.8MB
aa1a6a6ffa05: Pushed
4af10450afa4: Pushed
a72c129d8f87: Mounted from library/python
2025_09_04_01: digest: sha256:37e9fb6319429a64357084d3fdc51d178a5e77ffde1b517585c8042af1b96d1d
size: 2626
```

### 4단계: Docker Hub 웹사이트에서 확인

Docker Hub에 로그인 후 Repositories에서 정상 업로드 여부를 확인할 수 있습니다.

**경로**: https://hub.docker.com/repositories/myusername

![[Docker Hub Repository]](https://docs.docker.com/assets/images/hub-repositories.png)

---

## Docker Hub에서 이미지 다운받기

### 1단계: 이미지 검색 (선택사항)

Docker Hub에서 원하는 이미지를 이름으로 검색할 수 있습니다.

```bash
docker search <이미지명>

# 예시
docker search nowinseoul
```

**터미널 실행 결과 예시**

```bash
$ docker search nowinseoul
NAME                 DESCRIPTION   STARS     OFFICIAL
myusername/nowinseoul               0
```

### 2단계: 이미지 다운로드

Docker Hub에 등록된 이미지를 로컬로 가져올 때는 다음 명령어를 사용합니다.

```bash
docker pull <Docker_Hub_ID>/<이미지명>:<태그>

# 예시
docker pull myusername/nowinseoul:2025_09_07_19
```

**터미널 실행 결과 예시**

```bash
$ docker pull myusername/nowinseoul:2025_09_04_01
2025_09_04_01: Pulling from myusername/nowinseoul
9a6263cdeaa5: Pull complete
154984c62312: Pull complete
72eefd466169: Pull complete
099d892ea0b1: Pull complete
eef255fb6b3e: Pull complete
455a3172108c: Pull complete
32748a8b4cbb: Extracting [=================================>  ] 78.54MB/116.9MB
0cd18e947c59: Download complete
6e3a9214858e: Download complete
779bb3e44290: Download complete
11c756d64020: Download complete

Status: Downloaded newer image for myusername/nowinseoul:2025_09_04_01
```

### 3단계: 다운로드된 이미지 확인

```bash
docker images
```

**출력 예시**

```bash
REPOSITORY                  TAG              IMAGE ID       CREATED        SIZE
myusername/nowinseoul       2025_09_04_01    a15746fb62d4   2 hours ago    450MB
nowinseoul                  latest           b2231c2ea17d   1 day ago      450MB
python                      3.13-slim        c3d4bf2e8f9d   1 week ago     125MB
```

---

## 이미지 테그 관리 전략

### 버전 태깅의 중요성

같은 이미지에 여러 태그를 붙여서 버전을 관리합니다:

```bash
# 빌드한 이미지
docker tag nowinseoul:2025_09_07_19 myusername/nowinseoul:2025_09_07_19

# 최신 버전도 함께 태깅
docker tag nowinseoul:2025_09_07_19 myusername/nowinseoul:latest

# 푸시
docker push myusername/nowinseoul:2025_09_07_19
docker push myusername/nowinseoul:latest
```

### 태그 네이밍 규칙

**권장 패턴**

1. **날짜 기반**: `2025_09_07_19` (연_월_일_시)
2. **의미 있는 버전**: `v1.0`, `v1.0.1`, `v2.0`
3. **최신 버전**: `latest` (항상 최신 빌드 가리킴)

**예시**

```bash
# 날짜 기반
docker tag my-app:local myusername/my-app:2025_03_30_14

# 의미 있는 버전
docker tag my-app:local myusername/my-app:v1.2.3

# 최신
docker tag my-app:local myusername/my-app:latest

# 모두 같은 이미지를 가리킴
docker push myusername/my-app:2025_03_30_14
docker push myusername/my-app:v1.2.3
docker push myusername/my-app:latest
```

---

## 주요 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `docker login` | Docker Hub에 로그인 |
| `docker logout` | Docker Hub에서 로그아웃 |
| `docker tag 로컬이미지 리포지토리/이미지` | 이미지에 태그 추가 |
| `docker push 리포지토리/이미지` | 이미지를 Docker Hub에 올리기 |
| `docker pull 리포지토리/이미지` | Docker Hub에서 이미지 다운로드 |
| `docker search 이미지명` | Docker Hub에서 이미지 검색 |

---

## 참고 링크

- [[docker-build-and-run|Docker 빌드 및 실행하기]]
- [[docker-commands-reference|Docker 명령어 레퍼런스]]
