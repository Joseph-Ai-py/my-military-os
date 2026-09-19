import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Goals Module
 * 목표 데이터를 관리하고 진행률을 계산하는 모듈입니다.
 */

const COLLECTION = 'goals';

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

export const Goals = {
    /**
     * 모든 목표 목록을 가져옵니다.
     * @returns {Array} 목표 객체 배열
     */
    getGoals() {
        return Database.get(COLLECTION);
    },

    /**
     * 진행 중이거나 대기 상태인 활성 목표만 가져옵니다.
     * @returns {Array} 활성 목표 배열
     */
    getActiveGoals() {
        const goals = this.getGoals();
        return goals.filter(goal => goal.status !== '완료' && goal.status !== '취소' && goal.status !== '보류');
    },

    /**
     * 새 목표를 생성합니다.
     * @param {Object} data 목표 데이터
     * @returns {Object} 생성된 목표 객체
     */
    createGoal(data) {
        const newGoal = {
            title: data.title || '제목 없음',
            field: data.field || '일반',
            startValue: Number(data.startValue) || 0, // DECREASE 모드 등을 위해 초기 시작값 기록
            targetValue: Number(data.targetValue) || 100,
            currentValue: Number(data.currentValue) || 0,
            unit: data.unit || '%',
            progressMode: data.progressMode || 'INCREASE', // INCREASE, DECREASE, COUNT
            startDate: data.startDate || getTodayString(),
            dueDate: data.dueDate || '',
            status: data.status || '진행중', // 대기, 진행중, 완료, 보류, 취소
            priority: data.priority || '보통', // 높음, 보통, 낮음
            nextAction: data.nextAction || '',
            
            // 다대다 연관 관계 필드 (배열로 관리)
            relatedStudyIds: Array.isArray(data.relatedStudyIds) ? data.relatedStudyIds : [],
            relatedProjectIds: Array.isArray(data.relatedProjectIds) ? data.relatedProjectIds : [],
            relatedTaskIds: Array.isArray(data.relatedTaskIds) ? data.relatedTaskIds : [],
            relatedContentIds: Array.isArray(data.relatedContentIds) ? data.relatedContentIds : [],
            relatedTransactionIds: Array.isArray(data.relatedTransactionIds) ? data.relatedTransactionIds : [],
            
            memo: data.memo || ''
        };

        return Database.add(COLLECTION, newGoal);
    },

    /**
     * 기존 목표 데이터를 업데이트합니다.
     * @param {string} id 수정할 목표 ID
     * @param {Object} data 업데이트할 항목 (일부 필드만 전달 가능)
     * @returns {Object} 업데이트된 목표 객체
     */
    updateGoal(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Goals Error] Goal with id "${id}" not found.`);
        }

        const updateData = { ...data };
        
        // 숫자 필드 타입 강제 변환 안전 처리
        if (updateData.targetValue !== undefined) updateData.targetValue = Number(updateData.targetValue);
        if (updateData.currentValue !== undefined) updateData.currentValue = Number(updateData.currentValue);
        if (updateData.startValue !== undefined) updateData.startValue = Number(updateData.startValue);

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 목표를 삭제하고 연관된 관계 외래키를 정리합니다.
     * @param {string} id 삭제할 목표 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteGoal(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            // 다른 컬렉션에서 이 목표를 참조하던 goalId 필드를 null로 정리 (Relations 모듈)
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 목표의 현재 진행률(0~100)을 계산합니다.
     * @param {Object} goal 목표 객체
     * @returns {number} 0~100 사이의 정수 진행률(%)
     */
    calculateProgress(goal) {
        const current = Number(goal.currentValue) || 0;
        const target = Number(goal.targetValue) || 0;
        const start = Number(goal.startValue) || 0;
        
        let percent = 0;

        if (goal.progressMode === 'DECREASE') {
            // DECREASE: 체중 감량, 대출 상환 등 값이 줄어들어야 진행률이 오름
            const totalDiff = start - target;
            const currentDiff = start - current;
            
            if (totalDiff === 0) {
                // 목표치와 시작치가 같게 잘못 설정된 경우 
                percent = current <= target ? 100 : 0;
            } else {
                percent = (currentDiff / totalDiff) * 100;
            }
        } else {
            // INCREASE (저축, 횟수 달성 등) 또는 COUNT (반복 횟수 등)
            if (target === 0) {
                percent = current >= 0 ? 100 : 0;
            } else {
                percent = (current / target) * 100;
            }
        }

        // 0 미만, 100 초과 방지 및 반올림
        return Math.min(Math.max(Math.round(percent), 0), 100);
    }
};