import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Study Module
 * 학습 기록(공부, 오답, 요약 등) 데이터를 관리하고 통계를 제공합니다.
 */

const COLLECTION = 'studies';

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

export const Study = {
    /**
     * 모든 학습 기록을 가져옵니다.
     * @returns {Array} 학습 기록 배열
     */
    getStudies() {
        return Database.get(COLLECTION);
    },

    /**
     * 새 학습 기록을 생성합니다.
     * @param {Object} data 학습 기록 데이터
     * @returns {Object} 생성된 학습 객체
     */
    createStudy(data) {
        const newStudy = {
            title: data.title || '제목 없음',
            date: data.date || getTodayString(),
            type: data.type || '공부', // 공부, 오답, 요약, 필사, 지식
            field: data.field || '기타', // 영어, 일본어, 정보처리기사, SQL, AI, Python, Java, 웹, 기타
            studyMinutes: Number(data.studyMinutes) || 0,
            content: data.content || '',
            reviewDate: data.reviewDate || '',
            status: data.status || '완료',
            goalId: data.goalId || null,
            projectId: data.projectId || null,
            memo: data.memo || ''
        };

        return Database.add(COLLECTION, newStudy);
    },

    /**
     * 기존 학습 기록을 업데이트합니다.
     * @param {string} id 수정할 학습 기록 ID
     * @param {Object} data 업데이트할 데이터
     * @returns {Object} 업데이트된 학습 객체
     */
    updateStudy(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Study Error] Study record with id "${id}" not found.`);
        }

        const updateData = { ...data };
        
        // 숫자형 데이터 강제 변환
        if (updateData.studyMinutes !== undefined) {
            updateData.studyMinutes = Number(updateData.studyMinutes) || 0;
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 학습 기록을 삭제합니다.
     * @param {string} id 삭제할 학습 기록 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteStudy(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 오늘 공부한 총 시간(분)을 계산합니다.
     * @returns {number} 총 공부 시간 (분)
     */
    getTodayStudyMinutes() {
        const todayStr = getTodayString();
        const studies = this.getStudies();
        
        return studies
            .filter(study => study.date === todayStr)
            .reduce((total, study) => total + (Number(study.studyMinutes) || 0), 0);
    },

    /**
     * 특정 월(또는 이번 달)의 총 공부 시간(분)을 계산합니다.
     * @param {string} [monthStr] YYYY-MM 형식의 문자열 (생략 시 이번 달)
     * @returns {number} 총 공부 시간 (분)
     */
    getMonthlyStudyMinutes(monthStr) {
        const targetMonth = monthStr || getCurrentMonthString();
        const studies = this.getStudies();
        
        return studies
            .filter(study => study.date && study.date.startsWith(targetMonth))
            .reduce((total, study) => total + (Number(study.studyMinutes) || 0), 0);
    }
};