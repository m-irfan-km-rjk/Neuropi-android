import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';

export default function EmotionPracticeScreen() {
    const router = useRouter();
    const { emotion } = useLocalSearchParams();
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');

    const [feedback, setFeedback] = useState('Position your face in the camera');
    const [feedbackColor, setFeedbackColor] = useState('#666666');
    const [borderColor, setBorderColor] = useState('transparent');
    const [isSuccess, setIsSuccess] = useState(false);

    // Load the model
    const plugin = useTensorflowModel(require('../../assets/models/mini_xception.tflite'));
    const model = plugin.state === 'loaded' ? plugin.model : null;
    const { resize } = useResizePlugin();

    const EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    // Update UI safely on JS Thread
    const setEmotionUI = Worklets.createRunOnJS((detectedEmotion: string, confidence: number) => {
        if (isSuccess) return;

        if (detectedEmotion.toLowerCase() === emotion?.toString().toLowerCase()) {
            if (confidence > 0.6) {
                setIsSuccess(true);
                setBorderColor('green');
                setFeedback(`Perfect! You showed ${emotion}! (${Math.round(confidence * 100)}%)`);
                setFeedbackColor('#77DD77');
            }
        } else {
            setBorderColor('red');
            setFeedback(`Detected: ${detectedEmotion} (Try ${emotion})`);
            setFeedbackColor('#FF6961');
        }
    });

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        if (model == null) return;

        const size = 48; // Required by mini_xception

        // Resize the frame using the native Resize Plugin
        const resized = resize(frame, {
            scale: { width: size, height: size },
            pixelFormat: 'rgb',
            dataType: 'uint8',
        });

        // The mini-xception tflite model expects Grayscale inputs of Float32 or UInt8 [1, 48, 48, 1].
        // Convert RGB to Grayscale
        const grayBuffer = new Uint8Array(size * size);
        for (let i = 0; i < size * size; i++) {
            const r = resized[i * 3];
            const g = resized[i * 3 + 1];
            const b = resized[i * 3 + 2];
            grayBuffer[i] = Math.max(0, Math.min(255, Math.round(r * 0.299 + g * 0.587 + b * 0.114)));
        }

        // Run TFLite Prediction
        const outputs = model.runSync([grayBuffer]);

        // Output shape is [1, 7] - prob array for 7 emotions
        if (outputs && outputs[0]) {
            const outputArray = outputs[0] as Float32Array;
            let maxIdx = 0;
            let maxVal = outputArray[0];

            for (let i = 1; i < EMOTIONS.length; i++) {
                if (outputArray[i] > maxVal) {
                    maxVal = outputArray[i];
                    maxIdx = i;
                }
            }

            const detected = EMOTIONS[maxIdx];
            setEmotionUI(detected, maxVal);
        }
    }, [model]);

    if (!hasPermission || device == null) {
        return (
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Need camera access.</Text>
            </View>
        );
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
                {plugin.state !== 'loaded' ? 'Loading AI Model...' : feedback}
            </Text>

            {/* Camera Feed with Border */}
            <View style={[styles.cameraContainer, { borderColor: borderColor, borderWidth: 10 }]}>
                <Camera
                    style={StyleSheet.absoluteFillObject}
                    device={device}
                    isActive={!isSuccess} // Pause camera once successful
                    frameProcessor={frameProcessor}
                    fps={15} // Keep FPS manageable for processing
                />
            </View>

            {/* Instructions Box */}
            <View style={styles.instructionsBox}>
                <Text style={styles.instructionsTitle}>📸 Instructions</Text>
                <Text style={styles.instructionsText}>
                    Look into the camera! Remember: AI expects a center-aligned face.
                    {'\n'}Red border = Wrong emotion | Green border = Correct emotion!
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
        marginTop: 20,
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
