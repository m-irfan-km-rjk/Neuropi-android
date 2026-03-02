import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameMetrics {
    timestamp: number;
    level?: string | number;
    accuracy?: number; // 0 to 100
    timeSpent?: number; // In seconds
    score?: number;
    [key: string]: any; // Any game specific additional metrics
}

export interface GameProgress {
    gameId: string;
    history: GameMetrics[];
}

const PROGRESS_STORAGE_KEY = '@neuropi_game_progress';

export const saveGameProgress = async (gameId: string, metrics: Omit<GameMetrics, 'timestamp'>) => {
    try {
        if (!AsyncStorage) {
            console.warn("AsyncStorage native module is null or missing. Progress not saved.");
            return;
        }

        const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        let progressData: Record<string, GameProgress> = stored ? JSON.parse(stored) : {};

        if (!progressData[gameId]) {
            progressData[gameId] = { gameId, history: [] };
        }

        const fullMetrics: GameMetrics = {
            ...metrics,
            timestamp: Date.now()
        };

        progressData[gameId].history.push(fullMetrics);

        await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressData));
        console.log(`Saved progress for ${gameId}:`, fullMetrics);
    } catch (e: any) {
        if (e.message?.includes('Native module is null')) {
            console.warn(`[Storage] Skipping progress save for ${gameId}: Native module missing. Ensure you run 'npx expo run:android'.`);
            return;
        }
        console.error(`Error saving game progress for ${gameId}:`, e);
    }
};

export const getGameProgress = async (gameId: string): Promise<GameMetrics[]> => {
    try {
        if (!AsyncStorage) return [];

        const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
            const progressData: Record<string, GameProgress> = JSON.parse(stored);
            return progressData[gameId]?.history || [];
        }
    } catch (e: any) {
        if (e.message?.includes('Native module is null')) return [];
        console.error(`Error getting game progress for ${gameId}:`, e);
    }
    return [];
};

export const getAllGameProgress = async (): Promise<Record<string, GameProgress>> => {
    try {
        if (!AsyncStorage) return {};

        const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e: any) {
        if (e.message?.includes('Native module is null')) return {};
        console.error("Error getting all game progress. Please ensure you are running a custom dev build: npx expo run:android", e);
    }
    return {};
};
