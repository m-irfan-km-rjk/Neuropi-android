import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated, Easing, ScrollView } from 'react-native';
import { saveGameProgress } from '../../utils/storage';

const STAGES = {
    stage1: {
        title: "Symbol Identification",
        questions: [
            { instruction: "Pop the RED ball", correct: "🔴", options: ["🔴", "🔵", "🟢", "🟡"] },
            { instruction: "Pop the TRIANGLE", correct: "▲", options: ["▲", "●", "■", "▬"] },
            { instruction: "Pop the BIG shape", correct: "●", isBig: true, options: ["●", "●", "■", "▲"], bigIndex: 0 },
            { instruction: "Pop the GREEN shape", correct: "🟢", options: ["🟢", "🟦", "🔺", "🟣"] },
            { instruction: "Pop the STAR", correct: "⭐", options: ["⭐", "■", "●", "▲"] }
        ]
    },
    stage2: {
        title: "Letter Orientation",
        questions: [
            { instruction: "Pop the letter p", correct: "p", options: ["p", "q", "b", "d"] },
            { instruction: "Pop the letter b", correct: "b", options: ["b", "d", "p", "q"] },
            { instruction: "Pop the letter d", correct: "d", options: ["d", "b", "q", "p"] },
            { instruction: "Pop number 6", correct: "6", options: ["6", "9", "8", "0"] },
            { instruction: "Pop number 9", correct: "9", options: ["9", "6", "8", "0"] }
        ]
    },
    stage3: {
        title: "Emotion Recognition",
        questions: [
            { instruction: "Pop the HAPPY face", correct: "😊", options: ["😊", "😡", "😢", "😨"] },
            { instruction: "Pop the ANGRY face", correct: "😡", options: ["😡", "😊", "😢", "😲"] },
            { instruction: "Pop the SAD face", correct: "😢", options: ["😢", "😊", "😡", "😨"] },
            { instruction: "Pop the SURPRISED face", correct: "😲", options: ["😲", "😊", "😡", "😢"] },
            { instruction: "Pop the SCARED face", correct: "😨", options: ["😨", "😊", "😡", "😢"] }
        ]
    }
};

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const BUBBLE_SIZE = isTablet ? 120 : Math.min(width, height) * 0.20;

type BubbleType = {
    id: number;
    text: string;
    isCorrect: boolean;
    isBig: boolean;
    valX: Animated.Value;
    valY: Animated.Value;
    color: string;
    borderColor: string;
    scale: Animated.Value;
};

