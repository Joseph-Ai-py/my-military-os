import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Schedule Module
 * 일정 데이터 계층을 담당합니다. (UI 의존성 없음)
 */

const COLLECTION = 'schedules';

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다. (로컬 타임존 기준)
 * @returns {string}
 */
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ScheduleModule = {
    /**
     * 모든 일정을 가져옵니다.
     * @returns {Array} 일정 배열
     */
    getSchedules() {
        return Database.get(COLLECTION);
    },

    /**
     * 특정 유형의 일정만 가져옵니다.
     * @param {string} type (예: '휴가 출발', '당직' 등)
     * @returns {Array} 필터링된 일정 배열
     */
    getSchedulesByType(type) {
        return this.getSchedules().filter(schedule => schedule.type === type);
    },

    /**
     * 오늘 날짜에 해당하는 일정을 가져옵니다. (기간 일정 포함)
     * @returns {Array} 오늘의 일정 배열
     */
    getTodaySchedules() {
        const todayStr = getTodayString();
        
        return this.getSchedules().filter(schedule => {
            if (!schedule.startDate) return false;
            
            const start = schedule.startDate;
            const end = schedule.endDate || start; // 종료일이 없으면 시작일과 동일하게 취급
            
            return todayStr >= start && todayStr <= end;
        });
    },

    /**
     * 새 일정을 생성합니다.
     * @param {Object} data 일정 데이터
     * @returns {Object} 생성된 일정 객체
     */
    createSchedule(data) {
        const newSchedule = {
            title: data.title || '제목 없음',
            startDate: data.startDate || getTodayString(),
            endDate: data.endDate || '',
            type: data.type || '기타',
            trainingSize: data.trainingSize || '',
            status: data.status || '대기',
            place: data.place || '',
            importance: data.importance || '보통',
            relatedRewardId: data.relatedRewardId || null,
            relatedGoalId: data.relatedGoalId || null,
            relatedProjectId: data.relatedProjectId || null,
            memo: data.memo || ''
        };

        return Database.add(COLLECTION, newSchedule);
    },

    /**
     * 기존 일정을 업데이트합니다.
     * @param {string} id 일정 ID
     * @param {Object} data 업데이트할 데이터
     * @returns {Object} 업데이트된 일정 객체
     */
    updateSchedule(id, data) {
        // 기존 데이터를 찾고, 전달된 필드만 병합(덮어쓰기)하도록 처리
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Schedule Error] Schedule with id "${id}" not found.`);
        }
        
        return Database.update(COLLECTION, id, data);
    },

    /**
     * 일정을 삭제하고 관련 참조를 정리합니다.
     * @param {string} id 일정 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteSchedule(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            // 이 일정을 참조하고 있는 자식 데이터들의 외래키를 null로 초기화
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    }
};