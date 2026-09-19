import { Database } from './core/database.js';
import { Storage } from './core/storage.js';
import { Router } from './core/router.js';
import { Settings } from './core/settings.js';
import { Relations } from './core/relations.js';

import { Modal } from './components/modal.js';
import { Toast } from './components/toast.js';
import { Card } from './components/card.js';
import { Table } from './components/table.js';
import { Calendar } from './components/calendar.js';
import { QuickAdd } from './components/quick-add.js';

import { ScheduleModule } from './modules/schedule.js';
import { Rewards } from './modules/rewards.js';
import { Goals } from './modules/goals.js';
import { Study } from './modules/study.js';
import { Projects } from './modules/projects.js';
import { Tasks } from './modules/tasks.js';
import { Issues } from './modules/issues.js';
import { Content } from './modules/content.js';
import { Finance } from './modules/finance.js';
import { Assets } from './modules/assets.js';
import { Budget } from './modules/budget.js';
import { Reports } from './modules/reports.js';

/**
 * MY MILITARY OS
 * Main Application Entry Point
 */

/**
 * 안전한 DOM 요소 생성 헬퍼
 */
const createElement = (tag, classNames = '', textContent = '') => {
    const el = document.createElement(tag);
    if (classNames) el.className = classNames;
    if (textContent) el.textContent = textContent;
    return el;
};

/**
 * 전역 네비게이션
 * Desktop: 그룹형 사이드바
 * Mobile: 하단 스크롤 탭
 */
const NAV_ITEMS = [
    { route: '#/', label: 'MAIN', icon: '⌂', section: '핵심' },
    { route: '#/military', label: '군생활', icon: '🪖', section: '핵심' },
    { route: '#/growth', label: '성장', icon: '🌱', section: '성장' },
    { route: '#/projects', label: '프로젝트', icon: '🚀', section: '성장' },
    { route: '#/content', label: '콘텐츠', icon: '📱', section: '성장' },
    { route: '#/finance', label: '자산관리', icon: '₩', section: '자산' },
    { route: '#/settings', label: '설정', icon: '⚙', section: '시스템' }
];

const createNavLink = (item) => {
    const link = createElement('a', 'nav-link');

    link.href = item.route;
    link.dataset.route = item.route;
    link.setAttribute('aria-label', item.label);

    const icon = createElement(
        'span',
        'nav-link-icon',
        item.icon
    );

    icon.setAttribute('aria-hidden', 'true');

    const label = createElement(
        'span',
        'nav-link-label',
        item.label
    );

    link.appendChild(icon);
    link.appendChild(label);

    return link;
};

const renderNavigation = () => {
    const sidebar = document.getElementById('sidebar-nav');
    const bottom = document.getElementById('bottom-nav');

    if (sidebar) {
        sidebar.innerHTML = '';

        const groups = [];

        NAV_ITEMS.forEach(item => {
            const last = groups[groups.length - 1];

            if (!last || last.section !== item.section) {
                groups.push({
                    section: item.section,
                    items: [item]
                });
            } else {
                last.items.push(item);
            }
        });

        groups.forEach(group => {
            const section = createElement(
                'div',
                'nav-section'
            );

            section.appendChild(
                createElement(
                    'div',
                    'nav-section-title',
                    group.section
                )
            );

            group.items.forEach(item => {
                section.appendChild(
                    createNavLink(item)
                );
            });

            sidebar.appendChild(section);
        });
    }

    if (bottom) {
        bottom.innerHTML = '';

        NAV_ITEMS.forEach(item => {
            bottom.appendChild(
                createNavLink(item)
            );
        });
    }
};

const updateNavigationState = (route) => {
    const current = route || Router.getCurrentRoute();

    document.querySelectorAll('[data-route]').forEach(link => {
        const active =
            link.getAttribute('data-route') === current;

        link.classList.toggle('active', active);

        if (active) {
            link.setAttribute(
                'aria-current',
                'page'
            );
        } else {
            link.removeAttribute(
                'aria-current'
            );
        }
    });

    const headerTitle =
        document.getElementById('header-title');

    if (headerTitle) {
        const currentItem = NAV_ITEMS.find(
            item => item.route === current
        );

        headerTitle.textContent =
            currentItem
                ? currentItem.label
                : 'MY MILITARY OS';
    }
};

/**
 * 메인 대시보드 뷰 렌더링
 */