export default function SmartBubblepop() {
    const router = useRouter();

    const [currentStageId, setCurrentStageId] = useState<string | null>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState<BubbleType[]>([]);
    const [feedback, setFeedback] = useState("");
    const [feedbackColor, setFeedbackColor] = useState("#333");
    const [isProcessing, setIsProcessing] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [totalStageMisses, setTotalStageMisses] = useState<number>(0);
    const [startTime, setStartTime] = useState<number>(0);

    useEffect(() => {
        if (currentStageId) {
            loadQuestion();
        }
    }, [currentStageId, currentQuestionIdx]);

    const startGame = (stageId: string) => {
        setCurrentStageId(stageId);
        setCurrentQuestionIdx(0);
        setScore(0);
        setWrongAttempts(0);
        setTotalStageMisses(0);
        setStartTime(Date.now());
    };

    const loadQuestion = () => {
        setIsProcessing(false);
        setFeedback("");
        setWrongAttempts(0);

        const stage = STAGES[currentStageId as keyof typeof STAGES];
        if (currentQuestionIdx >= stage.questions.length) {
            setFeedback("Stage Complete 🎉");
            setFeedbackColor("#2C3E50");

            if (startTime > 0) {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                const qCount = stage.questions.length;
                const accuracy = Math.round((qCount / (qCount + totalStageMisses)) * 100);
                // Extracting just number from "stage1" for level
                const levelNum = parseInt(currentStageId?.replace(/\D/g, '') || "1");
                saveGameProgress('smart_bubble', {
                    level: levelNum,
                    timeSpent,
                    accuracy,
                    score,
                    totalMisses: totalStageMisses
                });
            }

            setTimeout(() => {
                setCurrentStageId(null);
            }, 2500);
            return;
        }

        const question = stage.questions[currentQuestionIdx];

        let shuffledOptions = [...question.options].map((opt, i) => ({ opt, originalIndex: i }))
            .sort(() => 0.5 - Math.random());

        const row1Y = isTablet ? 10 : 0;
        const row2Y = isTablet ? 10 + BUBBLE_SIZE + 20 : BUBBLE_SIZE + 5;

        // Calculate center cluster based on screen width
        const gapX = isTablet ? 40 : 15; // tighter horizontal gap
        const totalGridWidth = (BUBBLE_SIZE * 2) + gapX;
        const startX = (width - totalGridWidth) / 2;

        const col1X = startX;
        const col2X = startX + BUBBLE_SIZE + gapX;

        const positions = [
            { x: col1X, y: row1Y },
            { x: col2X, y: row1Y },
            { x: col1X, y: row2Y },
            { x: col2X, y: row2Y }
        ].sort(() => 0.5 - Math.random());

        const newBubbles: BubbleType[] = shuffledOptions.map((item, i) => {
            const q = question as any;
            const isCorrect = (item.opt === q.correct) && (!q.isBig || item.originalIndex === q.bigIndex);

            const b: BubbleType = {
                id: i,
                text: item.opt,
                isCorrect: isCorrect,
                isBig: !!q.isBig && item.originalIndex === q.bigIndex,
                valX: new Animated.Value(positions[i].x),
                valY: new Animated.Value(positions[i].y),
                color: "#E8DAEF",
                borderColor: "#D2B4DE",
                scale: new Animated.Value(1),
            };

            // Floating animation loop
            Animated.loop(
                Animated.sequence([
                    Animated.timing(b.valY, {
                        toValue: positions[i].y - 20,
                        duration: 1500 + Math.random() * 1000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: false
                    }),
                    Animated.timing(b.valY, {
                        toValue: positions[i].y,
                        duration: 1500 + Math.random() * 1000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: false
                    })
                ])
            ).start();

            return b;
        });

        setBubbles(newBubbles);
    };

    const handleBubblePress = (bubble: BubbleType) => {
        if (isProcessing) return;

        if (bubble.isCorrect) {
            setIsProcessing(true);
            setScore(prev => prev + 10);
            setFeedback("Good Job! ✔️");
            setFeedbackColor("#27AE60");

            setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, color: "#D5F5E3", borderColor: "#27AE60" } : b));

            setTimeout(() => {
                setCurrentQuestionIdx(prev => prev + 1);
            }, 1500);
        } else {
            // Wrong animation
            Animated.sequence([
                Animated.timing(bubble.valX, { toValue: (bubble.valX as any)._value - 10, duration: 50, useNativeDriver: false }),
                Animated.timing(bubble.valX, { toValue: (bubble.valX as any)._value + 10, duration: 50, useNativeDriver: false }),
                Animated.timing(bubble.valX, { toValue: (bubble.valX as any)._value, duration: 50, useNativeDriver: false }),
            ]).start();

            const fails = wrongAttempts + 1;
            setWrongAttempts(fails);
            setTotalStageMisses(prev => prev + 1);

            if (fails >= 3) {
                setFeedback("Hint! Look for the pulsing shape 👀");
                setFeedbackColor("#F39C12");
                const correctBubble = bubbles.find((b: BubbleType) => b.isCorrect);
                if (correctBubble) {
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(correctBubble.scale, { toValue: 1.15, duration: 500, useNativeDriver: false }),
                            Animated.timing(correctBubble.scale, { toValue: 1, duration: 500, useNativeDriver: false })
                        ])
                    ).start();
                }
            } else {
                setFeedback("Try Again");
                setFeedbackColor("#E67E22");
            }
        }
    };


    if (!currentStageId) {
        return (
            <View style={styles.menuContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/games' as any)}>
                        <Text style={styles.homeBtnText}>{'< Home'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.menuTitle}>Smart Bubble Pop</Text>
                </View>

                <Text style={styles.menuSubtitle}>Choose a practice stage:</Text>

                <TouchableOpacity style={styles.stageBtn} onPress={() => startGame('stage1')}>
                    <Text style={styles.stageBtnText}>1. Symbol Identification</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.stageBtn} onPress={() => startGame('stage2')}>
                    <Text style={styles.stageBtnText}>2. Letter Orientation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.stageBtn} onPress={() => startGame('stage3')}>
                    <Text style={styles.stageBtnText}>3. Emotion Recognition</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const stage = STAGES[currentStageId as keyof typeof STAGES];
    const qCount = stage.questions.length;
    let desc = "";
    if (currentQuestionIdx < qCount) {
        desc = stage.questions[currentQuestionIdx].instruction;
    }

    return (
        <View style={styles.gameContainer}>
            <View style={styles.gameHeader}>
                <TouchableOpacity style={styles.gameBackBtn} onPress={() => setCurrentStageId(null)}>
                    <Text style={styles.gameBackBtnText}>{'< Menu'}</Text>
                </TouchableOpacity>
                <Text style={styles.progressText}>Question {Math.min(currentQuestionIdx + 1, qCount)} of {qCount}</Text>
                <Text style={styles.scoreText}>Score: {score}</Text>
            </View>

            <Text style={styles.stageTitleLbl}>Stage: {stage.title}</Text>
            <Text style={styles.instructionLbl}>{desc}</Text>

            <View style={styles.gameArea}>
                {bubbles.map(b => (
                    <Animated.View
                        key={b.id}
                        style={[
                            styles.bubbleBase,
                            {
                                left: b.valX,
                                top: b.valY,
                                backgroundColor: b.color,
                                borderColor: b.borderColor,
                                transform: [{ scale: b.scale }]
                            }
                        ]}
                    >
                        <TouchableOpacity activeOpacity={0.8} style={styles.bubbleTouchable} onPress={() => handleBubblePress(b)}>
                            <Text style={[styles.bubbleText, b.isBig && { fontSize: isTablet ? 50 : 36 }]}>{b.text}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <Text style={[styles.feedbackLbl, { color: feedbackColor }]}>{feedback}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    menuContainer: { flexGrow: 1, backgroundColor: '#F9FBFA', padding: 10 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    homeBtn: { backgroundColor: '#AED6F1', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginRight: 15 },
    homeBtnText: { fontSize: isTablet ? 18 : 14, fontWeight: 'bold', color: '#2C3E50' },
    menuTitle: { fontSize: isTablet ? 32 : 24, fontWeight: 'bold', color: '#2C3E50', flexShrink: 1 },
    menuSubtitle: { fontSize: isTablet ? 20 : 16, color: '#2C3E50', marginBottom: 15 },
    stageBtn: { backgroundColor: '#D6EAF8', borderColor: '#AED6F1', borderWidth: 2, borderRadius: 16, padding: isTablet ? 20 : 15, marginBottom: 12 },
    stageBtnText: { fontSize: isTablet ? 24 : 16, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center' },

    gameContainer: { flex: 1, backgroundColor: '#F9FBFA' },
    gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, height: 60 },
    gameBackBtn: { backgroundColor: '#AED6F1', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
    gameBackBtnText: { fontSize: isTablet ? 16 : 12, fontWeight: 'bold', color: '#2C3E50' },
    progressText: { fontSize: isTablet ? 18 : 14, fontWeight: 'bold', color: '#2C3E50' },
    scoreText: { fontSize: isTablet ? 18 : 14, fontWeight: 'bold', color: '#2C3E50', width: 90, textAlign: 'right' },

    stageTitleLbl: { fontSize: isTablet ? 20 : 14, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginVertical: 4, paddingHorizontal: 10 },
    instructionLbl: { fontSize: isTablet ? 24 : 16, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 8, paddingHorizontal: 10 },

    gameArea: { flex: 1, position: 'relative' },

    bubbleBase: {
        position: 'absolute',
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: BUBBLE_SIZE / 2,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    bubbleTouchable: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleText: {
        fontSize: isTablet ? 32 : 18,
        color: '#2C3E50',
        textAlign: 'center'
    },

    feedbackLbl: { fontSize: isTablet ? 32 : 20, fontWeight: 'bold', textAlign: 'center', height: 50, marginBottom: 5 },
});
