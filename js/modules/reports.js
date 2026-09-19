import { Database } from '../core/database.js';
import { Finance } from './finance.js';
import { Study } from './study.js';
import { Tasks } from './tasks.js';
import { Content } from './content.js';
import { Rewards } from './rewards.js';

/**
 * MY MILITARY OS
 * Reports Module
 * 기존 Store 데이터를 집계하여 특정 연/월의 월간 리포트를 생성하는 순수 집계 모듈입니다. (원본 데이터 저장 안 함)
 */

export const Reports = {
    /**
     * 특정 연도와 월의 데이터를 집계하여 월간 리포트 객체를 생성합니다.
     * @param {number|string} year 연도 (예: 2026)
     * @param {number|string} month 월 (예: 5 또는 '05')
     * @returns {Object} 집계된 월간 리포트 통계 데이터
     */
    generateMonthlyReport(year, month) {
        // YYYY-MM 형식 문자열 생성
        const formattedMonth = String(month).padStart(2, '0');
        const targetYearMonth = `${year}-${formattedMonth}`;

        // 1. Finance 집계 (수입, 지출, 저축, 투자)
        const monthlyTransactions = Finance.getMonthlyTransactions(targetYearMonth);
        let income = 0;
        let expense = 0;
        let savings = 0;
        let investment = 0;

        monthlyTransactions.forEach(t => {
            const amt = Number(t.amount) || 0;
            if (t.type === '수입') income += amt;
            else if (t.type === '지출') expense += amt;
            else if (t.type === '저축') savings += amt;
            else if (t.type === '투자') investment += amt;
        });

        // 2. Study 집계 (공부 시간 - 분)
        const monthlyStudyMinutes = Study.getMonthlyStudyMinutes(targetYearMonth);

        // 3. Tasks 집계 (해당 월에 완료된 작업 수)
        const completedTasksCount = Tasks.getCompletedTasks().filter(task => {
            const completedDate = task.completedDate || '';
            return completedDate.startsWith(targetYearMonth);
        }).length;

        // 4. Content 집계 (해당 월에 업로드된 콘텐츠 수)
        const publishedContentsCount = Content.getPublishedContents().filter(content => {
            const uploadDate = content.uploadedDate || content.plannedDate || '';
            return uploadDate.startsWith(targetYearMonth);
        }).length;

        // 5. Rewards 집계 (상점, 종교, 포상, 전투휴무)
        const allRewards = Database.get('rewards');
        const monthlyRewards = allRewards.filter(reward => {
            const dateStr = reward.date || '';
            return dateStr.startsWith(targetYearMonth);
        });

        let shopPoints = 0;
        let religionCount = 0;
        let awardLeaveCount = 0;
        let combatRestCount = 0;

        monthlyRewards.forEach(reward => {
            const amt = Number(reward.amount) || 0;
            if (reward.type === '상점') shopPoints += amt;
            else if (reward.type === '종교') religionCount += amt;
            else if (reward.type === '포상휴가') awardLeaveCount += amt;
            else if (reward.type === '전투휴무') combatRestCount += amt;
        });

        // 최종 리포트 객체 반환 (원본 수정 없는 순수 집계 데이터)
        return {
            targetYearMonth,
            finance: {
                income,
                expense,
                savings,
                investment,
                netCashFlow: income - expense
            },
            study: {
                totalMinutes: monthlyStudyMinutes,
                totalHours: (monthlyStudyMinutes / 60).toFixed(1)
            },
            tasks: {
                completedCount: completedTasksCount
            },
            content: {
                publishedCount: publishedContentsCount
            },
            rewards: {
                shop: shopPoints,
                religion: religionCount,
                award: awardLeaveCount,
                combatRest: combatRestCount
            }
        };
    }
};