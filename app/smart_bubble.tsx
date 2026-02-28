import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SmartBubbleScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/games' as any)}>
                    <Text style={styles.homeButtonText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Smart Bubble Pop</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.message}>🏗️ Under Construction 🏗️</Text>
                <Text style={styles.subMessage}>We are still transitioning this Kivy Game to React Native!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E8DAEF', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', height: 80, marginTop: 20 },
    homeButton: { backgroundColor: '#D2B4DE', padding: 15, borderRadius: 8, marginRight: 20 },
    homeButtonText: { color: '#000', fontWeight: 'bold' },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#333' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    message: { fontSize: 36, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subMessage: { fontSize: 20, color: '#666', textAlign: 'center' }
});
