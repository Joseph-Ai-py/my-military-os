import { Database } from './database.js';

/**
 * MY MILITARY OS
 * Core Settings Module
 */

const DEFAULT_SETTINGS = {
    enlistmentDate: '',
    dischargeDate: '',
    currentRank: '이병',
    meritExchangeRate: 50,         // 상점교환기준
    religionExchangeRate: 20,      // 종교교환기준
    maxRewardVacation: 16,         // 포상휴가최대
    overtimeToRestRate: 8,         // 시간외 -> 전투휴무 환산 기준 (예: 8시간 = 1일)
    trainingToRestRate: 1          // 훈련 -> 전투휴무 환산 기준 (예: 1회 = 1일)
};

const RANK_SYMBOLS = {
    '이병': '-',
    '일병': '=',
    '상병': '△',
    '병장': '□'
};

export const Settings = {
    /**
     * 설정을 가져옵니다. DB에 없거나 빈 값일 경우 기본값을 반환합니다.
     * @param {string} key 설정 키
     * @returns {*} 설정 값
     */
    getSetting(key) {
        const record = Database.find('settings', key);
        if (record !== null && record.value !== undefined && record.value !== '') {
            return record.value;
        }
        return DEFAULT_SETTINGS[key];
    },

    /**
     * 설정을 저장하거나 업데이트합니다.
     * @param {string} key 설정 키
     * @param {*} value 저장할 값
     */
    setSetting(key, value) {
        const record = Database.find('settings', key);
        if (record !== null) {
            Database.update('settings', key, { value });
        } else {
            Database.add('settings', { id: key, value });
        }
    },

    /**
     * 설정을 숫자로 반환합니다. 파싱할 수 없는 경우 기본값을 숫자로 반환합니다.
     * @param {string} key 설정 키
     * @returns {number} 숫자 형태의 설정 값
     */
    getNumericSetting(key) {
        const val = this.getSetting(key);
        const num = Number(val);
        return isNaN(num) ? Number(DEFAULT_SETTINGS[key] || 0) : num;
    },

    /**
     * 설정을 문자열로 반환합니다.
     * @param {string} key 설정 키
     * @returns {string} 문자열 형태의 설정 값
     */
    getTextSetting(key) {
        const val = this.getSetting(key);
        return String(val || '');
    },

    /**
     * 설정을 날짜(YYYY-MM-DD) 형식으로 반환합니다. 유효하지 않은 경우 기본값을 반환합니다.
     * @param {string} key 설정 키
     * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
     */
    getDateSetting(key) {
        const val = this.getSetting(key);
        
        // YYYY-MM-DD 정규식 검사
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (datePattern.test(val)) {
            return val;
        }
        
        return DEFAULT_SETTINGS[key] || '';
    },

    /**
     * 계급에 해당하는 기호를 반환합니다.
     * @param {string} [rank] 확인할 계급 (생략 시 현재 계급 사용)
     * @returns {string} 계급 기호 (-, =, △, □)
     */
    getRankSymbol(rank) {
        const targetRank = rank || this.getTextSetting('currentRank');
        return RANK_SYMBOLS[targetRank] || '-';
    }
};