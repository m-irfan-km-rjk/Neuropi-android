import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Animated, PanResponder, Dimensions } from 'react-native';

const SCENARIOS = [
    {
        title: "Getting Ready for School",
        steps: [
            { id: '1', text: "Brush Teeth", icon: require("../../assets/images/brushteeth.jpg") },
            { id: '2', text: "Wear Uniform", icon: require("../../assets/images/wearuniform.jpg") },
            { id: '3', text: "Eat Breakfast", icon: require("../../assets/images/eatbreakfast.jpg") },
            { id: '4', text: "Pack Bag", icon: require("../../assets/images/pack bag.jpg") }
        ]
    },
    {
        title: "Going to the Shop",
        steps: [
            { id: '1', text: "Carry Bag", icon: require("../../assets/images/carrybag.jpg") },
            { id: '2', text: "Take Money", icon: require("../../assets/images/take money.jpg") },
            { id: '3', text: "Buy Product", icon: require("../../assets/images/buy product.jpg") },
            { id: '4', text: "Collect Balance", icon: require("../../assets/images/collect balance.jpg") }
        ]
    },
    {
        title: "Preparing for Bed",
        steps: [
            { id: '1', text: "Change Clothes", icon: require("../../assets/images/change cloths.jpg") },
            { id: '2', text: "Brush Teeth", icon: require("../../assets/images/brushteeth.jpg") },
            { id: '3', text: "Read Book", icon: require("../../assets/images/reading book.jpg") },
            { id: '4', text: "Sleep", icon: require("../../assets/images/sleep.jpg") }
        ]
    },
    {
        title: "Going to Playground",
        steps: [
            { id: '1', text: "Wear Shoes", icon: require("../../assets/images/wear shoes.jpg") },
            { id: '2', text: "Take Water Bottle", icon: require("../../assets/images/take bottle.jpg") },
            { id: '3', text: "Go Outside", icon: require("../../assets/images/go outside.jpg") },
            { id: '4', text: "Play", icon: require("../../assets/images/play.jpg") }
        ]
    },
    {
        title: "Doing Homework",
        steps: [
            { id: '1', text: "Take Books", icon: require("../../assets/images/take book.png") },
            { id: '2', text: "Sit at Desk", icon: require("../../assets/images/sit at desk.png") },
            { id: '3', text: "Complete Work", icon: require("../../assets/images/complete work.png") },
            { id: '4', text: "Pack Books", icon: require("../../assets/images/pack books.jpg") }
        ]
    }
];

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const SLOT_SIZE = width * 0.2;
const TASK_WIDTH = width * 0.22;
const TASK_HEIGHT = width * 0.22;

