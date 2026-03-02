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
    } catch (e) {
        console.error("Error saving game progress:", e);
    }
};

export const getGameProgress = async (gameId: string): Promise<GameMetrics[]> => {
    try {
        const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
            const progressData: Record<string, GameProgress> = JSON.parse(stored);
            return progressData[gameId]?.history || [];
        }
    } catch (e) {
        console.error("Error getting game progress:", e);
    }
    return [];
};

export const getAllGameProgress = async (): Promise<Record<string, GameProgress>> => {
    try {
        const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error getting all game progress:", e);
    }
    return {};
};
