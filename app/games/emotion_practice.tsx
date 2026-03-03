import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { saveGameProgress } from '../../utils/storage';

export default function EmotionPracticeScreen() {
    const router = useRouter();
    const { emotion } = useLocalSearchParams();
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');

    const [feedback, setFeedback] = useState('Position your face in the camera');
    const [feedbackColor, setFeedbackColor] = useState('#666666');
    const [borderColor, setBorderColor] = useState('transparent');
    const [isSuccess, setIsSuccess] = useState(false);
    const [startTime] = useState<number>(Date.now());

    // Load the model
    const plugin = useTensorflowModel(require('../../assets/models/mini_xception.tflite'));
    const model = plugin.state === 'loaded' ? plugin.model : null;
    const { resize } = useResizePlugin();
    const { detectFaces } = useFaceDetector({ performanceMode: 'fast', contourMode: 'none', classificationMode: 'none' });

    const EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];

    useEffect(() => {
        (async () => {
            if (!hasPermission) {
                await requestPermission();
            }
        })();
    }, [hasPermission, requestPermission]);

    // Update UI safely on JS Thread
    const setEmotionUI = Worklets.createRunOnJS((detectedEmotion: string, confidence: number) => {
        if (isSuccess) return;

        if (detectedEmotion.toLowerCase() === emotion?.toString().toLowerCase()) {
            if (confidence > 0.6) {
                setIsSuccess(true);
                setBorderColor('green');
                setFeedback(`Perfect! You showed ${emotion}! (${Math.round(confidence * 100)}%)`);
                setFeedbackColor('#77DD77');

                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                const score = Math.round(confidence * 100);
                const level = emotion?.toString() || 'General';
                // Calculate an accuracy proxy based on speed (under 5s = 100%)
                const accuracy = Math.max(0, 100 - Math.max(0, timeSpent - 5) * 5);

                saveGameProgress('emotion_practice', {
                    level,
                    timeSpent,
                    accuracy,
                    score
                });
            }
        } else {
            setBorderColor('red');
            setFeedback(`Detected: ${detectedEmotion} (Try ${emotion})`);
            setFeedbackColor('#FF6961');
        }
    });

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';

        let frameCount = 0;
        frameCount++;
        if (frameCount % 3 !== 0) return; // run every 3rd frame

        if (model == null) return;

        // 🔍 STEP 1: detect faces
        const faces = detectFaces(frame);
        if (faces.length === 0) return;

        // ✅ pick largest face
        let face = faces[0];
        for (const f of faces) {
            if (f.bounds.width * f.bounds.height >
                face.bounds.width * face.bounds.height) {
                face = f;
            }
        }

        const size = 48;

        // ⭐ expand face box slightly (VERY IMPORTANT for emotion models)
        const padding = 0.25;

        const crop = {
            x: Math.max(0, face.bounds.x - face.bounds.width * padding),
            y: Math.max(0, face.bounds.y - face.bounds.height * padding),
            width: face.bounds.width * (1 + padding * 2),
            height: face.bounds.height * (1 + padding * 2),
        };

        // 🔥 STEP 2: crop + resize ONLY FACE
        const resized = resize(frame, {
            crop, // ⭐ VERY IMPORTANT
            scale: { width: size, height: size },
            pixelFormat: 'rgb',
            dataType: 'uint8',
        });

        // 🔁 STEP 3: RGB → Grayscale (your code is good 👍)
        const grayBuffer = new Uint8Array(size * size);
        for (let i = 0; i < size * size; i++) {
            const r = resized[i * 3];
            const g = resized[i * 3 + 1];
            const b = resized[i * 3 + 2];
            grayBuffer[i] = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        }

        // 🤖 STEP 4: run model
        const outputs = model.runSync([grayBuffer]);

        if (outputs && outputs[0]) {
            const outputArray = outputs[0];
            let maxIdx = 0;
            let maxVal = Number(outputArray[0]);

            for (let i = 1; i < EMOTIONS.length; i++) {
                const val = Number(outputArray[i]);
                if (val > maxVal) {
                    maxVal = val;
                    maxIdx = i;
                }
            }

            setEmotionUI(EMOTIONS[maxIdx], maxVal);
        }
    }, [model]);

    const format = useCameraFormat(
        device,
        [
            { videoResolution: { width: 640, height: 480 } },
            { fps: 30 }
        ]
    );

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>{'< Back'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.headerTitle, { textAlign: 'center', marginBottom: 20 }]}>Camera permission is required.</Text>
                    <TouchableOpacity
                        style={[styles.nextButton, { height: 50, paddingHorizontal: 20 }]}
                        onPress={() => requestPermission()}
                    >
                        <Text style={styles.nextButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>{'< Back'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.headerTitle, { textAlign: 'center' }]}>No Front Camera Device Found.</Text>
                    <Text style={styles.instructionsText}>Are you running this on an emulator without a configured camera?</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/games/emotion_selection")}>
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
                    style={{ width: '100%', height: '100%' }}
                    device={device}
                    isActive={!isSuccess} // Pause camera once successful
                    frameProcessor={frameProcessor}
                    androidPreviewViewType="texture-view"
                    fps={30}
                    format={format}
                    onError={(e) => {
                        console.error('Camera Error:', e);
                        setFeedback(`Camera Error: ${e.message}`);
                    }}
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
        height: 50,
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
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 250
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
