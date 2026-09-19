import { Database } from '../core/database.js';
import { Relations } from '../core/relations.js';

/**
 * MY MILITARY OS
 * Content Module
 * 콘텐츠(유튜브, 인스타그램, 블로그 등) 기획 및 성과 데이터를 관리합니다.
 */

const COLLECTION = 'contents';

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

export const Content = {
    /**
     * 모든 콘텐츠 목록을 가져옵니다.
     * @returns {Array} 콘텐츠 객체 배열
     */
    getContents() {
        return Database.get(COLLECTION);
    },

    /**
     * 최근 등록되거나 업데이트된 콘텐츠 목록을 가져옵니다.
     * @param {number} limit 반환할 최대 개수 (기본값 5)
     * @returns {Array} 정렬된 콘텐츠 배열
     */
    getRecentContents(limit = 5) {
        const contents = [...this.getContents()];
        
        // 업로드 날짜 > 기획 날짜 > 생성 순으로 내림차순 정렬
        return contents.sort((a, b) => {
            const dateA = a.uploadedDate || a.plannedDate || a.createdAt || '1970-01-01';
            const dateB = b.uploadedDate || b.plannedDate || b.createdAt || '1970-01-01';
            return dateB.localeCompare(dateA);
        }).slice(0, limit);
    },

    /**
     * 업로드 완료(또는 분석 중)인 퍼블리싱된 콘텐츠만 가져옵니다.
     * @returns {Array} 퍼블리싱된 콘텐츠 배열
     */
    getPublishedContents() {
        return this.getContents().filter(content => 
            content.status === '업로드' || content.status === '분석'
        );
    },

    /**
     * 새 콘텐츠를 생성합니다.
     * @param {Object} data 콘텐츠 데이터
     * @returns {Object} 생성된 콘텐츠 객체
     */
    createContent(data) {
        const newContent = {
            name: data.name || '제목 없음',
            status: data.status || '아이디어', // 아이디어, 기획, 제작, 업로드, 분석
            platform: data.platform || '기타', // Instagram, YouTube, TikTok, Blog, 기타
            type: data.type || '',
            idea: data.idea || '',
            plannedDate: data.plannedDate || getTodayString(),
            productionDate: data.productionDate || '',
            uploadedDate: data.uploadedDate || '',
            
            // 통계 지표 (플랫폼별 통계 계산을 위해 숫자형으로 관리)
            views: Number(data.views) || 0,
            likes: Number(data.likes) || 0,
            comments: Number(data.comments) || 0,
            saves: Number(data.saves) || 0,
            shares: Number(data.shares) || 0,
            followerGrowth: Number(data.followerGrowth) || 0,
            
            // 연관 관계 ID
            goalId: data.goalId || null,
            projectId: data.projectId || null,
            
            improvements: data.improvements || ''
        };

        return Database.add(COLLECTION, newContent);
    },

    /**
     * 기존 콘텐츠 데이터를 업데이트합니다.
     * @param {string} id 수정할 콘텐츠 ID
     * @param {Object} data 업데이트할 항목
     * @returns {Object} 업데이트된 콘텐츠 객체
     */
    updateContent(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Content Error] Content with id "${id}" not found.`);
        }

        const updateData = { ...data };

        // 통계 필드 숫자형 강제 변환 안전 처리
        const numericFields = ['views', 'likes', 'comments', 'saves', 'shares', 'followerGrowth'];
        numericFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = Number(updateData[field]) || 0;
            }
        });

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 콘텐츠를 삭제하고 연관된 관계를 정리합니다.
     * @param {string} id 삭제할 콘텐츠 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deleteContent(id) {
        const success = Database.remove(COLLECTION, id);
        if (success) {
            Relations.cleanupRelations(COLLECTION, id);
        }
        return success;
    }
};