import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Animated, PanResponder, Dimensions } from 'react-native';
import { saveGameProgress } from '../../utils/storage';

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
const sizeBase = Math.min(width, height);
const SLOT_SIZE = isTablet ? sizeBase * 0.22 : sizeBase * 0.26;
const TASK_WIDTH = isTablet ? sizeBase * 0.24 : sizeBase * 0.28;
const TASK_HEIGHT = isTablet ? sizeBase * 0.24 : sizeBase * 0.28;

export default function RoutineBuilder() {
    const router = useRouter();

    const [level, setLevel] = useState<number | null>(null);
    const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const failedAttemptsRef = useRef(0);
    const [shuffledTasks, setShuffledTasks] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([null, null, null, null]);
    const [feedback, setFeedback] = useState("");
    const [feedbackColor, setFeedbackColor] = useState("#333");
    const [startTime, setStartTime] = useState<number>(0);
    const [totalGameMisses, setTotalGameMisses] = useState<number>(0);

    const slotRefs = useRef<any[]>([]);
    const slotLayoutsRef = useRef<any[]>([]);

    useEffect(() => {
        if (level) {
            loadScenario();
            // Reliable measurement after paint
            const timer = setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    if (slotRefs.current[i]) {
                        slotRefs.current[i].measureInWindow((x: number, y: number, w: number, h: number) => {
                            if (w > 0 && h > 0) {
                                slotLayoutsRef.current[i] = { x, y, width: w, height: h };
                            }
                        });
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [level, currentScenarioIdx]);

    const loadScenario = () => {
        if (currentScenarioIdx >= SCENARIOS.length) {
            setFeedback("All Scenarios Complete 🎉");
            setFeedbackColor("#2C3E50");
            setShuffledTasks([]);

            if (level !== null && startTime > 0) {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                const totalSteps = SCENARIOS.reduce((acc, curr) => acc + curr.steps.length, 0);
                const accuracy = totalSteps > 0 ? Math.round((totalSteps / (totalSteps + totalGameMisses)) * 100) : 0;
                saveGameProgress('routine_builder', {
                    level,
                    timeSpent,
                    accuracy,
                    score: totalSteps * 10,
                    totalMisses: totalGameMisses
                });
            }
            return;
        }

        const scenario = SCENARIOS[currentScenarioIdx];
        const steps = [...scenario.steps].sort(() => 0.5 - Math.random());

        // Calculate positions for the tray area
        const trayY = height * 0.58; // Shifted slightly lower to prevent overlapping the prompt text
        const spacingX = width * 0.22; // Tighter spacing to ensure they fit horizontally
        const startX = width * 0.08;

        const positions = [
            { x: startX, y: trayY },
            { x: startX + spacingX, y: trayY },
            { x: startX + spacingX * 2, y: trayY },
            { x: startX + spacingX * 3, y: trayY },
        ].sort(() => 0.5 - Math.random());

        const tasksWithPos = steps.map((s, i) => ({
            ...s,
            id: `task-${Date.now()}-${Math.random()}-${i}`,
            initialPos: positions[i],
            pan: new Animated.ValueXY(positions[i]),
            val: new Animated.Value(0), // for glow
        }));

        setShuffledTasks(tasksWithPos);
        setSlots([null, null, null, null]);
        setCurrentStepIdx(0);
        failedAttemptsRef.current = 0;
        setFeedback("");
    };

    const handleDrop = (task: any, gesture: any) => {
        // Calculate drop point
        const dropX = gesture.moveX;
        const dropY = gesture.moveY;

        let droppedSlotIdx = -1;
        const forgiveness = 40;

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
        failedAttemptsRef.current = 0;

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
        Animated.sequence([
            Animated.timing(task.pan.x, { toValue: (task.pan.x as any)._value - 15, duration: 50, useNativeDriver: false }),
            Animated.timing(task.pan.x, { toValue: (task.pan.x as any)._value + 15, duration: 50, useNativeDriver: false }),
            Animated.timing(task.pan.x, { toValue: (task.pan.x as any)._value - 15, duration: 50, useNativeDriver: false }),
            Animated.spring(task.pan, { toValue: task.initialPos, useNativeDriver: false })
        ]).start();

        setFeedback("❌ Try Again");
        setFeedbackColor("#E74C3C");
        failedAttemptsRef.current += 1;
        setTotalGameMisses(prev => prev + 1);

        if (level === 2) {
            // Level 2 resets the board smoothly without re-shuffling
            setTimeout(() => {
                setSlots(prevSlots => {
                    const itemsToReturn = prevSlots.filter(s => s !== null);
                    setShuffledTasks(prevTasks => {
                        const combined = [...prevTasks, ...itemsToReturn];
                        // Animate returning items to their initial tray pos
                        itemsToReturn.forEach(item => {
                            Animated.spring(item.pan, {
                                toValue: item.initialPos,
                                useNativeDriver: false
                            }).start();
                        });
                        return combined;
                    });
                    return [null, null, null, null];
                });
                setCurrentStepIdx(0);

                if (failedAttemptsRef.current >= 3) {
                    setFeedback("Watch the correct order 👀");
                    setFeedbackColor("#F39C12");
                    playLevel2Hint();
                    failedAttemptsRef.current = 0;
                } else {
                    setFeedback("Sequence broken. Start over!");
                    setFeedbackColor("#E74C3C");
                }
            }, 1000);
        } else {
            // Level 1 highlights target after 3 fails
            if (failedAttemptsRef.current >= 3) {
                const targetText = SCENARIOS[currentScenarioIdx].steps[currentStepIdx].text;
                setShuffledTasks(prevTasks => {
                    const targetTask = prevTasks.find(t => t.text === targetText);
                    if (targetTask) {
                        glowTask(targetTask, 1, 0, 0); // Red pulse
                    }
                    return prevTasks;
                });
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
                <TouchableOpacity style={[styles.menuBtn, { backgroundColor: '#4CAF50' }]} onPress={() => { setLevel(1); setCurrentScenarioIdx(0); setCurrentStepIdx(0); setStartTime(Date.now()); setTotalGameMisses(0); }}>
                    <Text style={styles.menuBtnText}>Level 1 (With Hints & Forgiving Drops)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuBtn, { backgroundColor: '#E53935' }]} onPress={() => { setLevel(2); setCurrentScenarioIdx(0); setCurrentStepIdx(0); setStartTime(Date.now()); setTotalGameMisses(0); }}>
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

            <View style={styles.sequenceSection}>
                {[0, 1, 2, 3].map((i) => {
                    const isCompleted = i < currentStepIdx;
                    const isActive = i === currentStepIdx;
                    const isLocked = i > currentStepIdx;

                    return (
                        <React.Fragment key={i}>
                            <View
                                style={[styles.slot, {
                                    backgroundColor: isCompleted ? '#A5D6A7' : (isActive ? '#FFF9C4' : '#E0E0E0'),
                                    borderColor: isActive ? '#F39C12' : '#BDBDBD',
                                    borderWidth: isActive ? 4 : 2,
                                    opacity: isCompleted ? 0.6 : (isLocked ? 0.5 : 1)
                                }]}
                                ref={el => { slotRefs.current[i] = el; }}
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
                            {i < 3 && <Text style={styles.arrowText}>➔</Text>}
                        </React.Fragment>
                    )
                })}
            </View>

            <View style={styles.traySection}>
                <Text style={styles.trayTitle}>Available Tasks (Drag to sequence):</Text>
            </View>

            {/* Draggables must be rendered after all static sections so they float on top */}
            {shuffledTasks.map((task, i) => (
                <DraggableItem
                    key={task.id}
                    task={task}
                    onDrop={handleDrop}
                />
            ))}

            <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedback}</Text>
            </View>
        </View>
    );
}


function DraggableItem({ task, onDrop }: { task: any, onDrop: (task: any, gesture: any) => void }) {
    const onDropRef = useRef(onDrop);

    useEffect(() => {
        onDropRef.current = onDrop;
    }, [onDrop]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                task.pan.stopAnimation();
                task.pan.setOffset({
                    x: (task.pan.x as any)._value,
                    y: (task.pan.y as any)._value
                });
                task.pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: task.pan.x, dy: task.pan.y }], { useNativeDriver: false }),
            onPanResponderRelease: (e, gesture) => {
                task.pan.flattenOffset();
                onDropRef.current(task, gesture);
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
    menuContainer: { flex: 1, backgroundColor: '#EAF7F0', justifyContent: 'center', alignItems: 'center', padding: 10 },
    menuTitle: { fontSize: isTablet ? 32 : 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20, textAlign: 'center' },
    menuBtn: { width: '80%', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
    menuBtnText: { fontSize: isTablet ? 20 : 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },

    gameContainer: { flex: 1, backgroundColor: '#EAF7F0' },
    topSection: { height: '12%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    homeButton: { backgroundColor: '#A5D6A7', padding: 8, borderRadius: 8, marginRight: 10 },
    homeButtonText: { fontSize: isTablet ? 18 : 14, fontWeight: 'bold', color: '#2E7D32' },
    scenarioLabel: { fontSize: isTablet ? 24 : 16, fontWeight: 'bold', color: '#2C3E50', flexShrink: 1 },

    sequenceSection: { height: '28%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
    arrowText: { fontSize: isTablet ? 20 : 14, color: '#7F8C8D', marginHorizontal: 2 },
    slot: { width: SLOT_SIZE, height: SLOT_SIZE, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 5, borderWidth: 2, borderColor: '#BDBDBD', borderStyle: 'dashed' },
    slotPlaceholder: { fontSize: isTablet ? 16 : 10, fontWeight: 'bold', color: '#7F8C8D', textAlign: 'center' },
    slotImage: { width: '100%', height: '55%', resizeMode: 'contain' },
    slotText: { fontSize: isTablet ? 10 : 8, fontWeight: 'bold', color: '#27AE60', marginTop: 4, textAlign: 'center' },

    traySection: { height: '45%', backgroundColor: '#D5F5E3', marginHorizontal: 15, borderRadius: 16, paddingTop: 10, alignItems: 'center', borderWidth: 2, borderColor: '#A9DFBF' },
    trayTitle: { fontSize: isTablet ? 18 : 12, fontWeight: 'bold', color: '#2C3E50' },

    feedbackSection: { height: '15%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
    feedbackText: { fontSize: isTablet ? 26 : 16, fontWeight: 'bold', textAlign: 'center' },

    taskBox: {
        position: 'absolute',
        width: TASK_WIDTH,
        height: TASK_HEIGHT,
        borderRadius: 12,
        padding: 5,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    taskImage: { width: '100%', height: '55%', resizeMode: 'contain' },
    taskText: { fontSize: isTablet ? 10 : 8, fontWeight: 'bold', color: '#333', marginTop: 2, textAlign: 'center' }
});
