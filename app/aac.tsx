import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AAC_BUTTONS, AAC_CATEGORIES, AACButton } from '../constants/aacData';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
interface SentenceWord {
    label: string;
    speech: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────────────────────
export default function AACScreen() {
    const router = useRouter();

    // Sentence state
    const [sentence, setSentence] = useState<SentenceWord[]>([]);

    // Category filter – null = show all
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Voice settings
    const [pitch, setPitch] = useState<number>(1.1);
    const [rate, setRate] = useState<number>(0.9);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Whether TTS is currently speaking (to show visual feedback)
    const [speaking, setSpeaking] = useState(false);

    // ── Speech helper ────────────────────────────────────────────────────
    const speak = useCallback(
        (text: string) => {
            // Stop any ongoing speech first
            Speech.stop();
            setSpeaking(true);
            Speech.speak(text, {
                language: 'en-US',
                pitch,
                rate,
                onDone: () => setSpeaking(false),
                onStopped: () => setSpeaking(false),
                onError: () => setSpeaking(false),
            });
        },
        [pitch, rate],
    );

    // ── Sentence actions ─────────────────────────────────────────────────
    const addToSentence = useCallback(
        (btn: AACButton) => {
            setSentence((s) => [...s, { label: btn.label, speech: btn.speech }]);
            speak(btn.speech); // speak single word immediately (like desktop)
        },
        [speak],
    );

    const speakSentence = useCallback(() => {
        if (sentence.length === 0) return;
        speak(sentence.map((w) => w.speech).join(', '));
    }, [sentence, speak]);

    const removeLastWord = useCallback(() => {
        setSentence((s) => s.slice(0, -1));
    }, []);

    const clearSentence = useCallback(() => {
        Speech.stop();
        setSentence([]);
    }, []);

    // ── Filtered buttons ─────────────────────────────────────────────────
    const visibleButtons = useMemo(
        () =>
            activeCategory
                ? AAC_BUTTONS.filter((b) => b.category === activeCategory)
                : AAC_BUTTONS,
        [activeCategory],
    );

    // ── Category toggle (tap same = deselect / show all) ─────────────────
    const toggleCategory = useCallback((catId: string) => {
        setActiveCategory((prev) => (prev === catId ? null : catId));
    }, []);

    // ────────────────────────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* ── TOP BAR: Sentence Builder ────────────────────────────────── */}
            <View style={styles.sentenceBuilderBox}>

                {/* Home */}
                <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
                    <Text style={styles.homeButtonText}>🏠 Home</Text>
                </TouchableOpacity>

                {/* Sentence chip display */}
                <View style={styles.sentenceDisplay}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, alignItems: 'center', paddingHorizontal: 5 }}
                    >
                        {sentence.length === 0 ? (
                            <Text style={styles.placeholderText}>Tap a card to build a sentence…</Text>
                        ) : (
                            sentence.map((word, i) => (
                                <View key={i} style={styles.sentenceChip}>
                                    <Text style={styles.sentenceText}>{word.label}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Backspace */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.backspaceButton]}
                    onPress={removeLastWord}
                    disabled={sentence.length === 0}
                >
                    <Text style={styles.backspaceText}>⌫</Text>
                </TouchableOpacity>

                {/* Speak sentence */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.speakButton, speaking && styles.speakButtonActive]}
                    onPress={speakSentence}
                >
                    <Text style={styles.speakButtonText}>{speaking ? '🔊…' : '🔊 Speak'}</Text>
                </TouchableOpacity>

                {/* Clear */}
                <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearSentence}>
                    <Text style={styles.clearButtonText}>❌ Clear</Text>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity style={[styles.actionButton, styles.settingsButton]} onPress={() => setSettingsVisible(true)}>
                    <Text style={styles.settingsText}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* ── BODY: Sidebar + Grid ─────────────────────────────────────── */}
            <View style={styles.contentArea}>

                {/* Sidebar: Categories */}
                <View style={styles.sidebar}>
                    <ScrollView contentContainerStyle={{ gap: 10, padding: 12 }}>

                        {/* "All" button */}
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                { backgroundColor: '#FFFFFF' },
                                activeCategory === null && styles.categoryButtonActive,
                            ]}
                            onPress={() => setActiveCategory(null)}
                        >
                            <Text style={styles.categoryText}>All</Text>
                        </TouchableOpacity>

                        {AAC_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryButton,
                                    { backgroundColor: cat.color },
                                    activeCategory === cat.id && styles.categoryButtonActive,
                                ]}
                                onPress={() => toggleCategory(cat.id)}
                            >
                                <Text style={styles.categoryText}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Grid: AAC Buttons */}
                <View style={styles.aacGrid}>
                    <ScrollView
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {visibleButtons.map((btn, i) => (
                            <AACGridButton key={`${btn.category}-${btn.label}-${i}`} btn={btn} onPress={addToSentence} />
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* ── VOICE SETTINGS MODAL ─────────────────────────────────────── */}
            <VoiceSettingsModal
                visible={settingsVisible}
                pitch={pitch}
                rate={rate}
                onPitchChange={setPitch}
                onRateChange={setRate}
                onClose={() => setSettingsVisible(false)}
                onTest={() => speak('Hello! This is a test of the voice settings.')}
            />
        </View>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-component: AAC grid button (memoised to avoid re-render on every tap)
// ────────────────────────────────────────────────────────────────────────────
const AACGridButton = React.memo(function AACGridButton({
    btn,
    onPress,
}: {
    btn: AACButton;
    onPress: (btn: AACButton) => void;
}) {
    const [pressed, setPressed] = useState(false);

    return (
        <TouchableOpacity
            style={[styles.aacButton, pressed && styles.aacButtonPressed]}
            onPress={() => onPress(btn)}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            activeOpacity={0.85}
        >
            <Text style={styles.aacIcon}>{btn.icon}</Text>
            <Text style={styles.aacLabel} numberOfLines={2}>
                {btn.label}
            </Text>
        </TouchableOpacity>
    );
});

// ────────────────────────────────────────────────────────────────────────────
// Sub-component: Voice settings modal
// ────────────────────────────────────────────────────────────────────────────
function VoiceSettingsModal({
    visible,
    pitch,
    rate,
    onPitchChange,
    onRateChange,
    onClose,
    onTest,
}: {
    visible: boolean;
    pitch: number;
    rate: number;
    onPitchChange: (v: number) => void;
    onRateChange: (v: number) => void;
    onClose: () => void;
    onTest: () => void;
}) {
    const pitchSteps = [0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6];
    const rateSteps = [0.5, 0.7, 0.9, 1.0, 1.2, 1.5];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={modal.overlay}>
                <View style={modal.box}>
                    <Text style={modal.title}>🔊 Voice Settings</Text>

                    {/* Pitch */}
                    <Text style={modal.label}>Pitch</Text>
                    <View style={modal.row}>
                        {pitchSteps.map((v) => (
                            <TouchableOpacity
                                key={v}
                                style={[modal.chip, pitch === v && modal.chipActive]}
                                onPress={() => onPitchChange(v)}
                            >
                                <Text style={[modal.chipText, pitch === v && modal.chipTextActive]}>
                                    {v.toFixed(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Rate */}
                    <Text style={modal.label}>Speed</Text>
                    <View style={modal.row}>
                        {rateSteps.map((v) => (
                            <TouchableOpacity
                                key={v}
                                style={[modal.chip, rate === v && modal.chipActive]}
                                onPress={() => onRateChange(v)}
                            >
                                <Text style={[modal.chipText, rate === v && modal.chipTextActive]}>
                                    {v === 0.5 ? 'Slow' : v === 0.7 ? 'Easy' : v === 0.9 ? 'Normal' : v === 1.0 ? 'Std' : v === 1.2 ? 'Fast' : 'Very Fast'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Test + Close */}
                    <View style={modal.actions}>
                        <TouchableOpacity style={modal.testBtn} onPress={onTest}>
                            <Text style={modal.testBtnText}>▶ Test Voice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
                            <Text style={modal.closeBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // ── Screen ──────────────────────────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },

    // ── Top bar ─────────────────────────────────────────────────────────────
    sentenceBuilderBox: {
        minHeight: 90,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        // Shadow
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    homeButton: {
        backgroundColor: '#FFE082',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    homeButtonText: {
        color: '#E65100',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sentenceDisplay: {
        flex: 1,
        height: 60,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        borderColor: '#90CAF9',
        borderWidth: 1.5,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    placeholderText: {
        color: '#90CAF9',
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
    },
    sentenceChip: {
        backgroundColor: '#E3F2FD',
        borderColor: '#64B5F6',
        borderWidth: 1.5,
        borderRadius: 18,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    sentenceText: {
        color: '#1565C0',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // ── Action buttons in top bar ────────────────────────────────────────────
    actionButton: {
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backspaceButton: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FFB74D',
        borderWidth: 1.5,
    },
    backspaceText: {
        color: '#E65100',
        fontSize: 22,
        fontWeight: 'bold',
    },
    speakButton: {
        backgroundColor: '#81C784',
    },
    speakButtonActive: {
        backgroundColor: '#43A047',
    },
    speakButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#E57373',
    },
    clearButtonText: {
        color: '#B71C1C',
        fontSize: 18,
        fontWeight: 'bold',
    },
    settingsButton: {
        backgroundColor: '#EDE7F6',
    },
    settingsText: {
        fontSize: 22,
    },

    // ── Body ─────────────────────────────────────────────────────────────────
    contentArea: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },

    // ── Sidebar ──────────────────────────────────────────────────────────────
    sidebar: {
        flex: 0.25,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        // Shadow
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryButton: {
        minHeight: 60,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#B0BEC5',
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    categoryButtonActive: {
        borderWidth: 3,
        borderColor: '#1565C0',
        shadowColor: '#1565C0',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
    },
    categoryText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#455A64',
        textAlign: 'center',
    },

    // ── Main grid ────────────────────────────────────────────────────────────
    aacGrid: {
        flex: 0.75,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        // Shadow
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    gridContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 14,
    },
    aacButton: {
        width: '22%',
        minWidth: 120,
        height: 170,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderColor: '#E0E0E0',
        borderWidth: 1.2,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        // Drop shadow
        shadowColor: '#90A4AE',
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 2, height: 2 },
        elevation: 3,
    },
    aacButtonPressed: {
        backgroundColor: '#E3F2FD',
        borderColor: '#64B5F6',
        shadowOpacity: 0.04,
        elevation: 1,
        transform: [{ scale: 0.96 }],
    },
    aacIcon: {
        fontSize: 52,
        flex: 1,
        textAlignVertical: 'center',
        textAlign: 'center',
    },
    aacLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        flexShrink: 1,
    },
});

// ── Modal styles ─────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 28,
        gap: 16,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555555',
        marginBottom: -8,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F4F8',
        borderWidth: 1.5,
        borderColor: '#CFD8DC',
    },
    chipActive: {
        backgroundColor: '#1565C0',
        borderColor: '#1565C0',
    },
    chipText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#455A64',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    testBtn: {
        flex: 1,
        backgroundColor: '#81C784',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    testBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeBtn: {
        flex: 1,
        backgroundColor: '#7B1FA2',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
