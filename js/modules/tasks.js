import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Tasks Module
 * 작업(Task) 관리 및 상태(Inbox 등)를 처리하는 모듈입니다.
 */

const COLLECTION = 'tasks';

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

export const Tasks = {
    /**
     * 모든 작업 목록을 가져옵니다.
     * @returns {Array} 작업 객체 배열
     */
    getTasks() {
        return Database.get(COLLECTION);
    },

    /**
     * Inbox 상태인 작업 목록을 가져옵니다.
     * @returns {Array} Inbox 작업 배열
     */
    getInboxTasks() {
        return this.getTasks().filter(task => task.status === 'Inbox');
    },

    /**
     * 마감일이 오늘이거나, 오늘 해야 할 진행 중인 작업 목록을 가져옵니다.
     * @returns {Array} 오늘의 작업 배열
     */
    getTodayTasks() {
        const todayStr = getTodayString();
        return this.getTasks().filter(task => {
            // 완료된 작업은 제외
            if (task.status === '완료') return false;
            // 마감일이 오늘인 경우
            return task.dueDate === todayStr;
        });
    },

    /**
     * 완료된 작업 목록을 가져옵니다.
     * @returns {Array} 완료된 작업 배열
     */
    getCompletedTasks() {
        return this.getTasks().filter(task => task.status === '완료');
    },

    /**
     * 새 작업을 생성합니다.
     * @param {Object} data 작업 데이터
     * @returns {Object} 생성된 작업 객체
     */
    createTask(data) {
        const newTask = {
            title: data.title || '새 작업',
            status: data.status || 'Inbox', // Inbox, 예정, 진행중, 대기, 완료
            priority: data.priority || '보통', // 높음, 보통, 낮음
            dueDate: data.dueDate || '',
            estimatedMinutes: Number(data.estimatedMinutes) || 0,
            completedDate: data.completedDate || '',
            
            // 연관 관계 ID
            projectId: data.projectId || null,
            goalId: data.goalId || null,
            scheduleId: data.scheduleId || null,
            
            memo: data.memo || ''
        };

        return Database.add(COLLECTION, newTask);
    },

    /**
     * 기존 작업을 업데이트합니다.
     * @param {string} id 수정할 작업 ID
     * @param {Object} data 업데이트할 항목
     * @returns {Object} 업데이트된 작업 객체
     */
    updateTask(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Tasks Error] Task with id "${id}" not found.`);
        }

        const updateData = { ...data };

        // 예상 시간(분)이 포함된 경우 숫자형으로 강제 변환
        if (updateData.estimatedMinutes !== undefined) {
            updateData.estimatedMinutes = Number(updateData.estimatedMinutes) || 0;
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 작업을 삭제하고 연관된 관계를 정리합니다.
     * @param {string} id 삭제할 작업 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteTask(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    },

    /**
     * 작업을 완료 처리합니다.
     * @param {string} id 완료할 작업 ID
     * @returns {Object} 업데이트된 작업 객체
     */
    completeTask(id) {
        return this.updateTask(id, {
            status: '완료',
            completedDate: getTodayString()
        });
    }
};