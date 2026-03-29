# 42kitrun Blog(https://42kitrun.github.io/)

[![GitHub Pages](https://github.com/42kitrun/42kitrun.github.io/actions/workflows/publish.yml/badge.svg)](https://github.com/42kitrun/42kitrun.github.io/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Ruby 3.2+](https://img.shields.io/badge/ruby-3.2+-CC342D.svg)](https://www.ruby-lang.org/)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.3+-CC0000.svg)](https://jekyllrb.com/)
[![Multi-language](https://img.shields.io/badge/Languages-Korean%20%7C%20English-green.svg)](#-다국어-지원)

한국어와 영어를 지원하는 **자동화된 기술 블로그 플랫폼**입니다. Claude API를 활용한 자동 번역, GitHub Actions를 통한 원클릭 배포, Dev.to 자동 발행 기능을 제공합니다.

---

## ✨ 주요 기능

- 🌍 **다국어 지원**: 한국어로 작성하면 자동으로 영어 번역 생성
- 🤖 **AI 기반 번역**: Claude API를 활용한 고품질 번역
- 📱 **멀티 플랫폼 발행**: GitHub Pages + Dev.to 동시 배포
- ⚙️ **자동화 워크플로우**: Git push만으로 전체 배포 프로세스 자동 실행
- 🔒 **보안 검증**: 임시 저장소(Drafts)와 민감 정보 자동 검증
- 📊 **SEO 최적화**: Jekyll SEO 플러그인 기본 탑재
- 🎨 **Minima 테마**: 깔끔하고 반응형 디자인

---

## 🔄 자동 번역 및 발행 프로세스

### 1단계: 블로그 포스트 작성
```markdown
Blog/Published/2026-03-21-my-post.md
---
title: "내 첫 기술 블로그 포스트"
lang: ko
date: 2026-03-21
---

포스트 내용...
```

### 2단계: GitHub에 푸시
```bash
git add Blog/Published/
git commit -m "feat: add new blog post"
git push origin main
```

### 3단계: 자동 처리 (GitHub Actions)
1. **보안 검증** ✅
   - Drafts 폴더 미포함 확인
   - 민감 정보(API 키, 환경변수) 누수 확인

2. **자동 번역** 🤖
   - Claude API로 한국어 → 영어 번역
   - `Blog/Published/_en/` 디렉토리에 자동 생성
   - 원본 포스트와 동일한 메타데이터 유지

3. **Dev.to 발행** 📱
   - 한국어/영어 두 버전 모두 발행
   - Dev.to API로 자동 교차 포스팅
   - 포스트 메타데이터에 Dev.to 링크 자동 추가

4. **Jekyll 빌드 및 배포** 🚀
   - 정적 사이트 생성
   - GitHub Pages에 자동 배포
   - OIDC 토큰을 통한 안전한 인증

5. **Frontmatter 업데이트** 🔗
   - Dev.to 발행 완료 후 포스트 메타데이터 자동 업데이트
   - 원본 리포지토리에 자동 커밋

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
