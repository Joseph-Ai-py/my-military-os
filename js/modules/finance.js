import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Finance Module
 * 거래 내역(수입, 지출, 저축, 투자, 이체) 관리 및 통계 계산을 담당합니다.
 */

const COLLECTION = 'transactions';

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

/**
 * 현재 월을 YYYY-MM 형식으로 반환합니다.
 * @returns {string}
 */
const getCurrentMonthString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const Finance = {
    /**
     * 모든 거래 내역을 가져옵니다.
     * @returns {Array} 거래 내역 배열
     */
    getTransactions() {
        return Database.get(COLLECTION);
    },

    /**
     * 오늘 발생한 거래 내역을 가져옵니다.
     * @returns {Array} 오늘의 거래 내역 배열
     */
    getTodayTransactions() {
        const todayStr = getTodayString();
        return this.getTransactions().filter(t => t.date === todayStr);
    },

    /**
     * 특정 월(또는 이번 달)의 거래 내역을 가져옵니다.
     * @param {string} [monthStr] YYYY-MM 형식의 문자열 (생략 시 이번 달)
     * @returns {Array} 해당 월의 거래 내역 배열
     */
    getMonthlyTransactions(monthStr) {
        const targetMonth = monthStr || getCurrentMonthString();
        return this.getTransactions().filter(t => t.date && t.date.startsWith(targetMonth));
    },

    /**
     * 새 거래를 생성합니다. (가장 자주 입력되는 데이터이므로 최소 기본값 보장)
     * @param {Object} data 거래 데이터
     * @returns {Object} 생성된 거래 객체
     */
    createTransaction(data) {
    let categoryId =
        data.categoryId || null;

    // 기존 category 문자열 호환
    if (!categoryId && data.category) {
        const categories =
            Database.get('categories');

        const normalizedName =
            String(data.category).trim();

        let category =
            categories.find(
                item =>
                    item.name === normalizedName ||
                    item.title === normalizedName ||
                    item.categoryName === normalizedName
            );

        // 없으면 자동 생성
        if (!category) {
            category =
                Database.add(
                    'categories',
                    {
                        name: normalizedName,
                        type: '지출',
                        defaultBudget: 0,
                        description: ''
                    }
                );
        }

        categoryId = category.id;
    }

    const newTransaction = {
        title:
            data.title || '새 거래',

        date:
            data.date || getTodayString(),

        amount:
            Number(data.amount) || 0,

        type:
            data.type || '지출',

        categoryId,

        assetId:
            data.assetId || null,

        budgetId:
            data.budgetId || null,

        goalId:
            data.goalId || null,

        fixedExpense:
            Boolean(data.fixedExpense),

        memo:
            data.memo || ''
    };

    return Database.add(
        COLLECTION,
        newTransaction
    );
},

    /**
     * 기존 거래 내역을 업데이트합니다.
     * @param {string} id 수정할 거래 ID
     * @param {Object} data 업데이트할 항목
     * @returns {Object} 업데이트된 거래 객체
     */
    updateTransaction(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Finance Error] Transaction with id "${id}" not found.`);
        }

        const updateData = { ...data };

        // 데이터 타입 강제 변환 안전 처리
        if (updateData.amount !== undefined) {
            updateData.amount = Number(updateData.amount) || 0;
        }
        if (updateData.fixedExpense !== undefined) {
            updateData.fixedExpense = !!updateData.fixedExpense;
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 거래 내역을 삭제하고 연관된 관계를 정리합니다.
     * @param {string} id 삭제할 거래 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteTransaction(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 특정 일자(또는 오늘)의 총 지출액을 계산합니다.
     * @param {string} [dateStr] YYYY-MM-DD 형식 (생략 시 오늘)
     * @returns {number} 총 지출액
     */
    calculateDailyExpense(dateStr) {
        const targetDate = dateStr || getTodayString();
        return this.getTransactions()
            .filter(t => t.date === targetDate && t.type === '지출')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    },

    /**
     * 특정 월(또는 이번 달)의 총 지출액을 계산합니다.
     * @param {string} [monthStr] YYYY-MM 형식 (생략 시 이번 달)
     * @returns {number} 총 지출액
     */
    calculateMonthlyExpense(monthStr) {
        return this.getMonthlyTransactions(monthStr)
            .filter(t => t.type === '지출')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    },

    /**
     * 특정 월(또는 이번 달)의 총 수입액을 계산합니다.
     * @param {string} [monthStr] YYYY-MM 형식 (생략 시 이번 달)
     * @returns {number} 총 수입액
     */
    calculateMonthlyIncome(monthStr) {
        return this.getMonthlyTransactions(monthStr)
            .filter(t => t.type === '수입')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    },

    /**
     * 특정 월(또는 이번 달)의 총 저축액을 계산합니다.
     * @param {string} [monthStr] YYYY-MM 형식 (생략 시 이번 달)
     * @returns {number} 총 저축액
     */
    calculateMonthlySavings(monthStr) {
        return this.getMonthlyTransactions(monthStr)
            .filter(t => t.type === '저축')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    },

    /**
     * 특정 월(또는 이번 달)의 총 투자액을 계산합니다.
     * @param {string} [monthStr] YYYY-MM 형식 (생략 시 이번 달)
     * @returns {number} 총 투자액
     */
    calculateMonthlyInvestment(monthStr) {
        return this.getMonthlyTransactions(monthStr)
            .filter(t => t.type === '투자')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    }
};