/**
 * MY MILITARY OS
 * Card Component Builders
 * DOM 생성 및 XSS 방지를 위해 createElement와 textContent를 사용하여 안전하게 렌더링합니다.
 */

/**
 * 안전한 DOM 요소 생성 헬퍼
 * @param {string} tag 태그 이름
 * @param {string} classNames 클래스 이름
 * @param {string} textContent 내부 텍스트
 * @returns {HTMLElement}
 */
const createElement = (tag, classNames = '', textContent = '') => {
    const el = document.createElement(tag);
    if (classNames) el.className = classNames;
    if (textContent) el.textContent = textContent;
    return el;
};

export const Card = {
    /**
     * 기본 카드 컨테이너를 렌더링합니다.
     * @param {Object} options { title, content, footer, className }
     * @returns {HTMLElement}
     */
    renderCard(options) {
        const card = createElement('div', `card ${options.className || ''}`.trim());
        
        if (options.title) {
            const header = createElement('div', 'card-header');
            header.style.marginBottom = 'var(--spacing-3)';
            
            const titleEl = createElement('h3', 'card-title', options.title);
            titleEl.style.fontSize = 'var(--font-size-lg)';
            titleEl.style.fontWeight = '600';
            
            header.appendChild(titleEl);
            card.appendChild(header);
        }
        
        const body = createElement('div', 'card-body');
        if (options.content instanceof Node) {
            body.appendChild(options.content);
        } else if (options.content) {
            body.textContent = options.content;
        }
        card.appendChild(body);
        
        if (options.footer instanceof Node) {
            const footer = createElement('div', 'card-footer');
            footer.style.marginTop = 'var(--spacing-4)';
            footer.style.paddingTop = 'var(--spacing-3)';
            footer.style.borderTop = '1px solid var(--color-border)';
            footer.appendChild(options.footer);
            card.appendChild(footer);
        }
        
        return card;
    },

    /**
     * 통계(Stat) 카드를 렌더링합니다.
     * @param {Object} options { label, value, trend, isPositive }
     * @returns {HTMLElement}
     */
    renderStatCard(options) {
        const card = createElement('div', 'card stat-card');
        
        const label = createElement('div', 'stat-card-label', options.label);
        const value = createElement('div', 'stat-card-value', String(options.value));
        
        card.appendChild(label);
        card.appendChild(value);
        
        if (options.trend) {
            const trendClass = options.isPositive === true ? 'positive' : 
                             (options.isPositive === false ? 'negative' : '');
            const trendEl = createElement('div', `stat-card-trend ${trendClass}`.trim());
            
            const trendIcon = createElement('span', '', options.isPositive ? '↑' : (options.isPositive === false ? '↓' : '-'));
            const trendText = createElement('span', '', options.trend);
            
            trendEl.appendChild(trendIcon);
            trendEl.appendChild(trendText);
            card.appendChild(trendEl);
        }
        
        return card;
    },

    /**
     * 프로그레스 카드를 렌더링합니다.
     * @param {Object} options { title, current, total, colorClass }
     * @returns {HTMLElement}
     */
    renderProgressCard(options) {
        const card = createElement('div', 'card');
        const container = createElement('div', 'progress-container');
        
        const header = createElement('div', 'progress-header');
        const title = createElement('span', '', options.title);
        
        // 퍼센트 계산
        const total = Math.max(options.total || 1, 1); // 0 나누기 방지
        const current = Math.max(options.current || 0, 0);
        let percent = Math.round((current / total) * 100);
        if (percent > 100) percent = 100;
        
        const value = createElement('span', '', `${current} / ${total} (${percent}%)`);
        
        header.appendChild(title);
        header.appendChild(value);
        container.appendChild(header);
        
        const track = createElement('div', 'progress-track');
        const fill = createElement('div', 'progress-fill');
        fill.style.width = `${percent}%`;
        
        if (options.colorClass) {
            fill.classList.add(options.colorClass);
        }
        
        track.appendChild(fill);
        container.appendChild(track);
        card.appendChild(container);
        
        return card;
    },

    /**
     * 데이터가 없을 때 표시할 빈 상태(Empty State)를 렌더링합니다.
     * @param {Object} options { icon, title, description, actionText, onAction }
     * @returns {HTMLElement}
     */
    renderEmptyState(options) {
        const container = createElement('div', 'empty-state');
        
        const icon = createElement('div', 'empty-state-icon', options.icon || '📁');
        const title = createElement('h3', 'empty-state-title', options.title || '데이터 없음');
        const desc = createElement('p', 'empty-state-desc', options.description || '표시할 항목이 없습니다.');
        
        container.appendChild(icon);
        container.appendChild(title);
        container.appendChild(desc);
        
        if (options.actionText && typeof options.onAction === 'function') {
            const btn = createElement('button', 'btn btn-primary', options.actionText);
            btn.addEventListener('click', options.onAction);
            container.appendChild(btn);
        }
        
        return container;
    },

    /**
     * 프로젝트 카드를 렌더링합니다.
     * @param {Object} project { title, description, status, dueDate }
     * @returns {HTMLElement}
     */
    renderProjectCard(project) {
        const card = createElement('div', 'card project-card');
        
        const header = createElement('div', 'project-card-header');
        const title = createElement('h4', 'project-card-title', project.title || '제목 없음');
        
        // 상태 뱃지
        const statusBadge = createElement('span', 'badge', project.status || '진행중');
        if (project.status === '완료') statusBadge.classList.add('badge-success');
        else if (project.status === '대기') statusBadge.classList.add('badge-warning');
        else statusBadge.classList.add('badge-info');
        
        header.appendChild(title);
        header.appendChild(statusBadge);
        
        const desc = createElement('p', 'project-card-desc', project.description || '');
        
        const meta = createElement('div', 'project-card-meta');
        if (project.dueDate) {
            meta.appendChild(createElement('span', '', `마감: ${project.dueDate}`));
        }
        
        card.appendChild(header);
        if (project.description) card.appendChild(desc);
        card.appendChild(meta);
        
        return card;
    },

    /**
     * 목표 카드를 렌더링합니다.
     * @param {Object} goal { title, type, current, target, unit }
     * @returns {HTMLElement}
     */
    renderGoalCard(goal) {
        const card = createElement('div', 'card goal-card');
        
        const header = createElement('div', 'project-card-header');
        const title = createElement('h4', 'project-card-title', goal.title || '목표 없음');
        const typeBadge = createElement('span', 'badge badge-info', goal.type || '일반');
        
        header.appendChild(title);
        header.appendChild(typeBadge);
        card.appendChild(header);
        
        // 진행률 바
        const progressContainer = createElement('div', 'progress-container');
        progressContainer.style.marginTop = 'var(--spacing-3)';
        
        const target = Math.max(Number(goal.target) || 1, 1);
        const current = Math.max(Number(goal.current) || 0, 0);
        let percent = Math.round((current / target) * 100);
        if (percent > 100) percent = 100;
        
        const unit = goal.unit ? ` ${goal.unit}` : '';
        const progressHeader = createElement('div', 'progress-header');
        progressHeader.appendChild(createElement('span', '', '진행률'));
        progressHeader.appendChild(createElement('span', '', `${current}${unit} / ${target}${unit} (${percent}%)`));
        
        const track = createElement('div', 'progress-track');
        const fill = createElement('div', 'progress-fill');
        fill.style.width = `${percent}%`;
        if (percent >= 100) fill.style.backgroundColor = 'var(--color-success)';
        
        track.appendChild(fill);
        progressContainer.appendChild(progressHeader);
        progressContainer.appendChild(track);
        
        card.appendChild(progressContainer);
        
        return card;
    }
};