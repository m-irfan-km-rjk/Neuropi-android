import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Animated, PanResponder, Dimensions, ScrollView } from 'react-native';

const DOMAINS = {
    counting: {
        items: [
            { icon: "🍌", image: null },
            { icon: "🍎", image: null },
            { icon: "🧸", image: null },
            { icon: "🍓", image: null },
            { icon: "⚽", image: null },
            { icon: "🚗", image: null },
            { icon: "📚", image: null }
        ]
    },
    comparison: {
        items: [
            { icon: "🚗", image: null },
            { icon: "🍓", image: null },
            { icon: "🎈", image: null },
            { icon: "🐶", image: null }
        ]
    },
    money: {
        items: [
            { name: "Candy", icon: "🍬", image: null, price: 10 },
            { name: "Notebook", icon: "📘", image: null, price: 20 },
            { name: "Toy", icon: "🧸", image: null, price: 50 },
            { name: "Milk", icon: "🥛", image: null, price: 30 },
            { name: "Backpack", icon: "🎒", image: null, price: 100 }
        ],
        coins: [
            { icon: "🪙", image: require("../../assets/images/10.jpg"), val: 10, label: "Rs.10" },
            { icon: "💵", image: require("../../assets/images/20.jpg"), val: 20, label: "Rs.20" },
            { icon: "💰", image: require("../../assets/images/50.jpg"), val: 50, label: "Rs.50" },
            { icon: "💳", image: require("../../assets/images/100.jpg"), val: 100, label: "Rs.100" },
            { icon: "🏦", image: require("../../assets/images/500.jpg"), val: 500, label: "Rs.500" }
        ]
    },
    daily: {
        questions: [
            { scene: "🌧️", scene_img: null, target: "☂️", options: ["☂️", "🧢", "🎒", "🏃"] },
            { scene: "☀️", scene_img: null, target: "🧢", options: ["☂️", "🧢", "🧤", "🧥"] },
            { scene: "🏫", scene_img: null, target: "🎒", options: ["🎒", "🎮", "📺", "🛌"] },
            { scene: "🍽️", scene_img: null, target: "🥪", options: ["🥪", "⚽", "🚗", "🛁"] },
            { scene: "🥶", scene_img: null, target: "🧥", options: ["🧥", "🩳", "🧊", "🍦"] },
            { scene: "🤕", scene_img: null, target: "🩹", options: ["🩹", "🎮", "⚽", "🍭"] },
            { scene: "🦷", scene_img: null, target: "🪥", options: ["🪥", "👟", "🎩", "🎒"] }
        ]
    },
    safety: {
        questions: [
            { scene: "🚦🔴", target: "🧍 Stop", options: ["🧍 Stop", "🏃 Run", "🚶 Walk", "🚗 Drive"] },
            { scene: "🔥", target: "🚫 Stay Away", options: ["🚫 Stay Away", "✋ Touch", "🔥 Play", "🏃 Run"] },
            { scene: "🔪", target: "🚫 Don't Touch", options: ["🚫 Don't Touch", "✋ Play", "🔪 Grab", "🏃 Run"] },
            { scene: "🚦🟢", target: "🚶 Walk", options: ["🚶 Walk", "🧍 Stop", "🛌 Sleep", "🍽️ Eat"] },
            { scene: "🔌", target: "🚫 Don't Touch", options: ["🚫 Don't Touch", "🔌 Plug", "💧 Water", "🏃 Run"] },
            { scene: "🐕 (Angry)", target: "🚶 Walk Away", options: ["🚶 Walk Away", "✋ Pet", "🏃 Run", "🗣️ Yell"] }
        ]
    }
};

const domainLabels = ["Counting", "Comparison", "Daily Logic", "Money", "Safety"];
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const sizeBase = Math.min(width, height);

type TaskType = {
    id: number;
    text: string;
    icon: string;
    image: any;
    val: number;
    pan: Animated.ValueXY;
    initialPos: { x: number, y: number };
    optionsText?: string;
    isCorrect?: boolean;
    glow: Animated.Value;
};