const renderDashboardView = () => {
    const container = createElement('div', 'dashboard-container');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = 'var(--spacing-6)';

    // 헤더 섹션
    const header = createElement('div', 'section-header');
    const title = createElement('h2', 'section-title', '통합 대시보드 (MAIN)');
    header.appendChild(title);
    container.appendChild(header);

    // 1. 군 복무 및 자산 요약 스탯 카드 그리드
    const statsGrid = createElement('div', 'stats-grid');
    statsGrid.style.display = 'grid';
    statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    statsGrid.style.gap = 'var(--spacing-4)';

    // 복무 D-Day 계산 (Settings에서 입대일/전역일 연동 가정 또는 기본값)
    const enlistmentDateStr =
    Settings.getDateSetting('enlistmentDate');
    const dischargeDateStr =
        Settings.getDateSetting('dischargeDate');
    const serviceCard = createElement(
        'div',
        'service-progress-card'
    );
    if (!enlistmentDateStr || !dischargeDateStr) {
        serviceCard.appendChild(
            Card.renderStatCard({
                label: '복무 정보',
                value: '설정 필요',
                trend: '설정에서 입대일과 전역예정일을 입력하세요.',
                isPositive: false
            })
        );
    } else {
        const now = new Date();
        const enlistment = new Date(
            `${enlistmentDateStr}T00:00:00`
        );
        const discharge = new Date(
            `${dischargeDateStr}T00:00:00`
        );
        const totalDays = Math.max(
            1,
            Math.ceil(
                (discharge - enlistment) /
                (1000 * 60 * 60 * 24)
            )
        );
        const passedDays = Math.max(
            0,
            Math.floor(
                (now - enlistment) /
                (1000 * 60 * 60 * 24)
            )
        );
        const remainingDays = Math.max(
            0,
            Math.ceil(
                (discharge - now) /
                (1000 * 60 * 60 * 24)
            )
        );
        const progress = Math.min(
            100,
            Math.max(
                0,
                Math.round(
                    (passedDays / totalDays) * 100
                )
            )
        );
        serviceCard.appendChild(
            Card.renderStatCard({
                label: '복무 진행률',
                value: `D+${passedDays}`,
                trend: `D-${remainingDays} · ${progress}%`,
                isPositive: true
            })
        );
    }

    statsGrid.appendChild(serviceCard);

    // 군 보상 자산 요약
    const militaryAssets = Rewards.calculateMilitaryAssets();
    statsGrid.appendChild(Card.renderStatCard({
        label: '보상 휴가 자산',
        value: `${militaryAssets.totalAvailableDays}일`,
        trend: `포상 ${militaryAssets.award.days}일 / 전투휴무 ${militaryAssets.combatRest.totalDays}일`,
        isPositive: true
    }));

    // 오늘 공부 시간
    const todayStudyMin = Study.getTodayStudyMinutes();
    statsGrid.appendChild(Card.renderStatCard({
        label: '오늘 공부 시간',
        value: `${Math.floor(todayStudyMin / 60)}시간 ${todayStudyMin % 60}분`,
        trend: `이번 달 누적: ${(Study.getMonthlyStudyMinutes() / 60).toFixed(1)}시간`,
        isPositive: true
    }));

    // 순자산
    const netWorth = Assets.calculateNetWorth();
    statsGrid.appendChild(Card.renderStatCard({
        label: '현재 순자산',
        value: `${netWorth.toLocaleString()}원`,
        trend: `1억 모기 목표: ${Assets.calculateOneHundredMillionProgress()}%`,
        isPositive: netWorth >= 0
    }));

    container.appendChild(statsGrid);

    // 2. 투컬럼 상세 영역 (오늘 일정, 프로젝트, 작업 등)
    const twoCol = createElement('div', 'two-column-grid');
    twoCol.style.display = 'grid';
    twoCol.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    twoCol.style.gap = 'var(--spacing-6)';

    // Left Column: 오늘 일정 및 오늘 작업
    const leftCol = createElement('div');
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.gap = 'var(--spacing-4)';

    // 오늘 일정 카드
    const todaySchedules = ScheduleModule.getTodaySchedules();
    const scheduleContent = createElement('div');
    if (todaySchedules.length === 0) {
        scheduleContent.appendChild(Card.renderEmptyState({
            icon: '📅',
            title: '오늘 예정된 일정이 없습니다',
            description: '빠른 추가 버튼을 통해 일정을 등록해보세요.',
            actionText: '+ 일정 추가',
            onAction: () => QuickAdd.openScheduleModal()
        }));
    } else {
        const list = createElement('ul', 'list-group');
        list.style.listStyle = 'none';
        list.style.padding = '0';
        todaySchedules.forEach(s => {
            const li = createElement('li', 'list-item', `[${s.type}] ${s.title}`);
            li.style.padding = 'var(--spacing-2) 0';
            li.style.borderBottom = '1px solid var(--color-border)';
            list.appendChild(li);
        });
        scheduleContent.appendChild(list);
    }
    leftCol.appendChild(Card.renderCard({ title: '오늘의 일정', content: scheduleContent }));

    // 오늘 작업 카드
    const todayTasks = Tasks.getTodayTasks();
    const taskContent = createElement('div');
    if (todayTasks.length === 0) {
        taskContent.appendChild(Card.renderEmptyState({
            icon: '✓',
            title: '오늘의 마감 작업이 없습니다',
            description: '새로운 작업을 등록하고 생산성을 높이세요.',
            actionText: '+ 작업 추가',
            onAction: () => QuickAdd.openTaskModal()
        }));
    } else {
        const taskTable = Table.renderTable({
            columns: [
                { key: 'title', label: '작업명' },
                { key: 'priority', label: '우선순위' },
                { key: 'status', label: '상태' }
            ],
            data: todayTasks
        });
        taskContent.appendChild(taskTable);
    }
    leftCol.appendChild(Card.renderCard({ title: '오늘의 작업', content: taskContent }));

    twoCol.appendChild(leftCol);

    // Right Column: 진행 중인 프로젝트 및 최근 콘텐츠
    const rightCol = createElement('div');
    rightCol.style.display = 'flex';
    rightCol.style.flexDirection = 'column';
    rightCol.style.gap = 'var(--spacing-4)';

    // 진행 중인 프로젝트
    const activeProjects = Projects.getActiveProjects();
    const projectContent = createElement('div');
    if (activeProjects.length === 0) {
        projectContent.appendChild(Card.renderEmptyState({
            icon: '🚀',
            title: '진행 중인 프로젝트가 없습니다',
            description: '새로운 프로젝트를 시작해보세요.'
        }));
    } else {
        const projList = createElement('div');
        projList.style.display = 'flex';
        projList.style.flexDirection = 'column';
        projList.style.gap = 'var(--spacing-3)';
        activeProjects.slice(0, 3).forEach(p => {
            projList.appendChild(Card.renderProjectCard(p));
        });
        projectContent.appendChild(projList);
    }
    rightCol.appendChild(Card.renderCard({ title: '진행 중 프로젝트', content: projectContent }));

    // 최근 콘텐츠
    const recentContents = Content.getRecentContents(3);
    const contentBody = createElement('div');
    if (recentContents.length === 0) {
        contentBody.appendChild(Card.renderEmptyState({
            icon: '📺',
            title: '등록된 콘텐츠가 없습니다',
            description: '기획 중인 콘텐츠를 추가해보세요.'
        }));
    } else {
        const contentTable = Table.renderTable({
            columns: [
                { key: 'name', label: '콘텐츠명' },
                { key: 'platform', label: '플랫폼' },
                { key: 'status', label: '상태' }
            ],
            data: recentContents
        });
        contentBody.appendChild(contentTable);
    }
    rightCol.appendChild(Card.renderCard({ title: '최근 콘텐츠 성과', content: contentBody }));

    twoCol.appendChild(rightCol);
    container.appendChild(twoCol);

    return container;
};

