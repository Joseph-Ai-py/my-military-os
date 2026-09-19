/**
 * MY MILITARY OS
 * Toast Notification Component
 */

export const Toast = {
    /**
     * Toast 알림을 화면에 표시합니다.
     * @param {string} message 표시할 텍스트 메시지
     * @param {string} type 알림 타입 ('success', 'error', 'warning', 'info')
     * @param {number} duration 표시 시간 (기본값 3000ms)
     */
    showToast(message, type = 'info', duration = 3000) {
        const root = document.getElementById('toast-root');
        if (!root) {
            console.error('[Toast Error] #toast-root element not found in DOM.');
            return;
        }

        // 토스트 요소들을 담을 컨테이너 확인 및 생성
        let container = root.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            root.appendChild(container);
        }

        // 토스트 요소 생성
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // 접근성 속성
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        // 타입별 아이콘 설정
        let iconSymbol = 'ℹ️';
        if (type === 'success') iconSymbol = '✅';
        if (type === 'error') iconSymbol = '🚨';
        if (type === 'warning') iconSymbol = '⚠️';

        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = iconSymbol;
        icon.setAttribute('aria-hidden', 'true');

        const text = document.createElement('span');
        text.className = 'toast-message';
        text.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(text);

        // 컨테이너에 추가 (새로운 알림이 아래에 쌓임)
        container.appendChild(toast);

        // 자동 제거 타이머 설정
        setTimeout(() => {
            // 퇴장 애니메이션 처리 (opacity 0)
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            
            // 애니메이션 완료 후 DOM에서 완전히 제거
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
                // 모든 토스트가 사라지면 컨테이너도 정리
                if (container.children.length === 0 && container.parentElement) {
                    container.parentElement.removeChild(container);
                }
            }, 300);
        }, duration);
    }
};