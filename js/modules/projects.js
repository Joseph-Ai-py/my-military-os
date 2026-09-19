import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Projects Module
 * 프로젝트의 생명주기와 관련된 데이터를 관리합니다.
 */

const COLLECTION = 'projects';

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

export const Projects = {
    /**
     * 모든 프로젝트 목록을 가져옵니다.
     * @returns {Array} 프로젝트 객체 배열
     */
    getProjects() {
        return Database.get(COLLECTION);
    },

    /**
     * 진행 중이거나 활성화된 프로젝트 목록을 가져옵니다.
     * (보류, 완료, 중단 상태 제외)
     * @returns {Array} 활성 프로젝트 객체 배열
     */
    getActiveProjects() {
        const activeStatuses = ['아이디어', '개발중', '배포'];
        return this.getProjects().filter(project => activeStatuses.includes(project.status));
    },

    /**
     * 새 프로젝트를 생성합니다.
     * @param {Object} data 프로젝트 데이터
     * @returns {Object} 생성된 프로젝트 객체
     */
    createProject(data) {
        const newProject = {
            name: data.name || '새 프로젝트',
            status: data.status || '아이디어', // 아이디어, 개발중, 보류, 배포, 완료, 중단
            progress: Number(data.progress) || 0,
            startDate: data.startDate || getTodayString(),
            dueDate: data.dueDate || '',
            priority: data.priority || '보통', // 높음, 보통, 낮음
            description: data.description || '',
            githubUrl: data.githubUrl || '',
            deployUrl: data.deployUrl || '',
            
            // 연관 관계 ID
            goalId: data.goalId || null,
            taskIds: Array.isArray(data.taskIds) ? data.taskIds : [],
            issueIds: Array.isArray(data.issueIds) ? data.issueIds : [],
            studyIds: Array.isArray(data.studyIds) ? data.studyIds : [],
            contentIds: Array.isArray(data.contentIds) ? data.contentIds : [],
            
            memo: data.memo || ''
        };

        return Database.add(COLLECTION, newProject);
    },

    /**
     * 기존 프로젝트를 업데이트합니다.
     * @param {string} id 수정할 프로젝트 ID
     * @param {Object} data 업데이트할 항목
     * @returns {Object} 업데이트된 프로젝트 객체
     */
    updateProject(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Projects Error] Project with id "${id}" not found.`);
        }

        const updateData = { ...data };

        // 숫자 타입 강제 변환 안전 처리
        if (updateData.progress !== undefined) {
            updateData.progress = Math.min(Math.max(Number(updateData.progress) || 0, 0), 100);
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 프로젝트를 삭제하고 연관된 관계 외래키를 정리합니다.
     * @param {string} id 삭제할 프로젝트 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteProject(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            // Relations 모듈을 통해 이 프로젝트를 참조하는 task, issue 등의 projectId를 null로 정리
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 연관된 작업(Tasks)의 완료 비율을 바탕으로 프로젝트 진행률을 동적으로 계산하고 업데이트합니다.
     * @param {string} id 프로젝트 ID
     * @returns {number} 계산된 진행률 (0~100)
     */
    calculateProjectProgress(id) {
        const project = Database.find(COLLECTION, id);
        if (!project) return 0;

        // Relations 모듈을 사용하여 이 프로젝트를 참조하는 모든 task를 가져옵니다.
        const relatedTasks = Relations.getRelated('tasks', 'projectId', id);
        
        // 연결된 작업이 없으면 기존 진행률 유지
        if (relatedTasks.length === 0) {
            return project.progress || 0;
        }

        const completedTasks = relatedTasks.filter(task => task.status === '완료').length;
        const totalTasks = relatedTasks.length;
        
        const calculatedProgress = Math.round((completedTasks / totalTasks) * 100);
        
        // 계산된 진행률이 기존과 다르면 업데이트
        if (calculatedProgress !== project.progress) {
            this.updateProject(id, { progress: calculatedProgress });
        }

        return calculatedProgress;
    }
};