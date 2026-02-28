import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const emotionsData = [
    { name: 'Happy', emoji: '😊', color: '#FFD700' },
    { name: 'Sad', emoji: '😢', color: '#4169E1' },
    { name: 'Angry', emoji: '😠', color: '#DC143C' },
    { name: 'Surprise', emoji: '😲', color: '#FF69B4' },
    { name: 'Fear', emoji: '😨', color: '#9370DB' },
    { name: 'Disgust', emoji: '🤢', color: '#32CD32' },
    { name: 'Neutral', emoji: '😐', color: '#808080' },
];

export default function EmotionSelectionScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/') as any}>
                    <Text style={styles.backButtonText}>🏠 Home</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emotion Exercise</Text>
            </View>

            {/* Instructions */}
            <Text style={styles.instructions}>
                Click on an emotion card to practice showing that emotion!
            </Text>

            {/* Grid */}
            <ScrollView contentContainerStyle={styles.gridContainer}>
                {emotionsData.map((emotion) => (
                    <TouchableOpacity
                        key={emotion.name}
                        style={[styles.card, { backgroundColor: emotion.color }]}
                        onPress={() => router.push({ pathname: '/emotion_practice', params: { emotion: emotion.name } })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cardEmoji}>{emotion.emoji}</Text>
                        <Text style={styles.cardTitle}>{emotion.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F2FF',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
        marginTop: 20, // safe area spacing roughly
    },
    backButton: {
        width: 100,
        backgroundColor: '#AEC6CF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 20,
    },
    backButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
    },
    instructions: {
        fontSize: 20,
        color: '#666666',
        marginVertical: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 30,
        justifyContent: 'center',
        paddingBottom: 50,
    },
    card: {
        width: 200,
        height: 250,
        borderRadius: 15,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