export default function VisualRealLife() {
    const router = useRouter();

    const [level, setLevel] = useState<number | null>(null);
    const [qIndex, setQIndex] = useState(0);
    const [questionData, setQuestionData] = useState<any>(null);
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [dropZoneItems, setDropZoneItems] = useState<TaskType[]>([]);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [feedbackColor, setFeedbackColor] = useState("#333");

    const dropViewRef = useRef<View>(null);
    const [dropZoneLayout, setDropZoneLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

    useEffect(() => {
        if (level) {
            loadQuestion();
        }
    }, [level, qIndex]);


    const loadQuestion = () => {
        if (qIndex >= 10) {
            setFeedback("All Challenges Complete! 🎉");
            setFeedbackColor("#2C3E50");
            setTasks([]);
            setDropZoneItems([]);
            // Could add auto advance to next level like Kivy implementation
            return;
        }

        setFailedAttempts(0);
        setFeedback("");
        setDropZoneItems([]);

        // Generate Domain logic
        let data: any = {};
        const qDomain = level === 1 ? "counting" : level === 2 ? "comparison" : level === 3 ? "daily" : level === 4 ? "money" : "safety";

        if (qDomain === "counting") {
            const item = DOMAINS.counting.items[Math.floor(Math.random() * DOMAINS.counting.items.length)];
            const qty = Math.floor(Math.random() * 5) + 2;
            data = { type: "drag", domain: qDomain, instruction: `Pick ${qty} ${item.icon}`, target_qty: qty, item };
        } else if (qDomain === "comparison") {
            const isMore = Math.random() > 0.5;
            let opt1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
            let opt2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
            while (opt1 === opt2) {
                opt2 = Math.floor(Math.random() * 5) + 1;
            }
            if (isMore && opt1 > opt2) {
                const temp = opt1; opt1 = opt2; opt2 = temp;
            } else if (!isMore && opt1 < opt2) {
                const temp = opt1; opt1 = opt2; opt2 = temp;
            }
            const item = DOMAINS.comparison.items[Math.floor(Math.random() * DOMAINS.comparison.items.length)];
            const opts = [item.icon.repeat(opt1), item.icon.repeat(opt2)];
            const correct = isMore ? opts[1] : opts[0];
            data = { type: "tap", domain: qDomain, instruction: `Tap the box with ${isMore ? 'MORE' : 'LESS'}`, options: opts, correct };
        } else if (qDomain === "money") {
            const item = DOMAINS.money.items[Math.floor(Math.random() * DOMAINS.money.items.length)];
            data = { type: "drag", domain: qDomain, instruction: `Pay Rs.${item.price} for ${item.icon}`, target_val: item.price, item };
        } else if (qDomain === "daily") {
            const q = DOMAINS.daily.questions[Math.floor(Math.random() * DOMAINS.daily.questions.length)];
            data = { type: "drag", domain: qDomain, instruction: `What do you need? ${q.scene}`, target_single: q.target, options: q.options };
        } else if (qDomain === "safety") {
            const q = DOMAINS.safety.questions[Math.floor(Math.random() * DOMAINS.safety.questions.length)];
            data = { type: "tap", domain: qDomain, instruction: `What to do? ${q.scene}`, options: q.options, correct: q.target };
        }

        setQuestionData(data);

        // Build UI Objects based on type
        const newTasks: TaskType[] = [];

        if (data.type === "drag") {
            let itemsToGen: any[] = [];

            if (data.domain === "counting") {
                const total = data.target_qty + Math.floor(Math.random() * 4) + 2;
                for (let i = 0; i < total; i++) {
                    itemsToGen.push({ text: "", icon: data.item.icon, image: data.item.image, val: 1 });
                }
            } else if (data.domain === "money") {
                const coinsDef = [...DOMAINS.money.coins].sort((a, b) => b.val - a.val);
                let pool = [];
                let remaining = data.target_val;

                for (let c of coinsDef) {
                    while (remaining >= c.val) {
                        pool.push(c);
                        remaining -= c.val;
                    }
                }

                // Add padding random coins
                const randomPool = [...DOMAINS.money.coins, ...DOMAINS.money.coins].sort(() => 0.5 - Math.random());
                for (let i = 0; pool.length < 7 && i < randomPool.length; i++) {
                    pool.push({ ...randomPool[i] });
                }

                pool = pool.sort(() => 0.5 - Math.random());

                for (let c of pool) {
                    itemsToGen.push({ text: c.label, icon: c.icon, image: c.image, val: c.val });
                }
            } else if (data.domain === "daily") {
                let shuffled = [...data.options].sort(() => 0.5 - Math.random());
                for (let o of shuffled) {
                    itemsToGen.push({ text: o, icon: o, image: null, val: 1 });
                }
            }

            // Positions inside Left Tray Container
            const cols = 2;
            const trayW = width * 0.45;
            const trayH = height * 0.7 * 0.9;
            const trayTop = height * 0.7 * 0.05;
            const trayLeft = width * 0.02;

            let approximateW = isTablet ? 120 : 80;
            let approximateH = isTablet ? 120 : 80;
            if (data.domain === "money") { approximateW = isTablet ? 150 : 100; approximateH = isTablet ? 100 : 70; }
            if (data.domain === "counting" || data.domain === "daily") { approximateW = isTablet ? 80 : 50; approximateH = isTablet ? 80 : 50; }

            const startY = trayTop + (isTablet ? 50 : 35); // Title offset
            const stepX = trayW / cols;
            const startX = trayLeft + (stepX - approximateW) / 2;

            const rows = Math.ceil(itemsToGen.length / cols);
            // Calculate vertical spacing so even 6 rows never overflow the container bounds
            const maxUsableHeight = trayH - (isTablet ? 50 : 35) - approximateH;
            const stepY = rows <= 1 ? 0 : Math.min(approximateH + 15, maxUsableHeight / (rows - 1));

            itemsToGen.forEach((it, i) => {
                const c = i % cols;
                const r = Math.floor(i / cols);
                const pos = { x: startX + (c * stepX), y: startY + (r * stepY) };

                newTasks.push({
                    id: Math.random() + i, // Use universally unique ID to prevent React recycling bugs across levels
                    text: it.text,
                    icon: it.icon,
                    image: it.image,
                    val: it.val,
                    initialPos: pos,
                    pan: new Animated.ValueXY(pos),
                    glow: new Animated.Value(0)
                });
            });

        } else {
            // TAP domains
            let shuffled = [...data.options].sort(() => 0.5 - Math.random());
            shuffled.forEach((opt, i) => {
                newTasks.push({
                    id: Math.random() + i, // Universally unique ID
                    text: opt,
                    icon: opt,
                    image: null,
                    val: 1,
                    initialPos: { x: 0, y: 0 },
                    pan: new Animated.ValueXY({ x: 0, y: 0 }),
                    optionsText: opt,
                    isCorrect: opt === data.correct,
                    glow: new Animated.Value(0)
                });
            });
        }

        setTasks(newTasks);
    };

    const handleTap = (task: TaskType) => {
        if (task.isCorrect) {
            correctAction();
        } else {
            wrongAction("❌ Try Again", task);
        }
    };

    const handleDrop = (task: TaskType, gesture: any) => {
        // moveX and moveY are screen coordinates.
        // The drop zone layout might be relative to its parent container.
        // We need to ensure we're comparing screen to screen coordinates or relative to relative.
        // Since `pageX` and `pageY` from `measure()` gives screen coordinates, this comparison *should* work if the measure is correct.
        // However, a common issue is that the dropZone measurement fails or gives 0.
        // Let's add a forgiving boundary area and use a fallback if measurement is wonky on Android.

        let dropArea = dropZoneLayout;
        if (!dropArea || dropArea.width === 0) {
            // Fallback if measurement failed: Approximate based on the styles for dropZoneBase:
            // top: 5%, right: 2%, width: 45%, height: 90%
            // However, the section containing it is `middleSection` which is 70% of screen height below a 15% header.
            const topBoundary = height * 0.15 + (height * 0.7 * 0.05); // Header + 5% of middleSection
            const leftBoundary = width - (width * 0.02) - (width * 0.45); // Right margin + width

            dropArea = {
                x: leftBoundary,
                y: topBoundary,
                width: width * 0.45,
                height: height * 0.7 * 0.90
            };
        }

        const dropX = gesture.moveX;
        const dropY = gesture.moveY;

        // Make the hit area slightly more forgiving
        const forgiveness = 20;

        const isInZone = dropX >= (dropArea.x - forgiveness) &&
            dropX <= (dropArea.x + dropArea.width + forgiveness) &&
            dropY >= (dropArea.y - forgiveness) &&
            dropY <= (dropArea.y + dropArea.height + forgiveness);

        if (!isInZone) {
            // Revert
            Animated.spring(task.pan, { toValue: task.initialPos, useNativeDriver: false }).start();
            return;
        }

        // Logic Check
        const newDropZoneItems = [...dropZoneItems, task];
        setDropZoneItems(newDropZoneItems);

        // Remove from tasks so it disappears from middle section and only shows in drop zone
        setTasks(prev => prev.filter(t => t.id !== task.id));

        let success = false;
        let failed = false;
        let failMsg = "❌ Try Again";

        if (questionData.domain === "counting") {
            if (newDropZoneItems.length === questionData.target_qty) success = true;
            else if (newDropZoneItems.length > questionData.target_qty) {
                failed = true;
                failMsg = "❌ Too many items!";
            } else {
                setFeedback(`Placed ${newDropZoneItems.length}. ${questionData.target_qty - newDropZoneItems.length} more to go!`);
                setFeedbackColor("#2980B9");
            }
        } else if (questionData.domain === "money") {
            const sum = newDropZoneItems.reduce((acc, it) => acc + it.val, 0);
            if (sum === questionData.target_val) success = true;
            else if (sum > questionData.target_val) {
                failed = true;
                failMsg = "❌ Too much money!";
            } else {
                setFeedback(`Added Rs.${sum}. Need Rs.${questionData.target_val - sum} more!`);
                setFeedbackColor("#2980B9");
            }
        } else if (questionData.domain === "daily") {
            if (newDropZoneItems.length === 1) {
                if (newDropZoneItems[0].text === questionData.target_single) success = true;
                else {
                    failed = true;
                    failMsg = "❌ Incorrect object!";
                }
            }
        }

        if (success) {
            correctAction();
        } else if (failed) {
            // Need to empty drop zone visually
            setTimeout(() => {
                wrongAction(failMsg, task, newDropZoneItems);
            }, 500);
        }
    };

    const correctAction = () => {
        setFeedback("✔ Correct! Awesome!");
        setFeedbackColor("#27AE60");

        setTimeout(() => {
            setQIndex(prev => prev + 1);
        }, 1500);
    };

    const wrongAction = (msg: string, task: TaskType, itemsInZone?: TaskType[]) => {
        setFeedback(msg);
        setFeedbackColor("#E74C3C");
        setFailedAttempts(prev => prev + 1);

        if (itemsInZone) {
            // Return pieces to origins
            const returningIds = itemsInZone.map(item => item.id);
            // In react state we just dump them back
            setDropZoneItems([]);
            // Actually we need to remount them in `tasks` with their pan reset

            setTasks(prev => {
                const combined = [...prev, ...itemsInZone];
                itemsInZone.forEach(it => {
                    Animated.spring(it.pan, { toValue: it.initialPos, useNativeDriver: false }).start();
                });
                return combined.sort((a, b) => a.id - b.id);
            });
        }

        if (failedAttempts + 1 >= 3) {
            triggerHint();
        }
    };

    const triggerHint = () => {
        setFeedback("Hint! Look for the glowing area 👀");
        setFeedbackColor("#F39C12");

        if (questionData.type === "drag") {
            if (questionData.domain === "daily") {
                const target = tasks.find(t => t.text === questionData.target_single);
                if (target) glow(target);
            } else if (questionData.domain === "counting") {
                const targetIcon = questionData.item.icon;
                const need = questionData.target_qty - dropZoneItems.length;
                let glowing = 0;
                for (let t of tasks) {
                    if (t.icon === targetIcon) {
                        glow(t);
                        glowing++;
                        if (glowing >= need) break;
                    }
                }
            } else {
                // Dropzone glow (simplified)
            }
        } else {
            const target = tasks.find(t => t.isCorrect);
            if (target) glow(target);
        }
    };

    const glow = (target: TaskType) => {
        Animated.sequence([
            Animated.timing(target.glow, { toValue: 1, duration: 400, useNativeDriver: false }),
            Animated.timing(target.glow, { toValue: 0, duration: 400, useNativeDriver: false })
        ]).start();
    };

    if (!level) {
        return (
            <ScrollView contentContainerStyle={styles.menuContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/games' as any)}>
                        <Text style={styles.homeBtnText}>{'< Home'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.menuTitle}>Visual Real-Life</Text>
                </View>

                <Text style={styles.menuSubtitle}>Choose Your Lesson Level:</Text>

                <View style={styles.lvlBox}>
                    {[1, 2, 3, 4, 5].map(l => (
                        <TouchableOpacity
                            key={l}
                            style={[styles.lvlBtn, { backgroundColor: '#BBDEFB' }]}
                            onPress={() => { setLevel(l); setQIndex(0); }}
                        >
                            <Text style={styles.lvlBtnText}>Lvl {l}</Text>
                            <Text style={styles.lvlBtnTextDesc}>{domainLabels[l - 1]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        );
    }

    return (
        <View style={styles.gameContainer}>
            <View style={styles.gameHeader}>
                <TouchableOpacity style={styles.homeBtn} onPress={() => setLevel(null)}>
                    <Text style={styles.homeBtnText}>{'< Menu'}</Text>
                </TouchableOpacity>
                <Text style={styles.scenarioLbl}>
                    [{Math.min(qIndex + 1, 10)}/10] Lvl {level}:   {questionData?.instruction}
                </Text>
            </View>

            <View style={styles.middleSection}>
                {questionData?.type === "tap" ? (
                    <View style={styles.tapLayout}>
                        {tasks.map((task) => {
                            const bgColor = task.glow.interpolate({ inputRange: [0, 1], outputRange: ['#D6EAF8', '#82E0AA'] });
                            return (
                                <Animated.View key={task.id} style={[styles.tapBox, { backgroundColor: bgColor }]}>
                                    <TouchableOpacity style={styles.tapTouch} onPress={() => handleTap(task)}>
                                        <Text style={styles.tapBoxText}>{task.optionsText}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                ) : (
                    <>
                        <View style={styles.sourceZoneBase}>
                            <Text style={styles.dropZoneTitle}>Available Items</Text>
                        </View>
                        <View
                            style={styles.dropZoneBase}
                            onLayout={(e) => {
                                // measureInWindow can be more reliable than measure sometimes for global coordinates
                                if (dropViewRef.current) {
                                    dropViewRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
                                        setDropZoneLayout({ x, y, width, height });
                                    });
                                }
                            }}
                            ref={dropViewRef}
                        >
                            <Text style={styles.dropZoneTitle}>
                                {questionData?.domain === "counting" ? "Basket 🧺" : questionData?.domain === "money" ? "Shop Counter 🏪" : "Action Box 📦"}
                            </Text>
                            <View style={styles.dropZoneInner}>
                                {dropZoneItems.map((item, idx) => (
                                    <View key={`dz-${item.id}-${idx}`} style={styles.inZoneItem}>
                                        {item.image ? <Image source={item.image} style={styles.zoneImg} /> : <Text style={styles.zoneIcon}>{item.icon}</Text>}
                                        {!!item.text && item.text !== item.icon && <Text style={styles.zoneText}>{item.text}</Text>}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Draggables */}
                        {tasks.map(task => (
                            <DraggableItem key={task.id} task={task} onDrop={handleDrop} isMoney={questionData?.domain === "money"} isCount={questionData?.domain === "counting"} />
                        ))}
                    </>
                )}
            </View>

            <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackText, { color: feedbackColor }]}>{feedback}</Text>
            </View>

        </View>
    );
}

function DraggableItem({ task, onDrop, isMoney, isCount }: { task: TaskType, onDrop: (task: any, gesture: any) => void, isMoney: boolean, isCount: boolean }) {
    const onDropRef = useRef(onDrop);

    useEffect(() => {
        onDropRef.current = onDrop;
    }, [onDrop]);

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
                onDropRef.current(task, gesture);
            }
        })
    ).current;

    const bgColor = task.glow.interpolate({ inputRange: [0, 1], outputRange: ['#FFF9C4', '#F1948A'] });

    let w = isTablet ? 120 : 80;
    let h = isTablet ? 120 : 80;
    if (isMoney) { w = isTablet ? 150 : 100; h = isTablet ? 100 : 70; }
    if (isCount) { w = isTablet ? 80 : 50; h = isTablet ? 80 : 50; } // Matches inZoneItem dimensions

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.taskBox,
                { left: task.pan.x, top: task.pan.y, backgroundColor: bgColor, width: w, height: h }
            ]}
        >
            {task.image ? <Image source={task.image} style={styles.taskImage} /> : <Text style={styles.taskIcon}>{task.icon}</Text>}
            {!!task.text && task.text !== task.icon && <Text style={styles.taskText}>{task.text}</Text>}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    menuContainer: { flexGrow: 1, backgroundColor: '#FDFCF0', padding: 10 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    homeBtn: { backgroundColor: '#90CAF9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 15 },
    homeBtnText: { fontSize: isTablet ? 18 : 14, fontWeight: 'bold', color: '#2C3E50' },
    menuTitle: { fontSize: isTablet ? 32 : 22, fontWeight: 'bold', color: '#2C3E50', flexShrink: 1 },
    menuSubtitle: { fontSize: isTablet ? 20 : 16, color: '#2C3E50', marginBottom: 15 },

    lvlBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    lvlBtn: { padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minWidth: isTablet ? 120 : '45%', flexGrow: 1 },
    lvlBtnText: { fontSize: isTablet ? 20 : 16, fontWeight: 'bold' },
    lvlBtnTextDesc: { fontSize: isTablet ? 14 : 10 },

    gameContainer: { flex: 1, backgroundColor: '#E8F5E9' },
    gameHeader: { height: '12%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    scenarioLbl: { fontSize: isTablet ? 22 : 16, fontWeight: 'bold', color: '#2C3E50', flexShrink: 1 },

    middleSection: { height: '70%', position: 'relative' },
    feedbackSection: { height: '18%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
    feedbackText: { fontSize: isTablet ? 26 : 18, fontWeight: 'bold', textAlign: 'center' },

    sourceZoneBase: {
        position: 'absolute',
        left: '2%',
        top: '5%',
        width: '45%',
        height: '90%',
        backgroundColor: '#E8F6F3',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#A2D9CE',
        borderStyle: 'dashed',
        padding: 5
    },
    dropZoneBase: {
        position: 'absolute',
        right: '2%',
        top: '5%',
        width: '45%',
        height: '90%',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#BDBDBD',
        borderStyle: 'dashed',
        padding: 5
    },
    dropZoneTitle: { fontSize: isTablet ? 18 : 14, fontWeight: 'bold', color: '#666', marginBottom: 4 },
    dropZoneInner: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    inZoneItem: { width: isTablet ? 60 : 40, height: isTablet ? 60 : 40, backgroundColor: '#FFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    zoneImg: { width: '80%', height: '80%', resizeMode: 'contain' },
    zoneIcon: { fontSize: isTablet ? 32 : 20 },
    zoneText: { fontSize: isTablet ? 10 : 8, fontWeight: 'bold', color: '#333' },

    taskBox: {
        position: 'absolute',
        borderRadius: 12,
        padding: 2,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskImage: { width: '80%', height: '80%', resizeMode: 'contain' },
    taskIcon: { fontSize: isTablet ? 32 : 20 }, // Matches zoneIcon exact sizing
    taskText: { fontSize: isTablet ? 10 : 8, fontWeight: 'bold', color: '#333', marginTop: 2, textAlign: 'center', flexShrink: 1 },

    tapLayout: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 10 },
    tapBox: { width: isTablet ? 200 : '40%', height: isTablet ? 100 : 60, borderRadius: 12, borderWidth: 2, borderColor: '#5DADE2', alignItems: 'center', justifyContent: 'center' },
    tapTouch: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    tapBoxText: { fontSize: isTablet ? 28 : 16, textAlign: 'center', fontWeight: 'bold', color: '#333' }

});
