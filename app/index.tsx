import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
                    <Ionicons name="settings-sharp" size={isTablet ? 40 : 28} color="#555" />
                </TouchableOpacity>
            </View>

            {/* Main: Now & Next */}
            <View style={styles.nowNextContainer}>
                <View style={[styles.nowNextCard, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}>
                    <Text style={[styles.cardHeaderLabel, { color: '#2E7D32' }]}>NOW</Text>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="location-on" size={isTablet ? 80 : 45} color="#2E7D32" />
                    </View>
                    <Text style={styles.largeTitle}>Free Time</Text>
                </View>

                <View style={[styles.nowNextCard, { backgroundColor: '#E3F2FD', borderColor: '#64B5F6' }]}>
                    <Text style={[styles.cardHeaderLabel, { color: '#1565C0' }]}>NEXT</Text>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="arrow-forward" size={isTablet ? 80 : 45} color="#1565C0" />
                    </View>
                    <Text style={styles.largeTitle}>All Done!</Text>
                </View>
            </View>

            {/* Navigation Bar */}
            <View style={styles.navBar}>
                <DashboardCard
                    title="Talk"
                    icon={<Ionicons name="chatbubbles" size={isTablet ? 60 : 36} color="#F57F17" />}
                    bgColor="#FFF9C4"
                    titleColor="#F57F17"
                    onPress={() => router.push('/aac' as any)}
                />
                <DashboardCard
                    title="Schedule"
                    icon={<Ionicons name="calendar-sharp" size={isTablet ? 60 : 36} color="#7B1FA2" />}
                    bgColor="#F3E5F5"
                    titleColor="#7B1FA2"
                    onPress={() => router.push('/scheduler' as any)}
                />
                <DashboardCard
                    title="Games"
                    icon={<Ionicons name="game-controller" size={isTablet ? 60 : 36} color="#558B2F" />}
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
        padding: isTablet ? 30 : 15,
        gap: isTablet ? 20 : 15,
    },
    header: {
        flex: 0.2, // 20% height
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: isTablet ? 30 : 15,
        alignItems: 'center',
    },
    timeDateContainer: {
        flex: 1,
        paddingHorizontal: isTablet ? 30 : 15,
        justifyContent: 'center',
    },
    clockLabel: {
        fontSize: isTablet ? 64 : 26,
        fontWeight: 'bold',
        color: '#333333',
    },
    dateLabel: {
        fontSize: isTablet ? 24 : 14,
        color: '#888888',
    },
    settingsButton: {
        width: isTablet ? 100 : 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        fontSize: isTablet ? 40 : 28,
    },
    nowNextContainer: {
        flex: 0.5, // 50% height
        flexDirection: 'row',
        gap: isTablet ? 30 : 10,
    },
    nowNextCard: {
        flex: 1,
        borderRadius: isTablet ? 30 : 15,
        borderWidth: 2,
        padding: isTablet ? 20 : 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderLabel: {
        fontSize: isTablet ? 32 : 18,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeIcon: {
        fontSize: isTablet ? 80 : 45,
    },
    largeTitle: {
        fontSize: isTablet ? 40 : 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isTablet ? 10 : 5,
        textAlign: 'center',
    },
    navBar: {
        flex: 0.3, // 30% height
        flexDirection: 'row',
        gap: isTablet ? 20 : 10,
    },
    dashboardCard: {
        flex: 1,
        borderRadius: isTablet ? 30 : 15,
        padding: isTablet ? 20 : 5,
        alignItems: 'center',
        justifyContent: 'center',
        gap: isTablet ? 10 : 5,
    },
    cardIcon: {
        fontSize: isTablet ? 60 : 36,
    },
    cardTitle: {
        fontSize: isTablet ? 30 : 14,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