export default function RoutineBuilder() {
    const router = useRouter();

    const [level, setLevel] = useState<number | null>(null);
    const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [shuffledTasks, setShuffledTasks] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([null, null, null, null]);
    const [feedback, setFeedback] = useState("");
    const [feedbackColor, setFeedbackColor] = useState("#333");

    const slotRefs = useRef<any[]>([]);
    const slotLayoutsRef = useRef<any[]>([]);

    useEffect(() => {
        if (level) {
            loadScenario();
        }
    }, [level, currentScenarioIdx]);

    const loadScenario = () => {
        if (currentScenarioIdx >= SCENARIOS.length) {
            setFeedback("All Scenarios Complete 🎉");
            setFeedbackColor("#2C3E50");
            setShuffledTasks([]);
            return;
        }

        const scenario = SCENARIOS[currentScenarioIdx];
        const steps = [...scenario.steps].sort(() => 0.5 - Math.random());

        // Initial positions for tasks
        const positions = [
            { x: width * 0.15, y: height * 0.2 },
            { x: width * 0.65, y: height * 0.2 },
            { x: width * 0.15, y: height * 0.5 },
            { x: width * 0.65, y: height * 0.5 },
        ].sort(() => 0.5 - Math.random());

        const tasksWithPos = steps.map((s, i) => ({
            ...s,
            initialPos: positions[i],
            pan: new Animated.ValueXY(positions[i]),
            val: new Animated.Value(0), // for glow
        }));

        setShuffledTasks(tasksWithPos);
        setSlots([null, null, null, null]);
        setCurrentStepIdx(0);
        setFailedAttempts(0);
        setFeedback("");
    };

    const handleDrop = (task: any, gesture: any) => {
        // Calculate drop point
        const dropX = gesture.moveX;
        const dropY = gesture.moveY;

        let droppedSlotIdx = -1;
        const forgiveness = 20;

        for (let i = 0; i < 4; i++) {
            const layout = slotLayoutsRef.current[i];
            if (layout &&
                dropX >= (layout.x - forgiveness) &&
                dropX <= (layout.x + layout.width + forgiveness) &&
                dropY >= (layout.y - forgiveness) &&
                dropY <= (layout.y + layout.height + forgiveness)
            ) {
                droppedSlotIdx = i;
                break;
            }
        }

        if (droppedSlotIdx === -1) {
            // Return to original
            Animated.spring(task.pan, {
                toValue: task.initialPos,
                useNativeDriver: false
            }).start();
            return;
        }

        if (droppedSlotIdx !== currentStepIdx) {
            wrongDrop(task);
            return;
        }

        const scenario = SCENARIOS[currentScenarioIdx];
        if (task.text === scenario.steps[currentStepIdx].text) {
            correctDrop(task, droppedSlotIdx);
        } else {
            wrongDrop(task);
        }
    };

    const correctDrop = (task: any, slotIdx: number) => {
        const newSlots = [...slots];
        newSlots[slotIdx] = task;
        setSlots(newSlots);

        setShuffledTasks(prev => prev.filter(t => t.id !== task.id));
        setFeedback("✔ Correct!");
        setFeedbackColor("#27AE60");
        setFailedAttempts(0);

        if (currentStepIdx + 1 === 4) {
            setFeedback("🎉 Scenario Complete");
            setFeedbackColor("#2980B9");
            setTimeout(() => {
                setCurrentScenarioIdx(prev => prev + 1);
            }, 2000);
        } else {
            setCurrentStepIdx(prev => prev + 1);
        }
    };

    const wrongDrop = (task: any) => {
        Animated.spring(task.pan, {
            toValue: task.initialPos,
            useNativeDriver: false
        }).start();

        setFeedback("❌ Try Again");
        setFeedbackColor("#E74C3C");
        setFailedAttempts(prev => prev + 1);

        if (level === 2) {
            // Level 2 resets
            setTimeout(() => {
                loadScenario();
                if (failedAttempts + 1 >= 3) {
                    playLevel2Hint();
                }
            }, 1000);
        } else {
            // Level 1 highlights target after 3 fails
            if (failedAttempts + 1 >= 3) {
                const targetText = SCENARIOS[currentScenarioIdx].steps[currentStepIdx].text;
                const targetTask = shuffledTasks.find(t => t.text === targetText);
                if (targetTask) {
                    glowTask(targetTask, 1, 0, 0); // Red pulse
                }
            }
        }
    };

    const playLevel2Hint = () => {
        const correctOrder = SCENARIOS[currentScenarioIdx].steps;
        let delay = 0;
        correctOrder.forEach((step, idx) => {
            setTimeout(() => {
                setShuffledTasks(currentTasks => {
                    const target = currentTasks.find(t => t.text === step.text);
                    if (target) glowTask(target, 0, 1, 0); // Green pulse
                    return currentTasks;
                });
            }, delay);
            delay += 1200;
        });
    };

    const glowTask = (task: any, r: number, g: number, b: number) => {
        Animated.sequence([
            Animated.timing(task.val, { toValue: 1, duration: 300, useNativeDriver: false }),
            Animated.timing(task.val, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start();
    };


    if (!level) {
        return (
            <View style={styles.menuContainer}>
                <Text style={styles.menuTitle}>Routine Sequence Builder</Text>
                <TouchableOpacity style={[styles.menuBtn, { backgroundColor: '#4CAF50' }]} onPress={() => setLevel(1)}>
                    <Text style={styles.menuBtnText}>Level 1 (With Hints & Forgiving Drops)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuBtn, { backgroundColor: '#E53935' }]} onPress={() => setLevel(2)}>
                    <Text style={styles.menuBtnText}>Level 2 (Strict Rules)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuBtn, { backgroundColor: '#9E9E9E' }]} onPress={() => router.push('/games' as any)}>
                    <Text style={styles.menuBtnText}>{'< Back to Hub'}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.gameContainer}>
            <View style={styles.topSection}>
                <TouchableOpacity style={styles.homeButton} onPress={() => setLevel(null)}>
                    <Text style={styles.homeButtonText}>{'< Menu'}</Text>
                </TouchableOpacity>
                {currentScenarioIdx < SCENARIOS.length && (
                    <Text style={styles.scenarioLabel}>
                        [{currentScenarioIdx + 1}/{SCENARIOS.length}] Lvl {level}: {SCENARIOS[currentScenarioIdx].title}
                    </Text>
                )}
            </View>

            <View style={styles.middleSection}>
                {shuffledTasks.map((task) => (
                    <DraggableItem key={task.id} task={task} onDrop={handleDrop} />
                ))}
            </View>

            <View style={styles.dropSection}>
                {[0, 1, 2, 3].map((i) => (
                    <View
                        key={i}
                        style={[styles.slot, { backgroundColor: slots[i] ? '#A5D6A7' : '#E0E0E0' }]}
                        ref={el => { slotRefs.current[i] = el; }}
                        onLayout={() => {
                            if (slotRefs.current[i]) {
                                slotRefs.current[i].measureInWindow((x: number, y: number, w: number, h: number) => {
                                    slotLayoutsRef.current[i] = { x, y, width: w, height: h };
                                });
                            }
                        }}
                    >
                        {slots[i] ? (
                            <>
                                <Image source={slots[i].icon} style={styles.slotImage} />
                                <Text style={styles.slotText}>{slots[i].text} ✔</Text>
                            </>
                        ) : (
                            <Text style={styles.slotPlaceholder}>Step {i + 1}</Text>
                        )}
                    </View>
                ))}
            </View>

            <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedback}</Text>
            </View>
        </View>
    );
}


