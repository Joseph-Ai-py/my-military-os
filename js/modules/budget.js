import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Budget Module
 * 예산 데이터를 관리하고, 실제 지출액은 거래(transactions) 데이터를 기반으로 동적으로 계산합니다.
 */

const COLLECTION = 'budgets';

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

export const Budget = {
    /**
     * 모든 예산 목록을 가져옵니다.
     * @returns {Array} 예산 객체 배열
     */
    getBudgets() {
        return Database.get(COLLECTION);
    },

    /**
     * 새 예산을 생성합니다.
     * @param {Object} data 예산 데이터
     * @returns {Object} 생성된 예산 객체
     */
    createBudget(data) {
        const newBudget = {
            name: data.name || '새 예산',
            month: data.month || getCurrentMonthString(),
            categoryId: data.categoryId || null,
            budgetAmount: Number(data.budgetAmount) || 0
        };

        return Database.add(COLLECTION, newBudget);
    },

    /**
     * 기존 예산을 업데이트합니다.
     * @param {string} id 수정할 예산 ID
     * @param {Object} data 업데이트할 항목
     * @returns {Object} 업데이트된 예산 객체
     */
    updateBudget(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Budget Error] Budget with id "${id}" not found.`);
        }

        const updateData = { ...data };

        if (updateData.budgetAmount !== undefined) {
            updateData.budgetAmount = Number(updateData.budgetAmount) || 0;
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 예산을 삭제하고 연관된 관계를 정리합니다.
     * @param {string} id 삭제할 예산 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteBudget(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 특정 예산의 실제 지출액, 사용률, 상태를 동적으로 계산합니다.
     * @param {string} id 예산 ID
     * @returns {Object} { actualSpent, usageRate, status }
     */
    calculateBudgetUsage(id) {
        const budget = Database.find(COLLECTION, id);
        if (!budget) {
            return { actualSpent: 0, usageRate: 0, status: '알 수 없음' };
        }

        const transactions = Database.get('transactions');
        
        // 해당 월의 지출 내역을 필터링하여 실제 사용액 합산
        const actualSpent = transactions
            .filter(t => t.type === '지출')
            .filter(t => t.date && t.date.startsWith(budget.month))
            .filter(t => {
                // 1. 거래 내역에 명시적으로 예산 ID가 매핑된 경우
                if (t.budgetId === budget.id) return true;
                // 2. 카테고리 예산인 경우, 거래 내역의 카테고리와 일치하는지 확인
                if (budget.categoryId && t.categoryId === budget.categoryId) return true;
                // 3. 카테고리가 지정되지 않은 예산은 해당 월의 전체 지출 예산으로 취급
                if (!budget.categoryId && !t.budgetId) return true;
                
                return false;
            })
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const budgetAmount = Number(budget.budgetAmount) || 0;
        let rawUsageRate = 0;

        if (budgetAmount > 0) {
            rawUsageRate = (actualSpent / budgetAmount) * 100;
        } else if (actualSpent > 0) {
            rawUsageRate = 100; // 예산이 0인데 지출이 있는 경우
        }

        // 상태 판별
        let status = '안전';
        if (rawUsageRate >= 100) {
            status = '초과';
        } else if (rawUsageRate >= 80) {
            status = '주의';
        }

        return {
            actualSpent,
            usageRate: Math.min(Math.round(rawUsageRate), 100), // UI 표시를 위해 100%로 제한 (초과 여부는 status로 확인)
            status
        };
    },

    /**
     * 예산의 잔여액을 계산합니다.
     * @param {string} id 예산 ID
     * @returns {number} 잔여 예산액
     */
    calculateBudgetRemaining(id) {
        const budget = Database.find(COLLECTION, id);
        if (!budget) return 0;

        const { actualSpent } = this.calculateBudgetUsage(id);
        const budgetAmount = Number(budget.budgetAmount) || 0;
        
        return budgetAmount - actualSpent;
    }
};