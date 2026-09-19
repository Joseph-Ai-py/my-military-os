import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Assets Module
 * 금융 자산(계좌, 예적금, 대출 등)을 관리하고 순자산을 계산하는 모듈입니다.
 */

const COLLECTION = 'assets';
const GOAL_ONE_HUNDRED_MILLION = 100000000; // 1억원

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.
 * @returns {string}
 */
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const Assets = {
    /**
     * 모든 자산/부채 목록을 가져옵니다.
     * @returns {Array} 자산/부채 객체 배열
     */
    getAssets() {
        return Database.get(COLLECTION);
    },

    /**
     * 새 자산/부채를 생성합니다.
     * @param {Object} data 자산/부채 데이터
     * @returns {Object} 생성된 레코드
     */
    createAsset(data) {
        const newAsset = {
            name: data.name || '새 자산',
            type: data.type || '계좌', // 계좌, 카드, 예금, 적금, 투자, 기타자산, 대출
            institution: data.institution || '', // 은행명, 증권사명 등
            currentAmount: Number(data.currentAmount) || 0,
            asOfDate: data.asOfDate || getTodayString(),
            assetType: data.assetType || 'asset', // asset(자산), liability(부채)
            memo: data.memo || ''
        };

        return Database.add(COLLECTION, newAsset);
    },

    /**
     * 기존 자산/부채를 업데이트합니다.
     * @param {string} id 수정할 레코드 ID
     * @param {Object} data 업데이트할 데이터
     * @returns {Object} 업데이트된 레코드
     */
    updateAsset(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Assets Error] Asset with id "${id}" not found.`);
        }

        const updateData = { ...data };

        // 숫자형 데이터 강제 변환
        if (updateData.currentAmount !== undefined) {
            updateData.currentAmount = Number(updateData.currentAmount) || 0;
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 자산/부채 레코드를 삭제하고 연관된 관계(거래 내역 등)를 정리합니다.
     * @param {string} id 삭제할 레코드 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteAsset(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 총 자산(asset)의 합계를 계산합니다.
     * @returns {number} 총 자산액
     */
    calculateTotalAssets() {
        return this.getAssets()
            .filter(item => item.assetType === 'asset')
            .reduce((sum, item) => sum + (Number(item.currentAmount) || 0), 0);
    },

    /**
     * 총 부채(liability)의 합계를 계산합니다.
     * @returns {number} 총 부채액
     */
    calculateTotalLiabilities() {
        return this.getAssets()
            .filter(item => item.assetType === 'liability')
            .reduce((sum, item) => sum + (Number(item.currentAmount) || 0), 0);
    },

    /**
     * 순자산(총 자산 - 총 부채)을 계산합니다.
     * @returns {number} 순자산액
     */
    calculateNetWorth() {
        const totalAssets = this.calculateTotalAssets();
        const totalLiabilities = this.calculateTotalLiabilities();
        return totalAssets - totalLiabilities;
    },

    /**
     * 1억원 모으기 목표 달성 진행률을 계산합니다 (0 ~ 100 범위).
     * @returns {number} 진행률 (%)
     */
    calculateOneHundredMillionProgress() {
        const netWorth = this.calculateNetWorth();
        
        if (netWorth <= 0) return 0;
        
        let progress = (netWorth / GOAL_ONE_HUNDRED_MILLION) * 100;
        
        // 0 ~ 100 사이의 값으로 제한 및 반올림 처리
        return Math.min(Math.max(Math.round(progress), 0), 100);
    }
};