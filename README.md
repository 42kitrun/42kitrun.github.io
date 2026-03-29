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

## 🔧 GitHub Actions 워크플로우

### 워크플로우 트리거
- **자동**: `Blog/Published/**.md` 파일 변경 시
- **수동**: GitHub Actions 대시보드에서 `workflow_dispatch` 실행

### 워크플로우 구성

```yaml
┌─────────────────────────────────────────────┐
│   GitHub Actions: Auto-Publish Blog         │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  🔒 Security Check Job                      │
│  ├─ Verify no Drafts in repository         │
│  └─ Verify no secrets exposed              │
└─────────────────────────────────────────────┘
         ↓ (needs: security-check)
┌─────────────────────────────────────────────┐
│  📤 Publish Job                             │
│  ├─ Checkout repository                    │
│  ├─ Set up Ruby 3.2 + bundler cache       │
│  ├─ Set up Python 3.10                    │
│  ├─ 🤖 Translate to English (Claude API)  │
│  ├─ 📱 Publish to Dev.to                  │
│  ├─ 🔨 Build Jekyll site                  │
│  ├─ 🔒 Verify no Drafts in build output  │
│  ├─ 📦 Upload artifact to GitHub          │
│  ├─ 🚀 Deploy to GitHub Pages             │
│  └─ 🔗 Update frontmatter with Dev.to links
└─────────────────────────────────────────────┘
```

### 언어 설정
- `lang: ko` - 한국어 (자동 번역됨)
- `lang: en` - 영어 (번역 대상 파일)

---

## 🔐 보안 기능

### 자동 검증

1. **Drafts 폴더 보호**
   - 임시 파일(`Blog/Drafts/`)은 배포되지 않음
   - 실수로 커밋되면 워크플로우 자동 실패

2. **민감 정보 검증**
   - `.env`, `.key`, `.pem` 파일 자동 검사
   - API 키, 개인 정보 누수 방지

3. **빌드 출력 검증**
   - Jekyll 빌드 후 Drafts 포함 여부 재확인
   - 추가 보안 계층

---

## 🌐 배포 환경

| 플랫폼          | URL                                                                                | 상태                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub Pages | [https://42kitrun.github.io](https://42kitrun.github.io) | [![Pages deployment](https://github.com/42kitrun/42kitrun.github.io/actions/workflows/publish.yml/badge.svg)](https://github.com/42kitrun/42kitrun.github.io/actions) |
| Dev.to       | [@42kitrun](https://dev.to/42kitrun)                                               | 자동 동기화                                                                                                                                                    |

---

## 📊 시스템 구성도

### 시스템 다이어그램

![System Architecture Diagram](assets/images/blog_pipeline.png)

---

## 📚 학습 자료

- [Jekyll 공식 문서](https://jekyllrb.com/docs/)
- [GitHub Pages 가이드](https://docs.github.com/en/pages)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Dev.to API 문서](https://developers.forem.com/api)

---

## 👤 저자

**42kitrun**
- GitHub: [@42kitrun](https://github.com/42kitrun)
- Dev.to: [@42kitrun](https://dev.to/42kitrun)

---

## 📞 지원

문제가 발생하면 [Issues](https://github.com/42kitrun/github_pages/issues) 탭에서 이슈를 작성해주세요.

---

**⭐ 도움이 되셨나요? 이 리포지토리를 스타해주세요!**
