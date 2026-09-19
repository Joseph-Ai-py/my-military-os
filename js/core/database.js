/**
 * MY MILITARY OS
 * Core Database Module (Single Source of Truth)
 */

let store = {
    settings: [],
    schedules: [],
    rewards: [],
    goals: [],
    studies: [],
    projects: [],
    tasks: [],
    issues: [],
    contents: [],
    transactions: [],
    assets: [],
    categories: [],
    budgets: [],
    monthlyReports: []
};

let subscribers = [];

/**
 * ID 생성 헬퍼 함수
 * @returns {string} 고유 ID
 */
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2);
};

/**
 * 컬렉션 유효성 검사 헬퍼 함수
 * @param {string} collection - 컬렉션 이름
 * @throws {Error} 유효하지 않은 컬렉션 이름일 경우 에러 발생
 */
const validateCollection = (collection) => {
    if (!store.hasOwnProperty(collection)) {
        throw new Error(`[Database Error] Invalid collection name: "${collection}"`);
    }
};

export const Database = {
    /**
     * 특정 컬렉션의 모든 데이터를 반환한다.
     * @param {string} collection 
     * @returns {Array}
     */
    get(collection) {
        validateCollection(collection);
        return [...store[collection]];
    },

    /**
     * 전체 스토어 데이터를 반환한다.
     * @returns {Object}
     */
    getAll() {
        return store;
    },

    /**
     * 특정 컬렉션에서 ID로 레코드를 찾는다.
     * @param {string} collection 
     * @param {string} id 
     * @returns {Object|null}
     */
    find(collection, id) {
        validateCollection(collection);
        return store[collection].find(item => item.id === id) || null;
    },

    /**
     * 특정 컬렉션에 새 레코드를 추가한다.
     * @param {string} collection 
     * @param {Object} data 
     * @returns {Object} 추가된 레코드
     */
    add(collection, data) {
        validateCollection(collection);
        
        const now = new Date().toISOString();
        const newItem = {
            id: data.id || generateId(),
            createdAt: now,
            updatedAt: now,
            ...data
        };
        
        store[collection].push(newItem);
        this.notify();
        
        return newItem;
    },

    /**
     * 특정 컬렉션의 레코드를 업데이트한다.
     * @param {string} collection 
     * @param {string} id 
     * @param {Object} data 
     * @returns {Object} 업데이트된 레코드
     */
    update(collection, id, data) {
        validateCollection(collection);
        
        const index = store[collection].findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`[Database Error] Record with id "${id}" not found in "${collection}"`);
        }
        
        const updatedItem = {
            ...store[collection][index],
            ...data,
            id: id, // ID 변경 방지
            updatedAt: new Date().toISOString()
        };
        
        store[collection][index] = updatedItem;
        this.notify();
        
        return updatedItem;
    },

    /**
     * 특정 컬렉션에서 레코드를 삭제한다.
     * @param {string} collection 
     * @param {string} id 
     * @returns {boolean} 삭제 성공 여부
     */
    remove(collection, id) {
        validateCollection(collection);
        
        const initialLength = store[collection].length;
        store[collection] = store[collection].filter(item => item.id !== id);
        
        if (store[collection].length !== initialLength) {
            this.notify();
            return true;
        }
        
        return false;
    },

    /**
     * 특정 컬렉션의 모든 데이터를 비운다.
     * @param {string} collection 
     */
    clear(collection) {
        validateCollection(collection);
        store[collection] = [];
        this.notify();
    },

    /**
     * 전체 스토어 데이터를 새로운 데이터로 교체한다. (주로 외부 Import 시 사용)
     * @param {Object} newData 
     */
    replaceAll(newData) {
        if (!newData || typeof newData !== 'object') {
            throw new Error('[Database Error] Invalid data format for replaceAll');
        }
        
        Object.keys(store).forEach(collection => {
            store[collection] = Array.isArray(newData[collection]) ? newData[collection] : [];
        });
        
        this.notify();
    },

    /**
     * 데이터 변경 이벤트를 구독한다.
     * @param {Function} listener 
     * @returns {Function} 구독 취소 함수
     */
    subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('[Database Error] Listener must be a function');
        }
        
        subscribers.push(listener);
        
        return () => {
            subscribers = subscribers.filter(sub => sub !== listener);
        };
    },

    /**
     * 모든 구독자에게 데이터 변경을 알린다.
     */
    notify() {
        subscribers.forEach(listener => {
            try {
                listener(store);
            } catch (error) {
                console.error('[Database Error] Subscriber execution error:', error);
            }
        });
    }
};