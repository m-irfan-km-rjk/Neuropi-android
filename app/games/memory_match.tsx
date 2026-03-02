import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SHAPES = [
    { icon: '🔴', color: '#FF8A80' },
    { icon: '🟦', color: '#82B1FF' },
    { icon: '🔺', color: '#B9F6CA' },
    { icon: '🔶', color: '#FFE57F' },
    { icon: '⭐', color: '#FFD180' },
    { icon: '➕', color: '#B388FF' },
    { icon: '⭕', color: '#80CBC4' },
    { icon: '🛑', color: '#F8BBD0' },
];

export default function MemoryMatchScreen() {
    const router = useRouter();

    const [cards, setCards] = useState<any[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<number>(0);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [infoText, setInfoText] = useState<string>("Get ready...");
    const [level, setLevel] = useState<number>(1);
    const [numPairs, setNumPairs] = useState<number>(3); // Level 1 is 3 pairs
    const [consecutiveMisses, setConsecutiveMisses] = useState<number>(0);

    // 1: 3x2 (3 pairs), 2: 4x3 (6 pairs), 3: 4x4 (8 pairs)
    const cols = level === 1 ? 3 : 4;
    const rows = level === 1 ? 2 : (level === 2 ? 3 : 4);

    useEffect(() => {
        startNewGame(level);
    }, [level]);

    const startNewGame = (lvl: number) => {
        const pairs = lvl === 1 ? 3 : (lvl === 2 ? 6 : 8);
        setNumPairs(pairs);

        // Choose pairs random shapes
        let available = [...SHAPES].sort(() => 0.5 - Math.random());
        let chosen = available.slice(0, pairs);

        // Create deck and shuffle
        let deck = [...chosen, ...chosen].sort(() => 0.5 - Math.random());

        setCards(deck.map((item, id) => ({ id, ...item, isFlipped: true, isMatched: false, isWrong: false })));
        setFlippedIndices([]);
        setMatchedPairs(0);
        setConsecutiveMisses(0);
        setIsLocked(true);
        setInfoText("Memorize the tiles!");

        // Preview
        setTimeout(() => {
            setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
            setInfoText("Can you find a match?");
            setIsLocked(false);
        }, 3000);
    };

    const handleCardPress = (index: number) => {
        if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setIsLocked(true);

            const [firstIdx, secondIdx] = newFlippedIndices;
            if (newCards[firstIdx].icon === newCards[secondIdx].icon) {
                // Match!
                setTimeout(() => {
                    let c = [...newCards];
                    c[firstIdx].isMatched = true;
                    c[secondIdx].isMatched = true;
                    setCards(c);
                    setMatchedPairs(prev => prev + 1);
                    setConsecutiveMisses(0);

                    // Clear hints
                    c.forEach(card => card.isHint = false);
                    setCards(c);

                    setFlippedIndices([]);
                    setIsLocked(false);
                    setInfoText("Great match!");
                }, 800);
            } else {
                // No match
                setTimeout(() => {
                    let c = [...newCards];
                    c[firstIdx].isWrong = true;
                    c[secondIdx].isWrong = true;
                    setCards(c);
                    setInfoText("Let's try again.");

                    setTimeout(() => {
                        let cx = [...c];
                        cx[firstIdx].isFlipped = false;
                        cx[secondIdx].isFlipped = false;
                        cx[firstIdx].isWrong = false;
                        cx[secondIdx].isWrong = false;

                        // Check for hint
                        const currentMisses = consecutiveMisses + 1;
                        if (currentMisses >= 3 && matchedPairs < numPairs) {
                            // Find an unrevealed pair
                            const unrevealed = cx.filter(card => !card.isMatched && !card.isFlipped);
                            if (unrevealed.length >= 2) {
                                const targetIcon = unrevealed[0].icon;
                                const pairToHint = cx.filter(card => !card.isMatched && !card.isFlipped && card.icon === targetIcon);
                                if (pairToHint.length >= 2) {
                                    cx[pairToHint[0].id].isHint = true;
                                    cx[pairToHint[1].id].isHint = true;
                                }
                            }
                        }

                        setCards(cx);
                        setFlippedIndices([]);
                        setIsLocked(false);
                    }, 1000);
                }, 500);
                setConsecutiveMisses(prev => prev + 1);
            }
        }
    };

    useEffect(() => {
        if (matchedPairs > 0 && matchedPairs === numPairs) {
            setInfoText("You did it! You matched them all! ★ ★ ★");
        }
    }, [matchedPairs]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Top Bar */}
            <View style={styles.titleBar}>
                <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/games' as any)}>
                    <Text style={styles.buttonText}>{'< Home'}</Text>
                </TouchableOpacity>
                <Text style={styles.titleLabel}>MEMORY MATCH</Text>
                <TouchableOpacity style={styles.restartButton} onPress={() => startNewGame(level)}>
                    <Text style={styles.buttonText}>Restart</Text>
                </TouchableOpacity>
            </View>

            {/* Level bar */}
            <View style={styles.controlsBar}>
                <Text style={styles.levelLabel}>Grid:</Text>
                {[1, 2, 3].map(lvl => (
                    <TouchableOpacity
                        key={lvl}
                        style={[styles.levelBtn, { backgroundColor: level === lvl ? '#66BB6A' : '#C8E6C9' }]}
                        onPress={() => setLevel(lvl)}
                    >
                        <Text style={[styles.levelBtnText, { color: level === lvl ? '#FFF' : '#2E7D32' }]}>
                            {lvl === 1 ? '3x2' : (lvl === 2 ? '4x3' : '4x4')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Progress */}
            <View style={styles.progressWrap}>
                <Text style={styles.progressText}>
                    Progress: {'★ '.repeat(matchedPairs) + '☆ '.repeat(numPairs - matchedPairs)}
                </Text>
            </View>

            {/* Board */}
            <View style={styles.boardWrap}>
                <View style={styles.boardInner}>
                    <View style={[styles.grid, { flexWrap: 'wrap', width: cols * 90, height: rows * 90 }]}>
                        {cards.map((card, index) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={1}
                                style={[
                                    styles.cardStyle,
                                    {
                                        width: 80, height: 80,
                                        backgroundColor: card.isFlipped ? '#FFF' : '#C8E6C9',
                                        borderColor: card.isWrong ? '#E53935' : (card.isHint ? '#FFD700' : (card.isFlipped ? '#E0E0E0' : '#A5D6A7')),
                                        borderWidth: card.isHint || card.isWrong ? 4 : 2,
                                    }
                                ]}
                                onPress={() => handleCardPress(index)}
                            >
                                {card.isFlipped ? (
                                    <Text style={styles.cardIcon}>{card.icon}</Text>
                                ) : (
                                    <Text style={styles.cardQuestionMark}>?</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Info Label */}
            <Text style={styles.infoLabel}>{infoText}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAF7F0',
    },
    scrollContent: {
        padding: 10,
        paddingBottom: 20,
        minHeight: '100%',
    },
    titleBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        marginBottom: 5,
    },
    homeButton: {
        width: 100,
        height: 40,
        backgroundColor: '#A5D6A7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restartButton: {
        width: 100,
        height: 40,
        backgroundColor: '#A5D6A7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    titleLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    controlsBar: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    levelLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginRight: 8,
    },
    levelBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
    },
    levelBtnText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    progressWrap: {
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    progressText: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    boardWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        padding: 10,
    },
    boardInner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardStyle: {
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        margin: 4,
    },
    cardIcon: {
        fontSize: 32,
    },
    cardQuestionMark: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
    },
    infoLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        textAlign: 'center',
        height: 40,
        marginTop: 5,
    }
});
