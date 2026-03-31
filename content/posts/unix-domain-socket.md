---
title: Unix Domain Socket (유닉스 도메인 소켓)
date: 2026-03-24
updated: 2026-03-24
tags:
  - ipc
  - linux
  - networking
  - optimization
  - nginx
summary: "같은 호스트 내 프로세스 간 통신을 TCP/IP 스택 없이 파일 경로로 처리하는 IPC 메커니즘"
devto: true
devto_id:
devto_url:
---
# Unix Domain Socket (유닉스 도메인 소켓)

## 1. 왜 알아야 할까? (Why)

**상황 :** [[nowinseoul]] 프로젝트 t3.small 단일 서버에서 `nginx → gunicorn → flask` 구성 시, 기본값은 TCP 소켓(`localhost:8000`)이다. 

**기존 방식의 한계**

- TCP는 같은 머신 내부 통신이라도 OS 네트워크 스택(패킷 캡슐화 → 라우팅 → 디캡슐화)을 반드시 통과한다.
- 저사양 인스턴스에서는 무시할 수 없는 CPU 비용이다.

**해결** - Unix Domain Socket 방식으로 성능 최적화

- 네트워크 스택을 완전히 우회하고 커널 내부 버퍼로 직접 전달 → **레이턴시 감소 + CPU 절감**
- nginx - docker 에서 설정, **공유 볼륨으로 `.sock` 파일을 마운트**

```
  nginx 컨테이너    ──┐
                    ├── 공유 볼륨 (/run/gunicorn.sock)
  gunicorn 컨테이너 ──┘
```

---

## 2. 개념 설명 (What)

> 파일 시스템 경로(`.sock`)를 주소로 사용하는, 동일 호스트 전용 IPC(프로세스 간 통신) 방식.

**동작 원리**

```
# TCP 방식
nginx → [L3/L4 네트워크 스택] → 127.0.0.1:8000 → [L3/L4 네트워크 스택] → gunicorn

# Unix Domain Socket 방식
nginx → [커널 내부 버퍼] → /run/gunicorn.sock → gunicorn
```

`.sock` 파일은 데이터가 저장되는 파일이 아니라, 커널이 두 프로세스를 연결하는 **엔드포인트 참조**다.

**웹소켓(WebSocket)과의 차이**

|구분|Unix Domain Socket|WebSocket|
|---|---|---|
|계층|OS 커널 수준 IPC|L7 애플리케이션 프로토콜|
|통신 범위|동일 호스트 전용|네트워크 너머 클라이언트-서버|
|주소|파일 경로 (`.sock`)|`ws://` URL|
|네트워크 스택|우회|사용 (TCP 위에서 동작)|

이름에 "소켓"이 공통으로 들어가지만 완전히 다른 개념이다.

---

## 3. 예시 (How)

**실무 사용 사례**

- **nginx + gunicorn/uwsgi:** Django, Flask 공식 배포 가이드 모두 단일 서버 구성에서 TCP 대신 Unix socket을 권장한다.
- **Docker daemon:** Docker CLI ↔ daemon 통신이 `/var/run/docker.sock` 기반이다. CI/CD(Jenkins, GitLab Runner)에서 이 파일을 컨테이너에 마운트해 호스트 Docker를 제어하는 패턴이 일반적이다.
- **PostgreSQL:** 로컬 접속 기본값이 `/var/run/postgresql/.s.PGSQL.5432`다. `psql` 접속 시 호스트 지정 없이 연결되는 이유다.

---

## 4. 장단점 & 주의사항

|구분|내용|
|---|---|
|장점|네트워크 스택 우회 → 낮은 레이턴시, CPU 절감|
|장점|포트 충돌 없음, 방화벽 규칙 불필요|
|단점|동일 호스트 전용 — 멀티 서버 스케일아웃 시 사용 불가|
|주의|nginx와 gunicorn 실행 유저가 다를 경우 `.sock` 파일 권한 오류 발생. `chmod`/`chown` 필수|
|주의|컨테이너 간 통신에는 사용 불가. 컨테이너 ↔ 호스트 간에는 볼륨 마운트로 소켓 파일 공유 필요|

---

## 5. 마무리

- Unix Domain Socket은 단일 서버에서 TCP/IP 스택을 제거해 IPC 효율을 높이는 OS 수준 메커니즘이다.
- nginx-gunicorn, Docker daemon, PostgreSQL 로컬 접속 등에서 이미 업계 표준 관행으로 사용된다.
- 스케일아웃 환경에서는 적용 불가 — **단일 서버 최적화 목적**으로 이해하고 사용할 것.

---

## 참고 자료

- [Gunicorn 공식 문서 - Deploying](https://docs.gunicorn.org/en/stable/deploy.html)
- [Nginx 공식 문서 - upstream module](https://nginx.org/en/docs/http/ngx_http_upstream_module.html)
- [Docker 공식 문서 - daemon socket](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-socket-option)
- [Linux man page - unix(7)](https://man7.org/linux/man-pages/man7/unix.7.html)