function DraggableItem({ task, onDrop }: { task: any, onDrop: (task: any, gesture: any) => void }) {
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                task.pan.setOffset({
                    x: (task.pan.x as any)._value,
                    y: (task.pan.y as any)._value
                });
                task.pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: task.pan.x, dy: task.pan.y }], { useNativeDriver: false }),
            onPanResponderRelease: (e, gesture) => {
                task.pan.flattenOffset();
                onDrop(task, gesture);
            }
        })
    ).current;

    const bgColor = task.val.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFF9C4', '#FFCDD2'] // Yellow to Red glow
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.taskBox,
                {
                    left: task.pan.x,
                    top: task.pan.y,
                    backgroundColor: bgColor,
                }
            ]}
        >
            <Image source={task.icon} style={styles.taskImage} />
            <Text style={styles.taskText}>{task.text}</Text>
        </Animated.View>
    );
}


const styles = StyleSheet.create({
    menuContainer: { flex: 1, backgroundColor: '#EAF7F0', justifyContent: 'center', alignItems: 'center', padding: 20 },
    menuTitle: { fontSize: isTablet ? 40 : 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 40, textAlign: 'center' },
    menuBtn: { width: '90%', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
    menuBtnText: { fontSize: isTablet ? 24 : 18, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },

    gameContainer: { flex: 1, backgroundColor: '#EAF7F0' },
    topSection: { height: '15%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    homeButton: { backgroundColor: '#A5D6A7', padding: 10, borderRadius: 8, marginRight: 10 },
    homeButtonText: { fontSize: isTablet ? 20 : 16, fontWeight: 'bold', color: '#2E7D32' },
    scenarioLabel: { fontSize: isTablet ? 28 : 18, fontWeight: 'bold', color: '#2C3E50', flexShrink: 1 },

    middleSection: { height: '50%', position: 'relative' },

    dropSection: { height: '25%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    slot: { width: SLOT_SIZE, height: SLOT_SIZE, borderRadius: 15, justifyContent: 'center', alignItems: 'center', padding: 5 },
    slotPlaceholder: { fontSize: isTablet ? 24 : 14, fontWeight: 'bold', color: '#7F8C8D' },
    slotImage: { width: '100%', height: '60%', resizeMode: 'contain' },
    slotText: { fontSize: isTablet ? 16 : 10, fontWeight: 'bold', color: '#27AE60', marginTop: 5, textAlign: 'center' },

    feedbackSection: { height: '10%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
    feedbackText: { fontSize: isTablet ? 32 : 20, fontWeight: 'bold', textAlign: 'center' },

    taskBox: {
        position: 'absolute',
        width: TASK_WIDTH,
        height: TASK_HEIGHT,
        borderRadius: 15,
        padding: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskImage: { width: '100%', height: '60%', resizeMode: 'contain' },
    taskText: { fontSize: isTablet ? 16 : 10, fontWeight: 'bold', color: '#333', marginTop: 2, textAlign: 'center' }
});
