import { Database } from '../core/database.js';
import { Settings } from '../core/settings.js';

/**
 * MY MILITARY OS
 * Rewards Module
 * 보상(상점, 종교, 포상휴가, 전투휴무 등) 데이터와 휴가 환산 로직을 담당합니다.
 */

const COLLECTION = 'rewards';

export const Rewards = {
    /**
     * 새 보상 기록을 생성합니다.
     * @param {Object} data 보상 데이터 { type, amount, date, memo }
     * @returns {Object} 생성된 레코드
     */
    createReward(data) {
        const newReward = {
            type: data.type || '기타',
            amount: Number(data.amount) || 0,
            date: data.date || new Date().toISOString().split('T')[0],
            memo: data.memo || ''
        };
        return Database.add(COLLECTION, newReward);
    },

    /**
     * 기존 보상 기록을 업데이트합니다.
     * @param {string} id 
     * @param {Object} data 
     * @returns {Object}
     */
    updateReward(id, data) {
        const existing = Database.find(COLLECTION, id);
        if (!existing) {
            throw new Error(`[Rewards Error] Reward with id "${id}" not found.`);
        }
        
        // amount가 전달되었으면 숫자로 변환
        const updateData = { ...data };
        if (updateData.amount !== undefined) {
            updateData.amount = Number(updateData.amount) || 0;
        }

        return Database.update(COLLECTION, id, updateData);
    },

    /**
     * 보상 기록을 삭제합니다.
     * @param {string} id 
     * @returns {boolean}
     */
    deleteReward(id) {
        return Database.remove(COLLECTION, id);
    },

    /**
     * 모든 보상 기록을 유형별로 합산하여 요약 객체를 반환합니다.
     * @returns {Object} 유형별 총합
     */
    getRewardSummary() {
        const rewards = Database.get(COLLECTION);
        const summary = {
            '상점': 0,
            '종교': 0,
            '포상휴가': 0,
            '시간외': 0,
            '훈련': 0,
            '전투휴무': 0,
            '기타': 0
        };

        rewards.forEach(reward => {
            const type = reward.type;
            const amount = Number(reward.amount) || 0;
            
            if (summary[type] !== undefined) {
                summary[type] += amount;
            } else {
                summary[type] = amount;
            }
        });

        return summary;
    },

    /**
     * 상점을 포상휴가일수로 환산합니다. (Settings 기준 적용)
     * @param {number} totalShop 총 상점
     * @returns {Object} { total: 총상점, days: 환산된휴가일수, remainder: 잔여상점 }
     */
    calculateShopLeave(totalShop) {
        // 기본 50
        const rate = Math.max(1, Settings.getNumericSetting('meritExchangeRate')); 
        const days = Math.floor(totalShop / rate);
        const remainder = totalShop % rate;
        
        return { total: totalShop, days, remainder };
    },

    /**
     * 종교 참석 횟수를 포상휴가일수로 환산합니다. (Settings 기준 적용)
     * @param {number} totalReligion 총 종교참석
     * @returns {Object} { total: 총참석횟수, days: 환산된휴가일수, remainder: 잔여횟수 }
     */
    calculateReligionLeave(totalReligion) {
        // 기본 20
        const rate = Math.max(1, Settings.getNumericSetting('religionExchangeRate'));
        const days = Math.floor(totalReligion / rate);
        const remainder = totalReligion % rate;
        
        return { total: totalReligion, days, remainder };
    },

    /**
     * 총 획득한 포상휴가 일수를 계산하고 최대치 초과분을 분리합니다. (Settings 기준 적용)
     * @param {number} totalAward 총 포상휴가 (직접획득 + 환산분 합산)
     * @returns {Object} { total: 총포상, days: 실제사용가능포상, excess: 전투휴무전환분 }
     */
    calculateAwardLeave(totalAward) {
        // 기본 16
        const max = Settings.getNumericSetting('maxRewardVacation');
        const days = Math.min(totalAward, max);
        const excess = Math.max(0, totalAward - max);
        
        return { total: totalAward, days, excess };
    },

    /**
     * 초과 포상, 시간외 근무, 훈련 등을 모두 종합하여 전투휴무를 계산합니다.
     * @param {number} excessAward 포상휴가 초과분 (일 단위)
     * @param {number} totalOvertime 시간외 근무 총합 (시간 단위)
     * @param {number} totalTraining 훈련 총합 (회/시간 등 단위)
     * @param {number} directCombatRest 직접 부여받은 전투휴무 (일 단위)
     * @returns {Object} 전투휴무 상세 계산 내역
     */
    calculateCombatRest(excessAward, totalOvertime, totalTraining, directCombatRest) {
        const overtimeRate = Settings.getNumericSetting('overtimeToRestRate');
        const trainingRate = Settings.getNumericSetting('trainingToRestRate');

        let overtimeDays = 0;
        let overtimeRemainder = 0;
        if (overtimeRate > 0) {
            overtimeDays = Math.floor(totalOvertime / overtimeRate);
            overtimeRemainder = totalOvertime % overtimeRate;
        }

        let trainingDays = 0;
        let trainingRemainder = 0;
        if (trainingRate > 0) {
            trainingDays = Math.floor(totalTraining / trainingRate);
            trainingRemainder = totalTraining % trainingRate;
        }

        const totalDays = excessAward + overtimeDays + trainingDays + directCombatRest;

        return {
            totalDays,
            details: {
                excessAward,
                overtime: { total: totalOvertime, days: overtimeDays, remainder: overtimeRemainder },
                training: { total: totalTraining, days: trainingDays, remainder: trainingRemainder },
                direct: directCombatRest
            }
        };
    },

    /**
     * 모든 보상 데이터를 읽어와 사용 가능한 전체 군 자산(휴가/전투휴무 등)을 계산합니다.
     * @returns {Object} 종합 계산 결과
     */
    calculateMilitaryAssets() {
        const summary = this.getRewardSummary();

        // 1. 상점 환산
        const shopLeave = this.calculateShopLeave(summary['상점'] || 0);
        
        // 2. 종교 환산
        const religionLeave = this.calculateReligionLeave(summary['종교'] || 0);
        
        // 3. 포상휴가 종합 (직접 획득 + 상점 환산 + 종교 환산)
        const rawAwardDays = (summary['포상휴가'] || 0) + shopLeave.days + religionLeave.days;
        const awardLeave = this.calculateAwardLeave(rawAwardDays);
        
        // 4. 전투휴무 종합 (초과 포상 + 시간외 + 훈련 + 직접 획득)
        const combatRest = this.calculateCombatRest(
            awardLeave.excess,
            summary['시간외'] || 0,
            summary['훈련'] || 0,
            summary['전투휴무'] || 0
        );

        return {
            shop: shopLeave,
            religion: religionLeave,
            award: awardLeave,
            combatRest: combatRest,
            totalAvailableDays: awardLeave.days + combatRest.totalDays // 최종 사용 가능한 총 휴식/휴가일
        };
    }
};