import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScheduleEvent, getSchedule } from '../utils/scheduleStorage';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const DashboardCard = ({ title, icon, bgColor, titleColor, onPress }: any) => (
    <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: bgColor }]} onPress={onPress}>
        {icon}
        <Text style={[styles.cardTitle, { color: titleColor }]}>{title}</Text>
    </TouchableOpacity>
);

export default function DashboardScreen() {
    const router = useRouter();

    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [nowTask, setNowTask] = useState<ScheduleEvent | null>(null);
    const [nextTask, setNextTask] = useState<ScheduleEvent | null>(null);

    const parseHM = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        return parseInt(h) * 60 + parseInt(m);
    };

    const loadScheduleAndUpdateTasks = async () => {
        const events = await getSchedule();
        const d = new Date();
        const currentM = d.getHours() * 60 + d.getMinutes();

        let currentActiveTask: ScheduleEvent | null = null;
        let upcomingTask: ScheduleEvent | null = null;

        for (const ev of events) {
            const startM = parseHM(ev.startTime);
            const endM = parseHM(ev.endTime);

            if (startM <= currentM && currentM <= endM) {
                currentActiveTask = ev;
            } else if (startM > currentM) {
                // Assuming events are sorted, the first one in the future is the next task
                if (!upcomingTask || startM < parseHM(upcomingTask.startTime)) {
                    upcomingTask = ev;
                }
            }
        }

        setNowTask(currentActiveTask);
        setNextTask(upcomingTask);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadScheduleAndUpdateTasks();
        }, [])
    );

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
        };
        updateTime();
        const interval = setInterval(() => {
            updateTime();
            // Re-evaluate NOW/NEXT every minute
            if (new Date().getSeconds() === 0) {
                loadScheduleAndUpdateTasks();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            {/* Header: Time and Admin */}
            <View style={styles.header}>
                <View style={styles.timeDateContainer}>
                    <Text style={styles.clockLabel}>{time}</Text>
                    <Text style={styles.dateLabel}>{date}</Text>
                </View>
                <TouchableOpacity style={styles.settingsButton} onPress={() => router.replace('/progress' as any)}>
                    <Ionicons name="settings-sharp" size={isTablet ? 40 : 28} color="#555" />
                </TouchableOpacity>
            </View>

            {/* Main: Now & Next */}
            <View style={styles.nowNextContainer}>
                <View style={[styles.nowNextCard, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}>
                    <Text style={[styles.cardHeaderLabel, { color: '#2E7D32' }]}>NOW</Text>
                    {nowTask ? (
                        <>
                            <Text style={{ fontSize: isTablet ? 80 : 45 }}>{nowTask.icon}</Text>
                            <Text style={styles.largeTitle} numberOfLines={1}>{nowTask.title}</Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="location-on" size={isTablet ? 80 : 45} color="#2E7D32" />
                            </View>
                            <Text style={styles.largeTitle}>Free Time</Text>
                        </>
                    )}
                </View>

                <View style={[styles.nowNextCard, { backgroundColor: '#E3F2FD', borderColor: '#64B5F6' }]}>
                    <Text style={[styles.cardHeaderLabel, { color: '#1565C0' }]}>NEXT</Text>
                    {nextTask ? (
                        <>
                            <Text style={{ fontSize: isTablet ? 80 : 45 }}>{nextTask.icon}</Text>
                            <Text style={styles.largeTitle} numberOfLines={1}>{nextTask.title}</Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="arrow-forward" size={isTablet ? 80 : 45} color="#1565C0" />
                            </View>
                            <Text style={styles.largeTitle}>All Done!</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Navigation Bar */}
            <View style={styles.navBar}>
                <DashboardCard
                    title="Talk"
                    icon={<Ionicons name="chatbubbles" size={isTablet ? 60 : 36} color="#F57F17" />}
                    bgColor="#FFF9C4"
                    titleColor="#F57F17"
                    onPress={() => router.replace('/aac' as any)}
                />
                <DashboardCard
                    title="Schedule"
                    icon={<Ionicons name="calendar-sharp" size={isTablet ? 60 : 36} color="#7B1FA2" />}
                    bgColor="#F3E5F5"
                    titleColor="#7B1FA2"
                    onPress={() => router.replace('/scheduler' as any)}
                />
                <DashboardCard
                    title="Games"
                    icon={<Ionicons name="game-controller" size={isTablet ? 60 : 36} color="#558B2F" />}
                    bgColor="#DCEDC8"
                    titleColor="#558B2F"
                    onPress={() => router.replace('/games' as any)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF0',
        padding: isTablet ? 20 : 10,
        gap: isTablet ? 15 : 10,
    },
    header: {
        flex: 0.15, // Reduced from 20%
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: isTablet ? 20 : 10,
        alignItems: 'center',
    },
    timeDateContainer: {
        flex: 1,
        paddingHorizontal: isTablet ? 20 : 10,
        justifyContent: 'center',
    },
    clockLabel: {
        fontSize: isTablet ? 48 : 22,
        fontWeight: 'bold',
        color: '#333333',
    },
    dateLabel: {
        fontSize: isTablet ? 20 : 12,
        color: '#888888',
    },
    settingsButton: {
        width: isTablet ? 80 : 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        fontSize: isTablet ? 32 : 24,
    },
    nowNextContainer: {
        flex: 0.55, // Increased slightly to balance header reduction
        flexDirection: 'row',
        gap: isTablet ? 20 : 10,
    },
    nowNextCard: {
        flex: 1,
        borderRadius: isTablet ? 20 : 10,
        borderWidth: 2,
        padding: isTablet ? 15 : 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderLabel: {
        fontSize: isTablet ? 24 : 14,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeIcon: {
        fontSize: isTablet ? 60 : 35,
    },
    largeTitle: {
        fontSize: isTablet ? 32 : 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isTablet ? 8 : 4,
        textAlign: 'center',
    },
    navBar: {
        flex: 0.3, // 30% height
        flexDirection: 'row',
        gap: isTablet ? 15 : 8,
    },
    dashboardCard: {
        flex: 1,
        borderRadius: isTablet ? 20 : 10,
        padding: isTablet ? 15 : 5,
        alignItems: 'center',
        justifyContent: 'center',
        gap: isTablet ? 8 : 4,
    },
    cardIcon: {
        fontSize: isTablet ? 45 : 28,
    },
    cardTitle: {
        fontSize: isTablet ? 24 : 12,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
