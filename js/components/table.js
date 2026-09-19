/**
 * MY MILITARY OS
 * Table Component
 * 안전한 DOM 생성으로 XSS를 방지하며, 정렬 및 클릭 이벤트를 지원하는 재사용 가능한 데이터 테이블입니다.
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

export const Table = {
    /**
     * 데이터 테이블을 렌더링합니다.
     * @param {Object} options 
     * @param {Array} options.columns - [{ key: 'title', label: '제목', sortable: true, render: (val, row) => Node|string }]
     * @param {Array} options.data - 테이블에 표시할 데이터 객체 배열
     * @param {Function} [options.onRowClick] - 행 클릭 시 호출될 콜백 함수 (rowData 전달)
     * @param {Function} [options.onSort] - 헤더 클릭(정렬) 시 호출될 콜백 함수 (columnKey 전달)
     * @param {Object} [options.sortState] - 현재 정렬 상태 { key: 'title', direction: 'asc'|'desc' }
     * @param {string} [options.emptyMessage] - 데이터가 없을 때 표시할 메시지
     * @returns {HTMLElement} .table-container 로 감싸진 완성된 테이블 요소
     */
    renderTable(options) {
        const {
            columns = [],
            data = [],
            onRowClick,
            onSort,
            sortState = { key: null, direction: null },
            emptyMessage = '데이터가 없습니다.'
        } = options;

        const container = createElement('div', 'table-container');
        const table = createElement('table', 'table');

        // ==========================================
        // 1. Table Header (Thead)
        // ==========================================
        const thead = createElement('thead');
        const headerRow = createElement('tr');

        columns.forEach(col => {
            const th = createElement('th');
            
            // 헤더 내용 컨테이너 (정렬 아이콘 포함 위함)
            const headerContent = createElement('div');
            headerContent.style.display = 'flex';
            headerContent.style.alignItems = 'center';
            headerContent.style.gap = 'var(--spacing-1)';
            
            const label = createElement('span', '', col.label);
            headerContent.appendChild(label);

            // 정렬 기능 처리
            if (col.sortable) {
                th.style.cursor = 'pointer';
                th.classList.add('sortable');
                
                // 정렬 아이콘 표시
                if (sortState.key === col.key) {
                    const icon = createElement('span', 'sort-icon', sortState.direction === 'asc' ? '↑' : '↓');
                    headerContent.appendChild(icon);
                    th.style.color = 'var(--color-text)'; // 활성화된 정렬 헤더 강조
                }

                th.addEventListener('click', () => {
                    if (typeof onSort === 'function') {
                        onSort(col.key);
                    }
                });
            }

            th.appendChild(headerContent);
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // ==========================================
        // 2. Table Body (Tbody)
        // ==========================================
        const tbody = createElement('tbody');

        if (data.length === 0) {
            // 빈 상태 처리
            const emptyRow = createElement('tr');
            const emptyCell = createElement('td', 'table-empty-cell', emptyMessage);
            emptyCell.colSpan = columns.length;
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = 'var(--spacing-8) var(--spacing-4)';
            emptyCell.style.color = 'var(--color-text-muted)';
            
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            // 데이터 행 렌더링
            data.forEach((rowData, index) => {
                const tr = createElement('tr');

                if (typeof onRowClick === 'function') {
                    tr.style.cursor = 'pointer';
                    tr.addEventListener('click', () => onRowClick(rowData, index));
                }

                columns.forEach(col => {
                    const td = createElement('td');
                    const value = rowData[col.key];

                    // 커스텀 렌더러가 있는 경우
                    if (typeof col.render === 'function') {
                        const renderedContent = col.render(value, rowData);
                        if (renderedContent instanceof Node) {
                            td.appendChild(renderedContent);
                        } else {
                            // XSS 방지를 위해 textContent로 삽입
                            td.textContent = renderedContent !== undefined && renderedContent !== null ? renderedContent : '';
                        }
                    } else {
                        // 기본 텍스트 렌더링
                        td.textContent = value !== undefined && value !== null ? value : '';
                    }

                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });
        }

        table.appendChild(tbody);
        container.appendChild(table);

        return container;
    }
};