import { Database } from './database.js';

/**
 * MY MILITARY OS
 * Core Relations Module
 * 엔티티 간의 관계(Foreign Keys)를 관리하고, 부모 레코드 삭제 시 고아 참조(Orphan Reference)를 방지합니다.
 */

// 부모 컬렉션과 자식들이 참조하는 외래 키(Foreign Key) 매핑
const RELATION_MAP = {
    projects: 'projectId',
    goals: 'goalId',
    schedules: 'scheduleId',
    tasks: 'taskId',
    assets: 'assetId',
    categories: 'categoryId',
    budgets: 'budgetId'
};

export const Relations = {
    /**
     * 특정 관계 ID를 가지고 있는 관련된 레코드 목록을 반환합니다.
     * @param {string} collection 조회할 자식 컬렉션 이름 (예: 'tasks')
     * @param {string} relationField 관계 필드 이름 (예: 'projectId')
     * @param {string} relationId 관계 ID
     * @returns {Array} 관련된 레코드 배열
     */
    getRelated(collection, relationField, relationId) {
        if (!relationId) return [];
        const records = Database.get(collection);
        return records.filter(record => record[relationField] === relationId);
    },

    /**
     * 참조하고 있는 부모 레코드의 이름이나 제목을 반환합니다. UI 표시에 유용합니다.
     * @param {string} parentCollection 부모 컬렉션 이름 (예: 'projects')
     * @param {string} parentId 부모 레코드 ID
     * @returns {string|null} 부모 레코드의 제목/이름 또는 null
     */
    getRelationName(parentCollection, parentId) {
        if (!parentId) return null;
        
        const record = Database.find(parentCollection, parentId);
        if (!record) return null;
        
        // 대부분의 엔티티는 title 또는 name 속성을 가집니다.
        return record.title || record.name || '알 수 없음';
    },

    /**
     * 특정 레코드에 관계 ID를 설정합니다.
     * @param {string} collection 업데이트할 레코드의 컬렉션
     * @param {string} id 업데이트할 레코드 ID
     * @param {string} relationField 설정할 관계 필드 (예: 'projectId')
     * @param {string} relationId 부모 레코드 ID
     */
    setRelation(collection, id, relationField, relationId) {
        Database.update(collection, id, { [relationField]: relationId });
    },

    /**
     * 특정 레코드의 관계 ID를 해제(null)합니다.
     * @param {string} collection 업데이트할 레코드의 컬렉션
     * @param {string} id 업데이트할 레코드 ID
     * @param {string} relationField 해제할 관계 필드 (예: 'projectId')
     */
    clearRelation(collection, id, relationField) {
        Database.update(collection, id, { [relationField]: null });
    },

    /**
     * 부모 레코드가 삭제될 때, 이를 참조하는 모든 자식 레코드의 관계 필드를 null로 초기화합니다.
     * @param {string} parentCollection 삭제된 부모의 컬렉션 (예: 'projects')
     * @param {string} parentId 삭제된 부모의 ID
     */
    cleanupRelations(parentCollection, parentId) {
        if (!parentId) return;
        
        const relationField = RELATION_MAP[parentCollection];
        if (!relationField) return; // 관리 대상 관계가 아닌 경우 종료

        const store = Database.getAll();
        
        // 모든 컬렉션을 순회하며 삭제된 부모를 참조하는 필드가 있는지 확인
        Object.keys(store).forEach(childCollection => {
            // 설정(settings) 등은 관계를 가지지 않으므로 건너뜀
            if (childCollection === 'settings') return;

            const records = store[childCollection];
            records.forEach(record => {
                if (record[relationField] === parentId) {
                    this.clearRelation(childCollection, record.id, relationField);
                }
            });
        });
    },

    /**
     * 이미 삭제된 부모 ID를 여전히 참조하고 있는 고아 릴레이션(Orphan Relations)을 찾습니다.
     * 스토리지 마이그레이션이나 무결성 검사에 사용됩니다.
     * @returns {Array} 끊어진 참조를 가진 레코드 정보 배열
     */
    findOrphanedRelations() {
        const orphans = [];
        const store = Database.getAll();

        Object.keys(store).forEach(childCollection => {
            if (childCollection === 'settings') return;

            const records = store[childCollection];
            records.forEach(record => {
                // RELATION_MAP에 정의된 모든 관계 필드 검사
                Object.entries(RELATION_MAP).forEach(([parentCollection, relationField]) => {
                    const parentId = record[relationField];
                    
                    if (parentId) {
                        const parentExists = Database.find(parentCollection, parentId);
                        if (!parentExists) {
                            orphans.push({
                                collection: childCollection,
                                recordId: record.id,
                                invalidField: relationField,
                                invalidId: parentId
                            });
                        }
                    }
                });
            });
        });

        return orphans;
    }
};