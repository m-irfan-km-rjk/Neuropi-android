import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EmotionPracticeScreen() {
    const router = useRouter();
    const { emotion } = useLocalSearchParams();
    const [permission, requestPermission] = useCameraPermissions();

    const [feedback, setFeedback] = useState('Position your face in the camera');
    const [feedbackColor, setFeedbackColor] = useState('#666666');
    const [borderColor, setBorderColor] = useState('transparent');
    const [isSuccess, setIsSuccess] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    // Simulate emotion detection logic
    useEffect(() => {
        if (cameraReady && permission?.granted && !isSuccess) {
            setFeedback('Camera ready! Show the emotion.');
            setFeedbackColor('#77DD77');
            setBorderColor('red'); // Initially red

            // A mock interval to simulate AI checking frames
            const interval = setInterval(() => {
                // Random chance to succeed for demonstration 
                // In a real app, this is where you'd call your ML model
                const randomChance = Math.random();
                if (randomChance > 0.8) {
                    setIsSuccess(true);
                    setBorderColor('green');
                    setFeedback(`Perfect! You showed ${emotion}!`);
                    setFeedbackColor('#77DD77');
                    clearInterval(interval);
                } else {
                    setFeedback(`Detected: Neutral (Try ${emotion})`);
                    setFeedbackColor('#FF6961');
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [cameraReady, permission, isSuccess, emotion]);

    if (!permission) {
        return <View style={styles.container}><Text>Requesting permission...</Text></View>;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Show me: {emotion || 'Happy'}</Text>
            </View>

            {/* Feedback Label */}
            <Text style={[styles.feedbackLabel, { color: feedbackColor }]}>
                {feedback}
            </Text>

            {/* Camera Feed with Border */}
            <View style={[styles.cameraContainer, { borderColor: borderColor, borderWidth: 10 }]}>
                {permission.granted ? (
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="front"
                        onCameraReady={() => setCameraReady(true)}
                    />
                ) : (
                    <Text style={styles.noCameraText}>No access to camera</Text>
                )}
            </View>

            {/* Instructions Box */}
            <View style={styles.instructionsBox}>
                <Text style={styles.instructionsTitle}>📸 Instructions</Text>
                <Text style={styles.instructionsText}>
                    Red border = Wrong emotion | Green border = Correct emotion!
                </Text>
            </View>

            {/* Next Button (Shows on Success) */}
            <View style={{ height: 60, marginTop: 20 }}>
                {isSuccess && (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.nextButtonText}>Next Emotion</Text>
                    </TouchableOpacity>
                )}
            </View>
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
        marginTop: 20, // rough safearea
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
    feedbackLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 15,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noCameraText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 20,
    },
    instructionsBox: {
        height: 100,
        backgroundColor: '#FFF9E6',
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    instructionsText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: '#77DD77',
        height: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
