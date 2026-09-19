# MY MILITARY OS

> 군 생활 + 성장 + 프로젝트 + 콘텐츠 + 금융을 하나의 데이터 모델에서 관리하는 Local-first Personal OS

---

## 1. 프로젝트 소개
**MY MILITARY OS**는 제한된 환경과 특수한 일과 속에서도 장병들이 자기계발, 자산 형성, 프로젝트 개발, 콘텐츠 크리에이팅 및 군 복무 일정을 주도적으로 관리할 수 있도록 설계된 **Local-first 개인용 운영체제(Personal OS)**입니다. 외부 서버나 복잡한 백엔드 없이 사용자의 브라우저 LocalStorage 위에서 완벽히 동작하며, GitHub Pages를 통해 언제 어디서나 접속할 수 있습니다.

## 2. 문제 정의
군 복무 기간은 개인의 성장에 있어 소중한 기회이지만, 다음과 같은 단절과 관리의 어려움이 존재합니다:
* **데이터의 분산:** 휴가/훈련 일정, 공부 시간, 금융 자산, 사이드 프로젝트 기록이 각기 다른 앱이나 수첩에 흩어져 있어 파편화됨.
* **보안 및 환경 제약:** 외부 클라우드 서비스나 데이터베이스 서버를 구축하기 어려운 환경적 한계.
* **유지보수의 어려움:** 무거운 프레임워크 기반의 앱은 로딩이 느리고 유지보수가 까다로움.

MY MILITARY OS는 이 모든 데이터를 **단 하나의 Single Source of Truth(단일 진실 공급원)** 기반 데이터베이스로 통합하여 파편화를 해결합니다.

## 3. 핵심 철학
1. **Local-first:** 모든 데이터는 사용자의 기기(LocalStorage)에 저장되며 외부로 유출되지 않습니다.
2. **Single Source of Truth:** 데이터는 오직 한 번만 입력되며, 대시보드, 캘린더, 리포트 등 모든 화면은 동일한 Store를 참조합니다.
3. **모바일 우선 (Mobile-first):** 휴일이나 일과 후 모바일 환경에서 빠르게 입력하고 확인할 수 있는 반응형 UI를 제공합니다.
4. **제로 의존성 (Zero Dependencies):** React, Vue 등 무거운 프레임워크나 외부 서버 없이 순수 Vanilla JavaScript (ES Modules)로만 구현되었습니다.

## 4. Single Source의 원칙과 동작 방식
중복 입력을 철저히 배제합니다. 예를 들어 예산의 실제 지출액은 수동으로 입력하는 것이 아니라, `transactions`(거래) 데이터베이스의 지출 내역을 실시간으로 집계하여 동적으로 계산합니다. 프로젝트 진행률 역시 연결된 `tasks`(작업)의 완료 여부에 따라 자동으로 갱신됩니다.

## 5. 주요 기능
* **통합 대시보드 (MAIN):** 복무 D-Day, 자산 현황, 오늘 일정, 공부 시간, 지출, 프로젝트 상태를 한눈에 파악.
* **군 복무 및 일정 관리 (Military & Schedule):** 휴가 출발/복귀, 당직, 훈련, 외박 등 군 특화 일정 관리 및 캘린더 뷰.
* **성장 및 학습 (Growth & Study):** 목표(Goals) 설정, 공부 시간(Minutes) 기록, 오답/요약 노트 관리.
* **프로젝트 및 이슈 (Projects & Issues):** 개발 프로젝트 생명주기 관리 및 버그/개선 이슈 추적.
* **콘텐츠 제작 (Content):** 유튜브, 인스타그램, 블로그 등 플랫폼별 기획 및 성과 지표(조회수, 좋아요 등) 관리.
* **금융 및 예산 (Finance & Assets):** 계좌, 주식, 대출 등 자산/부채 관리와 1억원 모기 목표 진행률 계산, 예산 대비 지출 추적.
* **월간 리포트 (Reports):** 매월의 활동과 재정을 종합한 순수 집계 리포트 생성.

## 6. 정보 구조 (Information Architecture)
* `# /` : 대시보드 (MAIN)
* `# /military` : 군 복무 및 캘린더 일정
* `# /growth` : 성장, 학습 및 목표 관리
* `# /projects` : 프로젝트 및 이슈 트래킹
* `# /content` : 콘텐츠 제작 및 성과
* `# /finance` : 자산, 예산 및 거래 내역
* `# /settings` : 시스템 설정, 데이터 백업 및 복원

