/**
 * MY MILITARY OS
 * Storage Module (LocalStorage & JSON Export/Import)
 */

const STORAGE_KEY = 'my-military-os-store';

/**
 * 기본 스토어 구조를 반환하는 헬퍼 함수
 * 데이터가 없거나 손상되었을 때 안전한 기본값을 제공합니다.
 */
const getDefaultStore = () => ({
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
});

export const Storage = {
    /**
     * LocalStorage에서 스토어 데이터를 불러옵니다.
     * @returns {Object} 파싱된 스토어 데이터 또는 기본 스토어 데이터
     */
    loadStore() {
        try {
            const serializedData = localStorage.getItem(STORAGE_KEY);
            if (!serializedData) {
                return getDefaultStore();
            }

            const parsedData = JSON.parse(serializedData);
            
            // 기존 데이터 구조에 없는 새로운 키가 있을 수 있으므로 기본 스토어와 병합
            return {
                ...getDefaultStore(),
                ...parsedData
            };
        } catch (error) {
            console.error('[Storage Error] Failed to load store from LocalStorage:', error);
            return getDefaultStore();
        }
    },

    /**
     * 스토어 데이터를 LocalStorage에 저장합니다.
     * @param {Object} storeData 저장할 스토어 객체
     * @returns {boolean} 저장 성공 여부
     */
    saveStore(storeData) {
        try {
            const serializedData = JSON.stringify(storeData);
            localStorage.setItem(STORAGE_KEY, serializedData);
            return true;
        } catch (error) {
            console.error('[Storage Error] Failed to save store to LocalStorage:', error);
            return false;
        }
    },

    /**
     * LocalStorage의 데이터를 모두 초기화합니다.
     * @returns {boolean} 성공 여부
     */
    clearStore() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('[Storage Error] Failed to clear LocalStorage:', error);
            return false;
        }
    },

    /**
     * 백업 파일 이름을 생성합니다. (예: my-military-os-backup-20231025-143000.json)
     * @returns {string} 파일 이름
     */
    createBackupFileName() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `my-military-os-backup-${year}${month}${day}-${hours}${minutes}${seconds}.json`;
    },

    /**
     * 스토어 데이터를 JSON 파일로 다운로드합니다.
     * @param {Object} storeData 내보낼 스토어 데이터
     */
    exportStore(storeData) {
        try {
            const dataString = JSON.stringify(storeData, null, 2);
            const blob = new Blob([dataString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = this.createBackupFileName();
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // 정리 작업
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('[Storage Error] Failed to export store to JSON:', error);
            return false;
        }
    },

    /**
     * JSON 문자열을 검증하고 스토어 객체로 변환합니다.
     * @param {string} jsonString Import할 JSON 문자열
     * @returns {Object} 검증 및 파싱된 스토어 객체
     * @throws {Error} 형식이 잘못되었을 경우 에러 발생
     */
    importStore(jsonString) {
        try {
            const parsedData = JSON.parse(jsonString);

            if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
                throw new Error('Invalid backup file format: Root must be an object.');
            }

            const defaultStore = getDefaultStore();
            const validKeys = Object.keys(defaultStore);
            
            // 유효한 컬렉션 키가 하나라도 있는지 확인 (최소한의 구조 검증)
            const hasValidStructure = validKeys.some(key => Array.isArray(parsedData[key]));
            
            if (!hasValidStructure) {
                throw new Error('Invalid backup file format: Missing required collections.');
            }

            // 기본 스토어 구조를 바탕으로 안전하게 데이터 병합 (배열인 것만 허용)
            const importedStore = { ...defaultStore };
            
            validKeys.forEach(key => {
                if (Array.isArray(parsedData[key])) {
                    importedStore[key] = parsedData[key];
                }
            });

            return importedStore;
        } catch (error) {
            console.error('[Storage Error] Failed to import store:', error);
            throw error;
        }
    }
};