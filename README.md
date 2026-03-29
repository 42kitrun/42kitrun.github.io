# 42kitrun's Technical Blog

[![GitHub Pages](https://github.com/42kitrun/42kitrun.github.io/actions/workflows/publish.yml/badge.svg)](https://github.com/42kitrun/42kitrun.github.io/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🇰🇷 **한국어** | 🇺🇸 **English**

개인 기술 블로그입니다. 프로그래밍, 데이터 구조, 시스템 아키텍처 등 다양한 기술 주제를 다룹니다.

**Live**: https://42kitrun.github.io/

---

## ✨ 특징

- 📝 **Markdown 기반**: 모든 포스트는 마크다운으로 작성
- 🔗 **Obsidian 스타일**: Wiki-link 기반 상호 참조 지원
- 🏗️ **체계적 구조**: posts, tutorials, archive로 나뉜 콘텐츠 조직
- 🇰🇷 **이중 언어**: 한국어 및 영어 콘텐츠 지원
- 🚀 **GitHub Pages**: 자동 배포 및 호스팅
- 🎯 **검색 최적화**: 메타데이터 기반 SEO
- 📚 **풍부한 메타데이터**: 태그, 날짜, 카테고리 등 체계적 관리

---

## 📁 프로젝트 구조

```
42kitrun.github.io/
├── content/
│   ├── posts/              # 📝 기술 블로그 포스트
│   │   └── index.md       # 포스트 인덱스
│   ├── tutorials/         # 📚 튜토리얼 & 가이드
│   │   └── index.md
│   ├── archive/           # 🗂️ 아카이브
│   │   └── index.md
│   ├── docs/              # 📖 프로젝트 문서
│   └── index.md           # 홈페이지
├── .github/
│   └── workflows/
│       └── publish.yml    # CI/CD 파이프라인
├── docs/                  # 빌드 결과물 (GitHub Pages)
├── .obsidian/             # Obsidian 설정
├── README.md              # 이 파일
└── .gitignore
```

## 🚀 블로그 포스트 작성 가이드

### 1단계: 포스트 파일 생성
`content/posts/` 디렉토리에 마크다운 파일 생성:

```markdown
---
title: "포스트 제목"
date: 2026-03-30
updated: 2026-03-30
tags: [tag1, tag2]
description: "간단한 설명"
---

# 포스트 본문
여기부터 내용을 작성하세요.

## 하위 섹션
내용...

## 참고 자료
[[다른-포스트|참조]]
```

### 2단계: 메타데이터 설정
- **title**: 포스트 제목
- **date**: 작성일 (YYYY-MM-DD)
- **updated**: 최종 수정일
- **tags**: 태그 배열 (소문자, 하이픈)
- **description**: SEO 설명

### 3단계: Wiki-link 사용 (선택사항)
포스트 간 상호 참조:
```markdown
[[unix-domain-socket|Unix Domain Socket 설명 보기]]
```

### 4단계: 커밋 및 푸시
```bash
git add content/posts/
git commit -m "feat: add new blog post about topic"
git push origin main
```

## 📤 자동 배포

GitHub Pages에 자동으로 배포됩니다:
1. 마크다운 파일이 `content/posts/`에 추가됨
2. GitHub Actions가 자동으로 트리거됨
3. HTML로 빌드되어 `docs/` 디렉토리에 생성
4. GitHub Pages에서 자동 배포
5. 약 1-2분 후 라이브 사이트에 반영

---

## 🔧 CI/CD 파이프라인

자동 배포는 `.github/workflows/publish.yml`에서 관리됩니다.

**트리거 조건:**
- `content/posts/` 디렉토리의 마크다운 파일 변경
- GitHub Actions 수동 실행

**처리 과정:**
1. 리포지토리 체크아웃
2. 마크다운 파일 처리
3. 정적 사이트 생성
4. `docs/` 디렉토리에 빌드 결과 저장
5. GitHub Pages 자동 배포

## 🌐 배포

| 플랫폼 | URL | 상태 |
|--------|-----|------|
| GitHub Pages | https://42kitrun.github.io | [![Pages deployment](https://github.com/42kitrun/42kitrun.github.io/actions/workflows/publish.yml/badge.svg)](https://github.com/42kitrun/42kitrun.github.io/actions) |

## 📖 추가 자료

- [GitHub Pages 문서](https://docs.github.com/en/pages)
- [Markdown 가이드](https://www.markdownguide.org/)
- [Obsidian 문서](https://obsidian.md/help)

## 👨‍💻 저자

**42kitrun**
- GitHub: [@42kitrun](https://github.com/42kitrun)

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.
