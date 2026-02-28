import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MenuScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Autism Learning Hub</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#FF6961' }]}
                    onPress={() => router.push('/scheduler')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Daily Scheduler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#AEC6CF' }]}
                    onPress={() => router.push('/emotion_selection')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Emotion Exercise</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF0',
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 60,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
        maxWidth: 400,
    },
    button: {
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    }
});
