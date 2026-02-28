import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DashboardCard = ({ title, icon, bgColor, titleColor, onPress }: any) => (
    <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: bgColor }]} onPress={onPress}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={[styles.cardTitle, { color: titleColor }]}>{title}</Text>
    </TouchableOpacity>
);

export default function DashboardScreen() {
    const router = useRouter();

    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
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
                <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/admin' as any)}>
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Main: Now & Next */}
            <View style={styles.nowNextContainer}>
                <View style={[styles.nowNextCard, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}>
                    <Text style={[styles.cardHeaderLabel, { color: '#2E7D32' }]}>NOW</Text>
                    <View style={styles.iconContainer}>
                        <Text style={styles.largeIcon}>📍</Text>
                    </View>
                    <Text style={styles.largeTitle}>Free Time</Text>
                </View>

                <View style={[styles.nowNextCard, { backgroundColor: '#E3F2FD', borderColor: '#64B5F6' }]}>
                    <Text style={[styles.cardHeaderLabel, { color: '#1565C0' }]}>NEXT</Text>
                    <View style={styles.iconContainer}>
                        <Text style={styles.largeIcon}>➡️</Text>
                    </View>
                    <Text style={styles.largeTitle}>All Done!</Text>
                </View>
            </View>

            {/* Navigation Bar */}
            <View style={styles.navBar}>
                <DashboardCard
                    title="Talk"
                    icon="🗣️"
                    bgColor="#FFF9C4"
                    titleColor="#F57F17"
                    onPress={() => router.push('/aac' as any)}
                />
                <DashboardCard
                    title="Schedule"
                    icon="📅"
                    bgColor="#F3E5F5"
                    titleColor="#7B1FA2"
                    onPress={() => router.push('/scheduler' as any)}
                />
                <DashboardCard
                    title="Games"
                    icon="🎮"
                    bgColor="#DCEDC8"
                    titleColor="#558B2F"
                    onPress={() => router.push('/games' as any)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF0',
        padding: 30,
        gap: 20,
    },
    header: {
        flex: 0.2, // 20% height
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 30,
        alignItems: 'center',
    },
    timeDateContainer: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    clockLabel: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#333333',
    },
    dateLabel: {
        fontSize: 24,
        color: '#888888',
    },
    settingsButton: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        fontSize: 40,
    },
    nowNextContainer: {
        flex: 0.5, // 50% height
        flexDirection: 'row',
        gap: 30,
    },
    nowNextCard: {
        flex: 1,
        borderRadius: 30,
        borderWidth: 2,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderLabel: {
        fontSize: 32,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeIcon: {
        fontSize: 80,
    },
    largeTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    navBar: {
        flex: 0.3, // 30% height
        flexDirection: 'row',
        gap: 20,
    },
    dashboardCard: {
        flex: 1,
        borderRadius: 30,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    cardIcon: {
        fontSize: 60,
    },
    cardTitle: {
        fontSize: 30,
        fontWeight: 'bold',
    }
});
