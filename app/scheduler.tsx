import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simulated DB of events
const initialEvents = [
    { id: '1', title: 'Breakfast', icon: '🍞', startTime: '08:00', endTime: '08:30' },
    { id: '2', title: 'School Bus', icon: '🚌', startTime: '08:30', endTime: '09:00' },
    { id: '3', title: 'Class', icon: '🏫', startTime: '09:00', endTime: '12:00' },
    { id: '4', title: 'Lunch', icon: '🍎', startTime: '12:00', endTime: '13:00' },
];

export default function SchedulerScreen() {
    const router = useRouter();
    const [events, setEvents] = useState(initialEvents);
    const [nowStr, setNowStr] = useState('');

    // Update current time to determine what's "NOW" and "DONE"
    useEffect(() => {
        const updateTime = () => setNowStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const getCurrentTimeParsed = () => {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
    };

    const parseHM = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        return parseInt(h) * 60 + parseInt(m);
    };

    const formatAMPM = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return { time: `${hour12}:${m}`, ampm };
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}>
                    <Text style={styles.homeButtonText}>🏠 Home</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Daily Schedule</Text>
                <TouchableOpacity style={styles.manageButton} onPress={() => router.replace('/admin' as any)}>
                    <Text style={styles.manageButtonText}>✏️ Manage</Text>
                </TouchableOpacity>
            </View>

            {/* Timeline */}
            <ScrollView contentContainerStyle={styles.timelineList}>
                {events.map((ev) => {
                    const startM = parseHM(ev.startTime);
                    const endM = parseHM(ev.endTime);
                    const currentM = getCurrentTimeParsed();

                    const isPast = endM < currentM;
                    const isCurrent = startM <= currentM && currentM <= endM;

                    const bgHex = isCurrent ? '#E8F5E9' : '#FFFFFF';
                    const borderColor = isCurrent ? '#4CAF50' : 'transparent';

                    const { time: startT, ampm: startAmpm } = formatAMPM(ev.startTime);
                    const { time: endT, ampm: endAmpm } = formatAMPM(ev.endTime);

                    let titleText = ev.title;
                    if (isCurrent) titleText += ' (NOW)';
                    else if (isPast) titleText += ' (DONE)';

                    return (
                        <View
                            key={ev.id}
                            style={[
                                styles.card,
                                { backgroundColor: bgHex, borderColor, borderWidth: isCurrent ? 2 : 0, opacity: isPast ? 0.6 : 1.0 }
                            ]}
                        >
                            <View style={styles.timeBox}>
                                <Text style={styles.timeText}>{startT}</Text>
                                <Text style={styles.ampmText}>{startAmpm}</Text>
                            </View>

                            <View style={styles.iconBox}>
                                <Text style={styles.iconEmj}>{ev.icon}</Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Text style={styles.titleText}>{titleText}</Text>
                                <Text style={styles.untilText}>Until {endT} {endAmpm}</Text>
                            </View>

                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5E6',
    },
    header: {
        height: 80,
        backgroundColor: '#FFDAB9',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    homeButton: {
        width: 120,
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#555555',
    },
    manageButton: {
        width: 150,
        padding: 15,
        backgroundColor: '#7B1FA2',
        borderRadius: 8,
        alignItems: 'center',
    },
    manageButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    timelineList: {
        paddingVertical: 50,
        paddingHorizontal: 50,
        gap: 30,
    },
    card: {
        height: 120,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    timeBox: {
        flex: 0.2,
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
    },
    ampmText: {
        fontSize: 18,
        color: '#666',
    },
    iconBox: {
        flex: 0.2,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    iconEmj: {
        fontSize: 60,
        color: '#000',
    },
    infoBox: {
        flex: 0.6,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    untilText: {
        fontSize: 20,
        color: '#888',
    }
});
