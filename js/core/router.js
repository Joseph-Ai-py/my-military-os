/**
 * MY MILITARY OS
 * Router Module
 * GitHub Pages 호환성을 보장하는 Hash 기반 SPA 라우터 시스템입니다.
 */

const routes = new Map();
let currentRoute = '';
let routeChangeListeners = [];

export const Router = {
    /**
     * 특정 경로에 대한 핸들러를 등록합니다.
     * @param {string} path 경로 (예: '#/', '#/military', '#/finance' 등)
     * @param {Function} handler 경로 진입 시 실행할 콜백 함수 (View 렌더링 함수)
     */
    registerRoute(path, handler) {
        routes.set(path, handler);
    },

    getHandler(path = this.getCurrentRoute()) {
    return routes.get(path) || null;
    },

    /**
     * 지정한 경로로 이동합니다 (Hash 변경).
     * @param {string} path 이동할 경로
     */
    navigate(path) {
        // 해시 형태가 아니면 접두사 부여
        const targetHash = path.startsWith('#') ? path : `#${path}`;
        window.location.hash = targetHash;
    },

    /**
     * 현재 활성화된 라우트 경로를 반환합니다.
     * @returns {string}
     */
    getCurrentRoute() {
        const hash = window.location.hash || '#/';
        return hash;
    },

    /**
     * 라우트 변경 시 호출될 콜백을 등록합니다.
     * @param {Function} callback 
     */
    onRouteChange(callback) {
        if (typeof callback === 'function') {
            routeChangeListeners.push(callback);
        }
    },

    /**
     * 라우터 시스템을 초기화하고 이벤트 리스너를 바인딩합니다.
     */
    init() {
        const handleRouting = () => {
            const route = this.getCurrentRoute();
            currentRoute = route;

            // 등록된 리스너들에게 라우트 변경 통보
            routeChangeListeners.forEach(listener => {
                try {
                    listener(route);
                } catch (err) {
                    console.error('[Router Error in Listener]', err);
                }
            });

            // 해당 경로에 등록된 핸들러 실행
            const handler = routes.get(route);
            if (typeof handler === 'function') {
                try {
                    handler();
                } catch (err) {
                    console.error(`[Router Error] Failed to execute handler for route "${route}":`, err);
                }
            } else {
                // 매칭되는 라우트가 없을 경우 기본 홈('/')으로 리다이렉트 또는 처리
                const defaultHandler = routes.get('#/');
                if (typeof defaultHandler === 'function') {
                    defaultHandler();
                }
            }
        };

        window.addEventListener('hashchange', handleRouting);

        // 초기 로드 시점의 라우팅 처리 (해시가 없으면 기본 '#/' 설정)
        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            handleRouting();
        }
    }
};