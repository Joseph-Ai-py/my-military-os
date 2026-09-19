/**
 * MY MILITARY OS
 * Calendar Component
 * 일정 데이터(schedules)를 주입받아 렌더링하는 View 역할을 수행합니다.
 * XSS 방지를 위해 createElement를 사용하여 안전하게 DOM을 구성합니다.
 */

/**
 * 안전한 DOM 요소 생성 헬퍼
 * @param {string} tag 
 * @param {string} classNames 
 * @param {string} textContent 
 * @returns {HTMLElement}
 */
const createElement = (tag, classNames = '', textContent = '') => {
    const el = document.createElement(tag);
    if (classNames) el.className = classNames;
    if (textContent) el.textContent = textContent;
    return el;
};

export const Calendar = {
    /**
     * 캘린더 인스턴스를 생성합니다.
     * @param {Object} options { initialDate, schedules, onDateClick, onEventClick, onMonthChange }
     * @returns {Object} { element, updateSchedules, getDate }
     */
    create(options = {}) {
        let currentDate = options.initialDate ? new Date(options.initialDate) : new Date();
        let schedules = options.schedules || [];
        const onDateClick = options.onDateClick || function() {};
        const onEventClick = options.onEventClick || function() {};
        const onMonthChange = options.onMonthChange || function() {};

        const container = createElement('div', 'calendar-wrapper');
        
        // 1. Header (네비게이션)
        const header = createElement('div', 'section-header');
        const title = createElement('div', 'section-title');
        
        const controls = createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = 'var(--spacing-2)';

        const prevBtn = createElement('button', 'btn btn-outline', '<');
        const todayBtn = createElement('button', 'btn btn-outline', '오늘');
        const nextBtn = createElement('button', 'btn btn-outline', '>');

        controls.appendChild(prevBtn);
        controls.appendChild(todayBtn);
        controls.appendChild(nextBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        container.appendChild(header);

        // 2. Grid Container
        const grid = createElement('div', 'calendar-grid');
        container.appendChild(grid);

        // 날짜 포맷 헬퍼 (YYYY-MM-DD)
        const formatDate = (y, m, d) => {
            return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        };

        // 3. Grid 렌더링 함수
        const renderGrid = () => {
            // 초기화
            while (grid.firstChild) {
                grid.removeChild(grid.firstChild);
            }

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            title.textContent = `${year}년 ${month + 1}월`;

            // 요일 헤더 렌더링
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            weekdays.forEach(day => {
                const th = createElement('div', 'calendar-header-cell', day);
                if (day === '일') th.style.color = 'var(--color-danger)';
                if (day === '토') th.style.color = 'var(--color-info)';
                grid.appendChild(th);
            });

            const firstDayIndex = new Date(year, month, 1).getDay();
            const lastDay = new Date(year, month + 1, 0).getDate();
            const prevLastDay = new Date(year, month, 0).getDate();

            const today = new Date();
            const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

            let dayCount = 1;
            let nextMonthDayCount = 1;

            // 6주(42일) 렌더링
            for (let i = 0; i < 42; i++) {
                const cell = createElement('div', 'calendar-cell');
                const dateEl = createElement('span', 'calendar-cell-date');
                
                let cellDateStr = '';

                if (i < firstDayIndex) {
                    // 이전 달 날짜
                    const d = prevLastDay - firstDayIndex + i + 1;
                    cellDateStr = formatDate(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, d);
                    dateEl.textContent = String(d);
                    dateEl.style.color = 'var(--color-text-muted)';
                    dateEl.style.opacity = '0.5';
                } else if (dayCount <= lastDay) {
                    // 현재 달 날짜
                    cellDateStr = formatDate(year, month, dayCount);
                    dateEl.textContent = String(dayCount);
                    
                    if (cellDateStr === todayStr) {
                        cell.classList.add('today');
                    }
                    
                    // 주말 색상 강조
                    if (i % 7 === 0) dateEl.style.color = 'var(--color-danger)';
                    if (i % 7 === 6) dateEl.style.color = 'var(--color-info)';
                    
                    dayCount++;
                } else {
                    // 다음 달 날짜
                    cellDateStr = formatDate(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, nextMonthDayCount);
                    dateEl.textContent = String(nextMonthDayCount);
                    dateEl.style.color = 'var(--color-text-muted)';
                    dateEl.style.opacity = '0.5';
                    nextMonthDayCount++;
                }

                cell.appendChild(dateEl);

                // 해당 날짜의 일정 렌더링
                const dayEvents = schedules.filter((schedule) => {
                    const startDate =
                        schedule.startDate ||
                        schedule.date ||
                        '';

                    const endDate =
                        schedule.endDate ||
                        startDate;

                    if (!startDate) {
                        return false;
                    }

                    return (
                        cellDateStr >= startDate &&
                        cellDateStr <= endDate
                    );
                });
                dayEvents.forEach(evt => {
                    const evtEl = createElement('div', 'calendar-event');
                    
                    let prefix = '';
                    let color = '';
                    
                    switch (evt.type) {
                        case '휴가 출발':
                        case '휴가출발':
                            prefix = '-';
                            break;

                        case '휴가 복귀':
                        case '휴가복귀':
                            prefix = '-';
                            color = 'var(--color-info)';
                            break;

                        case '당직':
                            prefix = 'O';
                            break;

                        case '외박':
                            prefix = '♥';
                            color = 'var(--color-danger)';
                            break;

                        case '외출':
                            prefix = '🚶';
                            break;

                        case '외진':
                            prefix = '🏥';
                            break;

                        case '훈련': {
                            const trainingSize =
                                evt.trainingSize ||
                                evt.scale ||
                                '';

                            let scaleTxt = '';

                            if (
                                trainingSize === '큰 훈련' ||
                                trainingSize === '큰훈련'
                            ) {
                                scaleTxt = '(대)';
                            }

                            if (
                                trainingSize === '작은 훈련' ||
                                trainingSize === '작은훈련'
                            ) {
                                scaleTxt = '(소)';
                            }

                            prefix = `🏋️${scaleTxt}`;
                            break;
                        }

                        default:
                            prefix = '•';
                    }

                    evtEl.textContent = `${prefix} ${evt.title || evt.type}`;
                    
                    if (color) {
                        evtEl.style.color = color;
                        evtEl.style.fontWeight = 'bold';
                    }

                    // 이벤트 클릭 (버블링 방지하여 셀 클릭과 분리)
                    evtEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        onEventClick(evt);
                    });

                    cell.appendChild(evtEl);
                });

                // 셀 전체 클릭 시 해당 날짜 전달
                cell.addEventListener('click', () => onDateClick(cellDateStr));
                
                grid.appendChild(cell);
            }
        };

        // 4. 이벤트 리스너 등록
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderGrid();
            onMonthChange(currentDate);
        });

        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderGrid();
            onMonthChange(currentDate);
        });

        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            renderGrid();
            onMonthChange(currentDate);
        });

        // 최초 렌더링 실행
        renderGrid();

        // 5. 외부 제어 인터페이스 반환
        return {
            element: container,
            updateSchedules: (newSchedules) => {
                schedules = newSchedules || [];
                renderGrid();
            },
            getDate: () => currentDate
        };
    }
};