/**
 * 각 라우트별 뷰 렌더러 등록
 */
const initRoutes = () => {
    const appRoot = document.getElementById('main-content');

    const setView = (element) => {
        if (!appRoot) return;
        appRoot.innerHTML = '';
        appRoot.appendChild(element);
    };

    // 대시보드 (/)
    Router.registerRoute('#/', () => {
        setView(renderDashboardView());
    });

    // 군 복무 / 일정 (/military)
    Router.registerRoute('#/military', () => {
        const container = createElement('div');
        container.appendChild(createElement('h2', 'section-title', '군 복무 및 일정 관리'));
        
        // 캘린더 컴포넌트 마운트
        const calendarInstance = Calendar.create({
            schedules: ScheduleModule.getSchedules(),
            onDateClick: (dateStr) => {
                Toast.showToast(`${dateStr} 날짜 선택됨`, 'info');
            },
            onEventClick: (evt) => {
                Modal.confirmModal({
                    title: '일정 확인',
                    message: `[${evt.type}] ${evt.title} (${evt.startDate})`,
                    confirmText: '확인',
                    cancelText: '닫기'
                });
            }
        });
        container.appendChild(calendarInstance.element);
        setView(container);
    });

    // 성장 / 학습 / 목표 (/growth)
    Router.registerRoute('#/growth', () => {
        const container = createElement('div');
        container.appendChild(createElement('h2', 'section-title', '성장 및 목표 관리'));
        
        const activeGoals = Goals.getActiveGoals();
        if (activeGoals.length === 0) {
            container.appendChild(Card.renderEmptyState({
                icon: '🎯',
                title: '등록된 목표가 없습니다',
                description: '새로운 목표를 설정하여 성장을 기록하세요.'
            }));
        } else {
            const grid = createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            grid.style.gap = 'var(--spacing-4)';
            activeGoals.forEach(g => {
                grid.appendChild(Card.renderGoalCard(g));
            });
            container.appendChild(grid);
        }
        setView(container);
    });

    // 프로젝트 (/projects)
    Router.registerRoute('#/projects', () => {
        const container = createElement('div');
        container.appendChild(createElement('h2', 'section-title', '프로젝트 관리'));
        
        const projects = Projects.getProjects();
        const table = Table.renderTable({
            columns: [
                { key: 'name', label: '프로젝트명', sortable: true },
                { key: 'status', label: '상태' },
                { key: 'progress', label: '진행률(%)', render: (val) => `${val}%` },
                { key: 'priority', label: '우선순위' }
            ],
            data: projects,
            onRowClick: (row) => {
                Toast.showToast(`선택된 프로젝트: ${row.name}`, 'info');
            }
        });
        container.appendChild(table);
        setView(container);
    });

    // 콘텐츠 (/content)
    Router.registerRoute('#/content', () => {
        const container = createElement('div');
        container.appendChild(createElement('h2', 'section-title', '콘텐츠 제작 관리'));
        
        const contents = Content.getContents();
        const table = Table.renderTable({
            columns: [
                { key: 'name', label: '콘텐츠명' },
                { key: 'platform', label: '플랫폼' },
                { key: 'status', label: '상태' },
                { key: 'views', label: '조회수' }
            ],
            data: contents
        });
        container.appendChild(table);
        setView(container);
    });

    // 자산 / 금융 (/finance)
    Router.registerRoute('#/finance', () => {
        const container = createElement('div', '', '');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = 'var(--spacing-6)';

        container.appendChild(createElement('h2', 'section-title', '자산 및 재정 관리'));

        const statsGrid = createElement('div', 'stats-grid');
        statsGrid.style.display = 'grid';
        statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
        statsGrid.style.gap = 'var(--spacing-4)';

        statsGrid.appendChild(Card.renderStatCard({ label: '총 자산', value: `${Assets.calculateTotalAssets().toLocaleString()}원`, isPositive: true }));
        statsGrid.appendChild(Card.renderStatCard({ label: '총 부채', value: `${Assets.calculateTotalLiabilities().toLocaleString()}원`, isPositive: false }));
        statsGrid.appendChild(Card.renderStatCard({ label: '순자산', value: `${Assets.calculateNetWorth().toLocaleString()}원`, isPositive: true }));
        statsGrid.appendChild(Card.renderStatCard({ label: '이번 달 지출', value: `${Finance.calculateMonthlyExpense().toLocaleString()}원`, isPositive: false }));

        container.appendChild(statsGrid);

        const transactions = Finance.getTransactions();
        const txTable = Table.renderTable({
            columns: [
                { key: 'date', label: '날짜' },
                { key: 'title', label: '거래명' },
                { key: 'type', label: '유형' },
                { key: 'amount', label: '금액', render: (val) => `${Number(val).toLocaleString()}원` }
            ],
            data: transactions
        });
        container.appendChild(Card.renderCard({ title: '최근 거래 내역', content: txTable }));

        setView(container);
    });

    // 설정 (/settings)
    Router.registerRoute('#/settings', () => {
        const container = createElement(
            'div',
            'settings-page'
        );

        const header =
            createElement(
                'div',
                'page-header'
            );

        const headingWrap =
            createElement('div');

        headingWrap.appendChild(
            createElement(
                'h2',
                'section-title',
                '설정'
            )
        );

        headingWrap.appendChild(
            createElement(
                'p',
                'page-description',
                '복무 기준과 앱 동작에 필요한 값을 한 곳에서 관리합니다.'
            )
        );

        header.appendChild(headingWrap);
        container.appendChild(header);

        const buildField = (
            label,
            key,
            type = 'text',
            options = {}
        ) => {
            const group =
                createElement(
                    'div',
                    'form-group settings-field'
                );

            const labelEl =
                createElement(
                    'label',
                    'form-label',
                    label
                );

            const input =
                type === 'select'
                    ? createElement(
                        'select',
                        'select'
                    )
                    : createElement(
                        'input',
                        'input'
                    );

            input.name = key;
            input.dataset.settingKey = key;

            if (type === 'select') {
                (options.choices || []).forEach(choice => {
                    const option =
                        createElement(
                            'option',
                            '',
                            choice
                        );

                    option.value = choice;
                    input.appendChild(option);
                });
            } else {
                input.type = type;

                if (options.min !== undefined) {
                    input.min =
                        String(options.min);
                }

                if (options.step !== undefined) {
                    input.step =
                        String(options.step);
                }
            }

            const value =
                Settings.getSetting(key);

            if (
                value !== undefined &&
                value !== null
            ) {
                input.value = String(value);
            }

            group.appendChild(labelEl);
            group.appendChild(input);

            if (options.help) {
                group.appendChild(
                    createElement(
                        'div',
                        'field-help',
                        options.help
                    )
                );
            }

            return group;
        };

        const serviceGrid =
            createElement(
                'div',
                'settings-grid'
            );

        serviceGrid.appendChild(
            buildField(
                '입대일',
                'enlistmentDate',
                'date',
                {
                    help:
                        '복무 D+ 및 진행률 계산에 사용합니다.'
                }
            )
        );

        serviceGrid.appendChild(
            buildField(
                '전역예정일',
                'dischargeDate',
                'date',
                {
                    help:
                        '복무 D- 및 진행률 계산에 사용합니다.'
                }
            )
        );

        serviceGrid.appendChild(
            buildField(
                '현재 계급',
                'currentRank',
                'select',
                {
                    choices: [
                        '이병',
                        '일병',
                        '상병',
                        '병장'
                    ]
                }
            )
        );

        const rewardGrid =
            createElement(
                'div',
                'settings-grid'
            );

        rewardGrid.appendChild(
            buildField(
                '상점 → 휴가 교환 기준',
                'meritExchangeRate',
                'number',
                {
                    min: 1,
                    step: 1,
                    help:
                        '예: 50점 = 휴가 1일'
                }
            )
        );

        rewardGrid.appendChild(
            buildField(
                '종교 → 휴가 교환 기준',
                'religionExchangeRate',
                'number',
                {
                    min: 1,
                    step: 1,
                    help:
                        '예: 20회 = 종교휴가 1일'
                }
            )
        );

        rewardGrid.appendChild(
            buildField(
                '포상휴가 최대',
                'maxRewardVacation',
                'number',
                {
                    min: 0,
                    step: 1,
                    help:
                        '포상휴가 보유 상한입니다.'
                }
            )
        );

        rewardGrid.appendChild(
            buildField(
                '시간외 → 전투휴무 기준',
                'overtimeToRestRate',
                'number',
                {
                    min: 1,
                    step: 1,
                    help:
                        '부대 기준에 맞게 입력합니다.'
                }
            )
        );

        rewardGrid.appendChild(
            buildField(
                '훈련 → 전투휴무 기준',
                'trainingToRestRate',
                'number',
                {
                    min: 1,
                    step: 1,
                    help:
                        '부대 기준에 맞게 입력합니다.'
                }
            )
        );

        const saveButton =
            createElement(
                'button',
                'btn btn-primary',
                '설정 저장'
            );

        saveButton.addEventListener(
            'click',
            () => {
                const values =
                    [
                        ...container.querySelectorAll(
                            '[data-setting-key]'
                        )
                    ].map(input => ({
                        key:
                            input.dataset.settingKey,
                        type:
                            input.type,
                        value:
                            input.value
                    }));

                let saved = 0;

                values.forEach(item => {
                    let value = item.value;

                    if (item.type === 'number') {
                        const parsed =
                            Number(item.value);

                        if (
                            !Number.isFinite(parsed) ||
                            parsed < 0
                        ) {
                            return;
                        }

                        value = parsed;
                    }

                    Settings.setSetting(
                        item.key,
                        value
                    );

                    saved += 1;
                });

                Toast.showToast(
                    `설정 ${saved}개가 저장되었습니다.`,
                    'success'
                );
            }
        );

        const saveArea =
            createElement(
                'div',
                'settings-actions'
            );

        saveArea.appendChild(saveButton);

        saveArea.appendChild(
            createElement(
                'span',
                'field-help',
                '입력값은 브라우저 LocalStorage에 저장됩니다.'
            )
        );

        container.appendChild(
            Card.renderCard({
                title: '복무 정보',
                content: serviceGrid
            })
        );

        container.appendChild(
            Card.renderCard({
                title: '보상 및 전투휴무 기준',
                content: rewardGrid
            })
        );

        container.appendChild(
            Card.renderCard({
                title: '설정 저장',
                content: saveArea
            })
        );

        const backupCardContent =
            createElement('div');

        backupCardContent.appendChild(
            createElement(
                'p',
                '',
                '원본 데이터를 JSON으로 백업하거나 복원할 수 있습니다.'
            )
        );

        const btnGroup =
            createElement(
                'div',
                'settings-actions'
            );

        const exportBtn =
            createElement(
                'button',
                'btn btn-outline',
                '데이터 백업'
            );

        exportBtn.addEventListener(
            'click',
            () => {
                Storage.exportToJson();

                Toast.showToast(
                    '데이터 백업 파일이 다운로드되었습니다.',
                    'success'
                );
            }
        );

        const importInput =
            createElement('input');

        importInput.type = 'file';
        importInput.accept =
            '.json,application/json';
        importInput.style.display =
            'none';

        const importBtn =
            createElement(
                'button',
                'btn btn-outline',
                '데이터 복원'
            );

        importBtn.addEventListener(
            'click',
            () => importInput.click()
        );

        importInput.addEventListener(
            'change',
            async event => {
                const file =
                    event.target.files?.[0];

                if (!file) {
                    return;
                }

                try {
                    await Storage.importFromJson(
                        file
                    );

                    Toast.showToast(
                        '데이터가 복원되었습니다.',
                        'success'
                    );

                    setTimeout(
                        () => window.location.reload(),
                        400
                    );
                } catch (error) {
                    console.error(
                        '[Settings] Import failed:',
                        error
                    );

                    Toast.showToast(
                        '데이터 복원에 실패했습니다. JSON 형식을 확인하세요.',
                        'error'
                    );
                } finally {
                    importInput.value = '';
                }
            }
        );

        btnGroup.appendChild(exportBtn);
        btnGroup.appendChild(importBtn);
        btnGroup.appendChild(importInput);

        backupCardContent.appendChild(
            btnGroup
        );

        container.appendChild(
            Card.renderCard({
                title: '데이터 백업 및 복원',
                content: backupCardContent
            })
        );

        setView(container);
    });

/**
 * 네비게이션 및 UI 이벤트 바인딩
 */
const initEventListeners = () => {
    // 네비게이션은 이벤트 위임으로 처리합니다.
    document.addEventListener(
        'click',
        event => {
            const link =
                event.target.closest('[data-route]');

            if (!link) {
                return;
            }

            event.preventDefault();

            const route =
                link.getAttribute('data-route');

            if (route) {
                Router.navigate(route);
            }
        }
    );

    // 라우트 변경 시 메뉴와 모바일 헤더를 동기화합니다.
    Router.onRouteChange(
        updateNavigationState
    );

    // Quick Add 시스템 초기화
    QuickAdd.init();

    // Database 변경 시 현재 화면을 다시 렌더링합니다.
    Database.subscribe(() => {
        const handler =
            Router.getHandler();

        if (typeof handler === 'function') {
            handler();
        }
    });
};

/**
 * 앱 전역 초기화 실행
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. LocalStorage 데이터 로드 및 Store 초기화
        Storage.init();
        // 2. 네비게이션 및 뷰 등록
        renderNavigation();
        initRoutes();
        // 3. 이벤트 리스너(네비게이션, 퀵애드 등) 연결
        initEventListeners();
        // 4. 라우터 시작 (GitHub Pages Hash Routing)
        Router.init();
        console.info(
            '[MY MILITARY OS] Successfully initialized.'
        );
    } catch (err) {
        console.error(
            '[MY MILITARY OS Initialization Error]',
            err
        );
        Toast.showToast(
            '애플리케이션 초기화 중 오류가 발생했습니다.',
            'error'
        );
    }
});