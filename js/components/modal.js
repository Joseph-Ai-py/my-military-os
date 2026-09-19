/**
 * MY MILITARY OS
 * Modal Component
 */

let activeElementBeforeModal = null;
let currentEscapeListener = null;

/**
 * 안전하게 DOM 요소를 생성하는 헬퍼 함수
 */
const createElement = (tag, classNames = '', textContent = '') => {
    const el = document.createElement(tag);
    if (classNames) el.className = classNames;
    if (textContent) el.textContent = textContent;
    return el;
};

/**
 * 모달 내부의 포커스 가능한 요소를 찾아 첫 번째 요소에 포커스를 이동
 */
const trapFocus = (modalElement) => {
    const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        setTimeout(() => focusableElements[0].focus(), 50);
    }
};

export const Modal = {
    /**
     * 모달의 DOM 구조를 생성합니다. (XSS 방지를 위해 createElement 사용)
     * @param {Object} options { title, body (string or HTMLElement), buttons, size, onClose }
     * @returns {HTMLElement} 생성된 모달 오버레이 요소
     */
    setModalContent(options) {
        const overlay = createElement('div', 'modal-overlay');
        const content = createElement('div', 'modal-content');
        
        content.setAttribute('role', 'dialog');
        content.setAttribute('aria-modal', 'true');
        
        if (options.size === 'lg') {
            content.classList.add('modal-lg');
        }

        // Header
        const header = createElement('div', 'modal-header');
        const title = createElement('h3', 'modal-title', options.title || '');
        
        const closeBtn = createElement('button', 'icon-btn');
        closeBtn.setAttribute('aria-label', '닫기');
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', () => this.closeModal(options.onClose));

        header.appendChild(title);
        header.appendChild(closeBtn);
        content.appendChild(header);

        // Body
        const body = createElement('div', 'modal-body');
        if (options.body instanceof HTMLElement) {
            body.appendChild(options.body);
        } else if (typeof options.body === 'string') {
            body.textContent = options.body;
        }
        content.appendChild(body);

        // Footer & Buttons
        if (options.buttons && options.buttons.length > 0) {
            const footer = createElement('div', 'modal-footer');
            
            options.buttons.forEach(btnDef => {
                const btn = createElement('button', `btn ${btnDef.className || 'btn-outline'}`, btnDef.text);
                if (btnDef.type) btn.type = btnDef.type;
                
                btn.addEventListener('click', (e) => {
                    if (btnDef.onClick) {
                        btnDef.onClick(e);
                    }
                });
                footer.appendChild(btn);
            });
            
            content.appendChild(footer);
        }

        overlay.appendChild(content);

        // 바깥 영역 클릭 시 닫기
        overlay.addEventListener('mousedown', (e) => {
            if (e.target === overlay) {
                this.closeModal(options.onClose);
            }
        });

        return overlay;
    },

    /**
     * 모달을 화면에 엽니다.
     * @param {Object} options 
     */
    openModal(options) {
        const root = document.getElementById('modal-root');
        if (!root) {
            console.error('[Modal Error] #modal-root element not found in DOM.');
            return;
        }

        // 기존 모달 정리
        root.innerHTML = '';
        
        // 이전 포커스 저장
        activeElementBeforeModal = document.activeElement;

        // 모달 DOM 마운트
        const modalElement = this.setModalContent(options);
        root.appendChild(modalElement);

        // ESC 키 이벤트 등록
        if (currentEscapeListener) {
            document.removeEventListener('keydown', currentEscapeListener);
        }
        currentEscapeListener = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(options.onClose);
            }
        };
        document.addEventListener('keydown', currentEscapeListener);

        // 애니메이션을 위해 리플로우 강제 트리거
        void modalElement.offsetWidth;
        modalElement.classList.add('active');

        trapFocus(modalElement);
    },

    /**
     * 현재 열려있는 모달을 닫습니다.
     * @param {Function} [onCloseCallback] 
     */
    closeModal(onCloseCallback) {
        const root = document.getElementById('modal-root');
        if (!root) return;

        const overlay = root.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            
            // 트랜지션 완료 대기 후 DOM 정리 (CSS 변수 --transition-normal 기준 보통 250ms)
            setTimeout(() => {
                root.innerHTML = '';
                
                if (currentEscapeListener) {
                    document.removeEventListener('keydown', currentEscapeListener);
                    currentEscapeListener = null;
                }

                // 포커스 원복
                if (activeElementBeforeModal && typeof activeElementBeforeModal.focus === 'function') {
                    activeElementBeforeModal.focus();
                    activeElementBeforeModal = null;
                }

                if (typeof onCloseCallback === 'function') {
                    onCloseCallback();
                }
            }, 250);
        }
    },

    /**
     * Promise 기반의 Confirm 모달을 띄웁니다.
     * @param {Object} options { title, message, confirmText, cancelText, confirmClass }
     * @returns {Promise<boolean>}
     */
    confirmModal(options) {
        return new Promise((resolve) => {
            let isResolved = false;

            const handleResolve = (value) => {
                if (!isResolved) {
                    isResolved = true;
                    resolve(value);
                    this.closeModal();
                }
            };

            this.openModal({
                title: options.title || '확인',
                body: options.message || '',
                onClose: () => handleResolve(false),
                buttons: [
                    {
                        text: options.cancelText || '취소',
                        className: 'btn-ghost',
                        onClick: () => handleResolve(false)
                    },
                    {
                        text: options.confirmText || '확인',
                        className: options.confirmClass || 'btn-primary',
                        onClick: () => handleResolve(true)
                    }
                ]
            });
        });
    }
};