import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Issues Module
 * 프로젝트의 이슈(버그, 개선, 기능 등)를 관리하는 모듈입니다.
 */

const COLLECTION = 'issues';

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

export const Issues = {
    /**
     * 모든 이슈 목록을 가져옵니다.
     * @returns {Array} 이슈 객체 배열
     */
    getIssues() {
        return Database.get(COLLECTION);
    },

    /**
     * 특정 프로젝트에 속한 이슈 목록만 필터링하여 가져옵니다.
     * @param {string} projectId 프로젝트 ID
     * @returns {Array} 필터링된 이슈 배열
     */
    getProjectIssues(projectId) {
        if (!projectId) return [];
        return this.getIssues().filter(issue => issue.projectId === projectId);
    },

    /**
     * 새 이슈를 생성합니다.
     * @param {Object} data 이슈 데이터
     * @returns {Object} 생성된 이슈 객체
     */
    createIssue(data) {
        const newIssue = {
            title: data.title || '새 이슈',
            type: data.type || '버그', // 버그, 개선, 기능, UI, 성능
            severity: data.severity || 'Medium', // Critical, High, Medium, Low
            status: data.status || '열림', // 열림, 진행중, 해결됨, 닫힘
            foundDate: data.foundDate || getTodayString(),
            resolvedDate: data.resolvedDate || '',
            
            // 연관 관계 ID
            projectId: data.projectId || null,
            taskId: data.taskId || null,
            
            description: data.description || '',
            solution: data.solution || ''
        };

        return Database.add(COLLECTION, newIssue);
    },

    /**
     * 기존 이슈를 업데이트합니다.
     * @param {string} id 수정할 이슈 ID
     * @param {Object} data 업데이트할 항목
     * @returns {Object} 업데이트된 이슈 객체
     */
    updateIssue(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Issues Error] Issue with id "${id}" not found.`);
        }

        return Database.update(COLLECTION, id, data);
    },

    /**
     * 이슈를 삭제하고 연관된 관계를 정리합니다.
     * @param {string} id 삭제할 이슈 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteIssue(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 이슈를 해결됨(Resolved) 상태로 처리합니다.
     * @param {string} id 해결할 이슈 ID
     * @param {string} [solution] 해결 방법 내용
     * @returns {Object} 업데이트된 이슈 객체
     */
    resolveIssue(id, solution = '') {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Issues Error] Issue with id "${id}" not found.`);
        }

        const updateData = {
            status: '해결됨',
            resolvedDate: getTodayString()
        };

        if (solution) {
            updateData.solution = solution;
        }

        return this.updateIssue(id, updateData);
    }
};