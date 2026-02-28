import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AACScreen() {
    const router = useRouter();
    const [sentence, setSentence] = useState<string[]>([]);

    const addToSentence = (word: string) => setSentence((s) => [...s, word]);
    const clearSentence = () => setSentence([]);
    // In a real app, integrate a TTS library like expo-speech
    const speakSentence = () => alert(sentence.join(' '));

    return (
        <View style={styles.container}>
            {/* Top Bar: Sentence Builder */}
            <View style={styles.sentenceBuilderBox}>
                <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
                    <Text style={styles.homeButtonText}>🏠 Home</Text>
                </TouchableOpacity>

                <View style={styles.sentenceDisplay}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, alignItems: 'center' }}>
                        {sentence.map((word, i) => (
                            <View key={i} style={styles.sentenceChip}>
                                <Text style={styles.sentenceText}>{word}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.speakButton} onPress={speakSentence}>
                    <Text style={styles.speakButtonText}>🔊 Speak</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.clearButton} onPress={clearSentence}>
                    <Text style={styles.clearButtonText}>❌ Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content Area */}
            <View style={styles.contentArea}>
                {/* Sidebar: Categories */}
                <View style={styles.sidebar}>
                    <ScrollView contentContainerStyle={{ gap: 10, padding: 15 }}>
                        {['All', 'Needs', 'Food & Drinks', 'Feelings'].map((cat, idx) => (
                            <TouchableOpacity key={idx} style={[styles.categoryButton, { backgroundColor: idx === 0 ? '#FFFFFF' : '#E0F7FA' }]}>
                                <Text style={styles.categoryText}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Grid: AAC Buttons */}
                <View style={styles.aacGrid}>
                    <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, padding: 20 }}>
                        {['Hungry', 'Thirsty', 'Toilet', 'Help'].map((btn, i) => (
                            <TouchableOpacity key={i} style={styles.aacButton} onPress={() => addToSentence(btn)}>
                                <Text style={styles.aacIcon}>🗣️</Text>
                                <Text style={styles.aacLabel}>{btn}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    sentenceBuilderBox: {
        height: 100,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 15,
    },
    homeButton: {
        backgroundColor: '#FFE082',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    homeButtonText: {
        color: '#E65100',
        fontSize: 22,
        fontWeight: 'bold',
    },
    sentenceDisplay: {
        flex: 1,
        height: 70,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        borderColor: '#90CAF9',
        borderWidth: 1.5,
        padding: 10,
    },
    sentenceChip: {
        backgroundColor: '#E3F2FD',
        borderColor: '#64B5F6',
        borderWidth: 1.5,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    sentenceText: {
        color: '#1565C0',
        fontSize: 20,
        fontWeight: 'bold',
    },
    speakButton: {
        backgroundColor: '#81C784',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    speakButtonText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#E57373',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    clearButtonText: {
        color: '#B71C1C',
        fontSize: 22,
        fontWeight: 'bold',
    },
    contentArea: {
        flex: 1,
        flexDirection: 'row',
        padding: 20,
        gap: 20,
    },
    sidebar: {
        flex: 0.25,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderColor: '#E0E0E0',
        borderWidth: 1,
    },
    categoryButton: {
        height: 70,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#B0BEC5',
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#455A64',
    },
    aacGrid: {
        flex: 0.75,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
    },
    aacButton: {
        width: '23%', // approx 4 cols layout
        height: 190,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderColor: '#E0E0E0',
        borderWidth: 1.2,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    aacIcon: {
        fontSize: 56,
    },
    aacLabel: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
    }
});