## 7. 데이터 구조 (Collections)
Store는 다음의 컬렉션들로 구성됩니다:
* `schedules` : 일정 데이터
* `rewards` : 보상(상점, 종교, 포상, 전투휴무) 데이터
* `goals` : 목표 데이터
* `studies` : 학습 기록 데이터
* `projects` : 프로젝트 데이터
* `tasks` : 작업(Inbox, 예정, 진행중 등) 데이터
* `issues` : 이슈/버그 데이터
* `contents` : 콘텐츠 데이터
* `transactions` : 금융 거래 데이터
* `assets` : 자산 및 부채 데이터
* `budgets` : 예산 데이터

## 8. 기술 스택
* **Language:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
* **Storage:** Browser LocalStorage, JSON Export/Import
* **Hosting:** GitHub Pages (Hash Router 기반)
* **Design:** Custom CSS Variables (Dark Mode 지원, Responsive Layout)

## 9. 프로젝트 폴더 구조
```text
my-military-os/
│
├── index.html
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   │
│   ├── core/
│   │   ├── database.js
│   │   ├── storage.js
│   │   ├── router.js
│   │   ├── settings.js
│   │   └── relations.js
│   │
│   ├── modules/
│   │   ├── schedule.js
│   │   ├── rewards.js
│   │   ├── goals.js
│   │   ├── study.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── issues.js
│   │   ├── content.js
│   │   ├── finance.js
│   │   ├── assets.js
│   │   ├── budget.js
│   │   └── reports.js
│   │
│   └── components/
│       - modal.js
│       - toast.js
│       - card.js
│       - table.js
│       - calendar.js
│       - quick-add.js
│
├── README.md
├── .nojekyll
└── .github/
    └── workflows/
        └── pages.yml

```

## 10. LocalStorage 구조

모든 데이터는 LocalStorage 키 `MY_MILITARY_OS_DB` 하위에 JSON 문자열 형태로 안전하게 직렬화되어 저장되며, 앱 구동 시 메모리 상의 단일 Store로 로드됩니다.

## 11. Relation 구조 (`relations.js`)

엔티티 간의 느슨한 결합(Loose Coupling)과 다대다/일대다 관계를 지원합니다. 특정 항목이 삭제될 경우 `Relations.cleanupRelations()` 함수를 통해 참조 중인 다른 컬렉션의 외래키(Foreign Key)를 자동으로 정리하여 데이터 무결성을 유지합니다.

## 12. 백업 및 복구

* **Export (백업):** 설정 화면 또는 스토리지 코드를 통해 전체 데이터베이스를 `.json` 파일로 즉시 다운로드할 수 있습니다.
* **Import (복구):** 백업해둔 JSON 파일을 업로드하여 기존 데이터를 완벽하게 복원할 수 있습니다.

## 13. GitHub Pages 배포

* 별도의 빌드 과정(Build Step) 없이 정적 파일 그대로 GitHub Pages에 배포할 수 있습니다.
* Hash Router(`window.location.hash`)를 사용하여 GitHub Pages의 repository subpath 환경에서도 404 오류 없이 완벽하게 동작합니다.
* 루트 디렉터리에 포함된 `.nojekyll` 파일이 Jekyll 빌드 처리를 우회하여 정적 파일을 그대로 서빙합니다.

## 14. 모바일 사용

* 모바일 최우선(Mobile-first) 철학에 따라 하단 내비게이션 바(Bottom Navigation)와 어디서나 접근 가능한 FAB(Floating Action Button) 기반의 `Quick Add` 시스템을 제공합니다.
* 터치 환경에 최적화된 컴포넌트와 유연한 CSS Grid 레이아웃을 통해 모바일 브라우저에서도 데스크톱과 동일한 속도와 경험을 제공합니다.

## 15. 향후 개발 계획

* 오프라인 PWA(Progressive Web App) 캐싱 지원 강화
* 커스텀 대시보드 위젯 드래그 앤 드롭 커스터마이징
* 장병 상호 간 익명 데이터 통계 비교 기능 (로컬 파일 기반 공유)