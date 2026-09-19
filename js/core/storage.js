/**
 * MY MILITARY OS
 * Storage Module
 *
 * 책임:
 * - LocalStorage load/save
 * - Database 초기화
 * - 자동 저장
 * - JSON Export / Import
 * - 기존 storage key 마이그레이션
 */

import { Database } from './database.js';

const STORAGE_KEY = 'MY_MILITARY_OS_DB';
const LEGACY_STORAGE_KEY = 'my-military-os-store';

const getDefaultStore = () => ({
    settings: [],
    schedules: [],
    rewards: [],
    goals: [],
    studies: [],
    projects: [],
    tasks: [],
    issues: [],
    contents: [],
    transactions: [],
    assets: [],
    categories: [],
    budgets: [],
    monthlyReports: []
});

const normalizeStore = (data) => {
    const defaults = getDefaultStore();

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return defaults;
    }

    const normalized = {};

    Object.keys(defaults).forEach((collection) => {
        normalized[collection] = Array.isArray(data[collection])
            ? data[collection]
            : [];
    });

    return normalized;
};

const readRawStore = () => {
    try {
        const current = localStorage.getItem(STORAGE_KEY);

        if (current) {
            return JSON.parse(current);
        }

        // 기존 버전 데이터 마이그레이션
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);

        if (legacy) {
            const parsedLegacy = JSON.parse(legacy);

            // 새 키로 이전
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(parsedLegacy)
            );

            return parsedLegacy;
        }

        return getDefaultStore();
    } catch (error) {
        console.error('[Storage] load failed:', error);
        return getDefaultStore();
    }
};

export const Storage = {
    /**
     * 앱 시작 시 한 번 호출
     */
    init() {
        const loadedStore = this.loadStore();

        Database.replaceAll(loadedStore);

        // 이후 모든 Database 변경을 자동 저장
        Database.subscribe((store) => {
            this.saveStore(store);
        });

        // 초기 상태도 한 번 저장
        this.saveStore(Database.getAll());

        return Database.getAll();
    },

    /**
     * LocalStorage → Store
     */
    loadStore() {
        return normalizeStore(readRawStore());
    },

    /**
     * Store → LocalStorage
     */
    saveStore(storeData) {
        try {
            const normalized = normalizeStore(storeData);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(normalized)
            );

            return true;
        } catch (error) {
            console.error('[Storage] save failed:', error);
            return false;
        }
    },

    clearStore() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LEGACY_STORAGE_KEY);

            Database.replaceAll(getDefaultStore());

            return true;
        } catch (error) {
            console.error('[Storage] clear failed:', error);
            return false;
        }
    },

    createBackupFileName() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return `MY_MILITARY_OS_backup_${year}-${month}-${day}.json`;
    },

    /**
     * Store 전체 Export
     */
    exportStore(storeData = Database.getAll()) {
        try {
            const json = JSON.stringify(storeData, null, 2);

            const blob = new Blob([json], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = url;
            anchor.download = this.createBackupFileName();

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);

            return true;
        } catch (error) {
            console.error('[Storage] export failed:', error);
            return false;
        }
    },

    /**
     * 기존 app.js 호환용 API
     */
    exportToJson() {
        return this.exportStore(Database.getAll());
    },

    /**
     * JSON 문자열 → Store
     */
    importStore(jsonString) {
        const parsed = JSON.parse(jsonString);

        const normalized = normalizeStore(parsed);

        Database.replaceAll(normalized);

        return normalized;
    },

    /**
     * File 객체 → Store
     */
    async importFromJson(file) {
        if (!(file instanceof File)) {
            throw new Error('유효한 JSON 파일이 아닙니다.');
        }

        const text = await file.text();

        return this.importStore(text);
    }
};