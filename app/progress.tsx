import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
// Adjusted import path since storage.ts is now in the project root utils/
import { GameProgress, getAllGameProgress } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

const GAMES = [
    { id: 'memory_match', title: 'Memory Match' },
    { id: 'routine_builder', title: 'Routine Builder' },
    { id: 'smart_bubble', title: 'Smart Bubble Pop' },
    { id: 'visual_real_life', title: 'Visual Real-Life' },
    { id: 'emotion_practice', title: 'Emotion Practice' }
];

export default function ProgressScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState<Record<string, GameProgress>>({});
    const [selectedGame, setSelectedGame] = useState<string>('memory_match');
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllGameProgress();
            setProgressData(data || {});
        } catch (e: any) {
            setErrorMsg(e.message || "Failed to load data. Async storage may not be linked.");
        }
        setLoading(false);
    };

    const currentGameData = progressData[selectedGame]?.history || [];

    const availableLevels = Array.from(new Set(currentGameData.map(d => String(d.level || 'General')))).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });

    const activeLevel = (selectedLevel && availableLevels.includes(selectedLevel)) ? selectedLevel : (availableLevels[0] || null);

    const filteredData = activeLevel
        ? currentGameData.filter(d => String(d.level || 'General') === activeLevel)
        : [];

    const recentPlays = filteredData.slice(-7);

    const labels = recentPlays.length > 0 ? recentPlays.map((_, i) => `T${i + 1}`) : ['N/A'];
    const accuracies = recentPlays.length > 0 ? recentPlays.map(d => d.accuracy || 0) : [0];
    const times = recentPlays.length > 0 ? recentPlays.map(d => d.timeSpent || 0) : [0];

    const chartConfig = {
        backgroundGradientFrom: '#FDFCF0',
        backgroundGradientTo: '#FDFCF0',
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.6,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
    };

    const timeChartConfig = {
        backgroundGradientFrom: '#FDFCF0',
        backgroundGradientTo: '#FDFCF0',
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
                    <Text style={styles.backButtonText}>{'< Home'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Progress Tracker</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            ) : errorMsg ? (
                <View style={styles.centerContainer}>
                    <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', padding: 20 }}>
                        Error: {errorMsg}
                    </Text>
                    <Text style={{ fontSize: 16, textAlign: 'center', padding: 20 }}>
                        Please ensure you compile a custom development build to use native modules like AsyncStorage (e.g. `npx expo run:android`).
                    </Text>
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.tabsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                            {GAMES.map(game => (
                                <TouchableOpacity
                                    key={game.id}
                                    style={[styles.tabButton, selectedGame === game.id && styles.tabButtonActive]}
                                    onPress={() => {
                                        setSelectedGame(game.id);
                                    }}
                                >
                                    <Text style={[styles.tabText, selectedGame === game.id && styles.tabTextActive]}>
                                        {game.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <ScrollView style={styles.scrollArea}>
                        <View style={styles.controlsRow}>
                            <Text style={styles.sectionTitle}>
                                {GAMES.find(g => g.id === selectedGame)?.title} Analytics
                            </Text>

                            {availableLevels.length > 0 && (
                                <View style={styles.levelFilter}>
                                    <Text style={styles.filterLabel}>Filter by:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelScroll}>
                                        {availableLevels.map(lvl => (
                                            <TouchableOpacity
                                                key={lvl}
                                                style={[styles.levelBtn, activeLevel === lvl && styles.levelBtnActive]}
                                                onPress={() => setSelectedLevel(lvl)}
                                            >
                                                <Text style={[styles.levelBtnText, activeLevel === lvl && styles.levelBtnTextActive]}>
                                                    {String(lvl).replace('stage', 'Stage ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                        </View>

                        {recentPlays.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No data available yet.</Text>
                                <Text style={styles.emptySubtext}>Play some games and check back later!</Text>
                            </View>
                        ) : (
                            <View style={styles.chartsContainer}>
                                <View style={styles.chartCard}>
                                    <Text style={styles.chartTitle}>Learning Curve (Accuracy %)</Text>
                                    <LineChart
                                        data={{
                                            labels: labels,
                                            datasets: [{ data: accuracies }]
                                        }}
                                        width={width - (isTablet ? 80 : 40)}
                                        height={220}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={styles.chartStyle}
                                        fromZero
                                        yAxisLabel=""
                                        yAxisSuffix="%"
                                    />
                                    <Text style={styles.chartSubtitle}>Last {recentPlays.length} attempts</Text>
                                </View>

                                <View style={styles.chartCard}>
                                    <Text style={styles.chartTitle}>Time Spent (Seconds)</Text>
                                    <BarChart
                                        data={{
                                            labels: labels,
                                            datasets: [{ data: times }]
                                        }}
                                        width={width - (isTablet ? 80 : 40)}
                                        height={220}
                                        yAxisLabel=""
                                        yAxisSuffix="s"
                                        chartConfig={timeChartConfig}
                                        style={styles.chartStyle}
                                        fromZero
                                        showValuesOnTopOfBars
                                    />
                                </View>
                            </View>
                        )}
                        <View style={{ height: 50 }} />
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { height: 80, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingTop: 10 },
    backButton: { backgroundColor: '#E5E7EB', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginRight: 20 },
    backButtonText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    headerTitle: { fontSize: isTablet ? 32 : 24, fontWeight: 'bold', color: '#111827' },
    content: { flex: 1 },
    tabsContainer: { height: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    tabsScroll: { alignItems: 'center', paddingHorizontal: 10, gap: 10 },
    tabButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
    tabButtonActive: { backgroundColor: '#2E7D32' },
    tabText: { fontSize: 16, fontWeight: 'bold', color: '#4B5563' },
    tabTextActive: { color: '#FFF' },
    scrollArea: { flex: 1, padding: isTablet ? 30 : 15 },
    controlsRow: { marginBottom: 20 },
    sectionTitle: { fontSize: isTablet ? 28 : 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
    levelFilter: { flexDirection: 'row', alignItems: 'center' },
    filterLabel: { fontSize: 16, fontWeight: 'bold', color: '#4B5563', marginRight: 10 },
    levelScroll: { flexGrow: 0 },
    levelBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E5E7EB', borderRadius: 8, marginRight: 8 },
    levelBtnActive: { backgroundColor: '#4B5563' },
    levelBtnText: { fontSize: 14, fontWeight: 'bold', color: '#4B5563' },
    levelBtnTextActive: { color: '#FFF' },
    emptyContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40, elevation: 2 },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginBottom: 10, textAlign: 'center' },
    emptySubtext: { fontSize: 16, color: '#9CA3AF', textAlign: 'center' },
    chartsContainer: { gap: 20 },
    chartCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 3, overflow: 'hidden' },
    chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15, textAlign: 'center' },
    chartStyle: { marginVertical: 8, borderRadius: 16, alignSelf: 'center' },
    chartSubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 5 }
});
