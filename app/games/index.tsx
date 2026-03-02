import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GamesCard = ({ title, desc, icon, bgColor, borderColor, onPress }: any) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: bgColor, borderColor: borderColor }]} onPress={onPress}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
    </TouchableOpacity>
);

export default function GamesHubScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/') as any}>
                    <Text style={styles.backButtonText}>{'< Home'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🎮  Games</Text>
            </View>

            <View style={styles.scrollContent}>
                <Text style={styles.subtitle}>Choose an activity!</Text>
                <View style={styles.gridContainer}>
                    <GamesCard
                        title="Emotion Practice"
                        desc="Practice your expressions"
                        icon="😊"
                        bgColor="#E6F2FF"
                        borderColor="#AEC6CF"
                        onPress={() => router.push('/games/emotion_selection' as any)}
                    />
                    <GamesCard
                        title="Memory Match"
                        desc="Flip tiles & find pairs"
                        icon="🃏"
                        bgColor="#DCEDC8"
                        borderColor="#8BC34A"
                        onPress={() => router.push('/games/memory_match' as any)}
                    />
                    <GamesCard
                        title="Routine Builder"
                        desc="Practice daily steps"
                        icon="📅"
                        bgColor="#FFF9C4"
                        borderColor="#FFF176"
                        onPress={() => router.push('/games/routine_builder' as any)}
                    />
                    <GamesCard
                        title="Smart Bubble Pop"
                        desc="Pop the right symbols"
                        icon="🫧"
                        bgColor="#E8DAEF"
                        borderColor="#D2B4DE"
                        onPress={() => router.push('/games/smart_bubble' as any)}
                    />
                    <GamesCard
                        title="Visual Real-Life"
                        desc="Practice real skills"
                        icon="🌍"
                        bgColor="#E3F2FD"
                        borderColor="#90CAF9"
                        onPress={() => router.push('/games/visual_real_life' as any)}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        marginTop: 10,
        marginBottom: 5,
    },
    backButton: {
        width: 80,
        backgroundColor: '#A5D6A7',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 15,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#555555',
        marginBottom: 10,
        marginLeft: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    card: {
        width: '30%',
        aspectRatio: 1.8,
        borderRadius: 12,
        borderWidth: 2,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    cardIcon: {
        fontSize: 32,
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2E7D32',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 10,
        textAlign: 'center',
        color: '#555555',
    }
});
