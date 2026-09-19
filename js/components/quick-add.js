import { Database } from '../core/database.js';
import { Modal } from './modal.js';
import { Toast } from './toast.js';

/**
 * MY MILITARY OS
 * Quick Add Component
 * FAB 버튼을 통한 빠른 데이터 입력 및 중앙 Store 저장 기능을 제공합니다.
 */

/**
 * DOM 요소를 안전하게 생성하는 헬퍼
 */
const createElement = (tag, classNames = '', attributes = {}) => {
    const el = document.createElement(tag);
    if (classNames) el.className = classNames;
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent') el.textContent = value;
        else if (key === 'value') el.value = value;
        else el.setAttribute(key, value);
    });
    
    return el;
};

/**
 * 폼 그룹(라벨 + 입력필드) 생성 헬퍼
 */
const createFormGroup = (labelText, inputElement) => {
    const group = createElement('div', 'form-group');
    const label = createElement('label', 'form-label', { textContent: labelText });
    group.appendChild(label);
    group.appendChild(inputElement);
    return group;
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
const getTodayString = () => new Date().toISOString().split('T')[0];

export const QuickAdd = {
    /**
     * Quick Add 시스템을 초기화합니다.
     */
    init() {
        const fab = document.getElementById('quick-add-fab');
        if (!fab) return;

        // 메뉴 컨테이너 생성
        const menu = createElement('div', 'quick-add-menu');
        menu.id = 'quick-add-menu';

        // 메뉴 항목 정의
        const items = [
            { label: '일정', icon: '📅', action: () => this.openScheduleModal() },
            { label: '보상', icon: '🏆', action: () => this.openRewardModal() },
            { label: '거래', icon: '💰', action: () => this.openTransactionModal() },
            { label: '학습', icon: '📚', action: () => this.openStudyModal() },
            { label: '작업', icon: '✓', action: () => this.openTaskModal() }
        ];

        // 메뉴 항목 DOM 추가
        items.forEach(item => {
            const btn = createElement('button', 'quick-add-item');
            const icon = createElement('span', '', { textContent: item.icon, 'aria-hidden': 'true' });
            const text = createElement('span', '', { textContent: item.label });
            
            btn.appendChild(icon);
            btn.appendChild(text);
            
            btn.addEventListener('click', () => {
                this.closeMenu();
                item.action();
            });
            
            menu.appendChild(btn);
        });

        // Body에 메뉴 마운트
        document.body.appendChild(menu);

        // FAB 클릭 이벤트 (토글)
        fab.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.classList.contains('active')) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        });

        // 외부 영역 클릭 시 메뉴 닫기
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && !menu.contains(e.target) && e.target !== fab) {
                this.closeMenu();
            }
        });
    },

    openMenu() {
        const fab = document.getElementById('quick-add-fab');
        const menu = document.getElementById('quick-add-menu');
        if (fab && menu) {
            fab.classList.add('active');
            menu.classList.add('active');
        }
    },

    closeMenu() {
        const fab = document.getElementById('quick-add-fab');
        const menu = document.getElementById('quick-add-menu');
        if (fab && menu) {
            fab.classList.remove('active');
            menu.classList.remove('active');
        }
    },

    openScheduleModal() {
        const titleInput = createElement('input', 'input', { type: 'text', placeholder: '일정명 입력' });
        const dateInput = createElement('input', 'input', { type: 'date', value: getTodayString() });
        const typeSelect = createElement('select', 'select');
        
        ['일반', '훈련', '당직', '휴가출발', '휴가복귀', '외박', '외출', '외진'].forEach(type => {
            typeSelect.appendChild(createElement('option', '', { value: type, textContent: type }));
        });

        const form = createElement('div', 'form-container');
        form.appendChild(createFormGroup('일정명', titleInput));
        form.appendChild(createFormGroup('날짜', dateInput));
        form.appendChild(createFormGroup('유형', typeSelect));

        Modal.openModal({
            title: '새 일정 추가',
            body: form,
            buttons: [
                { text: '취소', className: 'btn-ghost', onClick: () => Modal.closeModal() },
                {
                    text: '저장', className: 'btn-primary', onClick: () => {
                        if (!titleInput.value.trim()) return Toast.showToast('일정명을 입력해주세요.', 'error');
                        
                        Database.add('schedules', {
                            title: titleInput.value.trim(),
                            date: dateInput.value,
                            type: typeSelect.value
                        });
                        
                        Toast.showToast('일정이 저장되었습니다.', 'success');
                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openRewardModal() {
        const typeSelect = createElement('select', 'select');
        ['상점', '종교', '포상휴가', '기타'].forEach(type => {
            typeSelect.appendChild(createElement('option', '', { value: type, textContent: type }));
        });
        const amountInput = createElement('input', 'input', { type: 'number', placeholder: '획득량 (숫자)' });
        const dateInput = createElement('input', 'input', { type: 'date', value: getTodayString() });

        const form = createElement('div', 'form-container');
        form.appendChild(createFormGroup('유형', typeSelect));
        form.appendChild(createFormGroup('획득량', amountInput));
        form.appendChild(createFormGroup('날짜', dateInput));

        Modal.openModal({
            title: '새 보상 추가',
            body: form,
            buttons: [
                { text: '취소', className: 'btn-ghost', onClick: () => Modal.closeModal() },
                {
                    text: '저장', className: 'btn-primary', onClick: () => {
                        if (!amountInput.value) return Toast.showToast('획득량을 입력해주세요.', 'error');
                        
                        Database.add('rewards', {
                            type: typeSelect.value,
                            amount: Number(amountInput.value),
                            date: dateInput.value
                        });
                        
                        Toast.showToast('보상이 저장되었습니다.', 'success');
                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openTransactionModal() {
        const titleInput = createElement('input', 'input', { type: 'text', placeholder: '거래 내역 입력' });
        const amountInput = createElement('input', 'input', { type: 'number', placeholder: '금액' });
        
        const typeSelect = createElement('select', 'select');
        ['지출', '수입'].forEach(type => {
            typeSelect.appendChild(createElement('option', '', { value: type, textContent: type }));
        });

        const catSelect = createElement('select', 'select');
        ['식비', '교통', '쇼핑', '자기계발', '급여', '기타'].forEach(type => {
            catSelect.appendChild(createElement('option', '', { value: type, textContent: type }));
        });

        const form = createElement('div', 'form-container');
        form.appendChild(createFormGroup('거래명', titleInput));
        form.appendChild(createFormGroup('금액', amountInput));
        form.appendChild(createFormGroup('유형', typeSelect));
        form.appendChild(createFormGroup('카테고리', catSelect));

        Modal.openModal({
            title: '새 거래 추가',
            body: form,
            buttons: [
                { text: '취소', className: 'btn-ghost', onClick: () => Modal.closeModal() },
                {
                    text: '저장', className: 'btn-primary', onClick: () => {
                        if (!titleInput.value.trim() || !amountInput.value) {
                            return Toast.showToast('거래명과 금액을 모두 입력해주세요.', 'error');
                        }
                        
                        Database.add('transactions', {
                            title: titleInput.value.trim(),
                            amount: Number(amountInput.value),
                            type: typeSelect.value,
                            category: catSelect.value,
                            date: getTodayString()
                        });
                        
                        Toast.showToast('거래가 저장되었습니다.', 'success');
                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openStudyModal() {
        const titleInput = createElement('input', 'input', { type: 'text', placeholder: '학습 제목 입력' });
        const durationInput = createElement('input', 'input', { type: 'number', placeholder: '공부시간 (분)' });

        const form = createElement('div', 'form-container');
        form.appendChild(createFormGroup('제목', titleInput));
        form.appendChild(createFormGroup('공부시간 (분)', durationInput));

        Modal.openModal({
            title: '학습 기록 추가',
            body: form,
            buttons: [
                { text: '취소', className: 'btn-ghost', onClick: () => Modal.closeModal() },
                {
                    text: '저장', className: 'btn-primary', onClick: () => {
                        if (!titleInput.value.trim() || !durationInput.value) {
                            return Toast.showToast('제목과 공부시간을 모두 입력해주세요.', 'error');
                        }
                        
                        Database.add('studies', {
                            title: titleInput.value.trim(),
                            duration: Number(durationInput.value),
                            date: getTodayString()
                        });
                        
                        Toast.showToast('학습 기록이 저장되었습니다.', 'success');
                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openTaskModal() {
        const titleInput = createElement('input', 'input', { type: 'text', placeholder: '작업명 입력' });
        const prioritySelect = createElement('select', 'select');
        ['높음', '중간', '낮음'].forEach(type => {
            const opt = createElement('option', '', { value: type, textContent: type });
            if (type === '중간') opt.selected = true;
            prioritySelect.appendChild(opt);
        });

        const form = createElement('div', 'form-container');
        form.appendChild(createFormGroup('작업명', titleInput));
        form.appendChild(createFormGroup('우선순위', prioritySelect));

        Modal.openModal({
            title: '새 작업 추가',
            body: form,
            buttons: [
                { text: '취소', className: 'btn-ghost', onClick: () => Modal.closeModal() },
                {
                    text: '저장', className: 'btn-primary', onClick: () => {
                        if (!titleInput.value.trim()) return Toast.showToast('작업명을 입력해주세요.', 'error');
                        
                        Database.add('tasks', {
                            title: titleInput.value.trim(),
                            priority: prioritySelect.value,
                            status: '대기',
                            date: getTodayString()
                        });
                        
                        Toast.showToast('작업이 저장되었습니다.', 'success');
                        Modal.closeModal();
                    }
                }
            ]
        });
    }
};