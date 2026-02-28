import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Dummy tasks similar to python backend
const initialTasks = [
    { id: '1', time: '08:00', task: 'Wake Up', status: 'pending' },
    { id: '2', time: '08:30', task: 'Breakfast', status: 'pending' },
    { id: '3', time: '10:00', task: 'Study', status: 'done' },
];

export default function SchedulerScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newTime, setNewTime] = useState('');
    const [newTaskName, setNewTaskName] = useState('');

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const moveTask = (id: string, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const addTask = () => {
        if (newTime && newTaskName) {
            setTasks(prev => [...prev, { id: Date.now().toString(), time: newTime, task: newTaskName, status: 'pending' }]);
            setModalVisible(false);
            setNewTime('');
            setNewTaskName('');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Daily Schedule</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>+ Add Task</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* To Do Column */}
                <View style={[styles.column, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}>
                    <Text style={[styles.columnTitle, { color: '#FF6961' }]}>To Do</Text>
                    <ScrollView style={styles.scrollView}>
                        {pendingTasks.map((t) => (
                            <TouchableOpacity key={t.id} style={styles.taskCard} onPress={() => moveTask(t.id, 'done')}>
                                <Text style={styles.taskTime}>{t.time}</Text>
                                <Text style={styles.taskName}>{t.task}</Text>
                                <Text style={styles.helperText}>(Tap to complete)</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Done Column */}
                <View style={[styles.column, { backgroundColor: 'rgba(204, 255, 204, 0.5)' }]}>
                    <Text style={[styles.columnTitle, { color: '#77DD77' }]}>Done!</Text>
                    <ScrollView style={styles.scrollView}>
                        {doneTasks.map((t) => (
                            <TouchableOpacity key={t.id} style={[styles.taskCard, { opacity: 0.6 }]} onPress={() => moveTask(t.id, 'pending')}>
                                <Text style={styles.taskTime}>{t.time}</Text>
                                <Text style={styles.taskName}>{t.task}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* Add Task Popup */}
            <Modal visible={isModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Task</Text>

                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Time:</Text>
                            <TextInput style={styles.input} placeholder="HH:MM" value={newTime} onChangeText={setNewTime} />
                        </View>

                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Task:</Text>
                            <TextInput style={styles.input} placeholder="Task name" value={newTaskName} onChangeText={setNewTaskName} />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF6961' }]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#77DD77' }]} onPress={addTask}>
                                <Text style={styles.modalButtonText}>Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5E6',
    },
    header: {
        flexDirection: 'row',
        height: 80,
        backgroundColor: '#FFDAB9',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30, // for safe area
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#555555',
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#77DD77',
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        padding: 20,
        gap: 20,
    },
    column: {
        flex: 1,
        borderRadius: 15,
        padding: 15,
    },
    columnTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    taskCard: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    taskTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    taskName: {
        fontSize: 18,
        color: '#333',
        marginTop: 5,
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    inputLabel: {
        width: 60,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});
