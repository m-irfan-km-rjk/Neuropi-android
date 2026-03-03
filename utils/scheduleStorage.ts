import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScheduleEvent {
    id: string;
    title: string;
    icon: string;
    startTime: string; // HH:MM (24-hour)
    endTime: string;   // HH:MM (24-hour)
}

const SCHEDULE_STORAGE_KEY = '@neuropi_schedule_events';

export const saveSchedule = async (events: ScheduleEvent[]) => {
    try {
        if (!AsyncStorage) return;
        await AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
        console.error("Failed to save schedule events:", e);
    }
}

export const getSchedule = async (): Promise<ScheduleEvent[]> => {
    try {
        if (!AsyncStorage) {
            console.warn("AsyncStorage unavaliable");
            return [];
        }

        const stored = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e: any) {
        if (e.message?.includes('Native module is null')) return [];
        console.error("Error retrieving schedule:", e);
    }
    return [];
}
