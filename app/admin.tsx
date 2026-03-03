import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { ScheduleEvent, getSchedule, saveSchedule } from '../utils/scheduleStorage';

export default function AdminScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [icon, setIcon] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        const storedEvents = await getSchedule();
        setEvents(storedEvents);
    };

    const handleAdd = async () => {
        if (!title || !startTime || !endTime || !icon) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const newEvent: ScheduleEvent = {
            id: Date.now().toString(),
            title,
            startTime,
            endTime,
            icon
        };

        const updatedEvents = [...events, newEvent];
        // Sort events by start time
        updatedEvents.sort((a, b) => {
            const timeA = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1]);
            const timeB = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
            return timeA - timeB;
        });

        await saveSchedule(updatedEvents);
        setEvents(updatedEvents);

        setTitle('');
        setStartTime('');
        setEndTime('');
        setIcon('');
    };

    const handleDelete = async (id: string) => {
        const updatedEvents = events.filter(e => e.id !== id);
        await saveSchedule(updatedEvents);
        setEvents(updatedEvents);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Manage Schedule</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Left Column: Add Task */}
                <View style={styles.addFormContainer}>
                    <Text style={styles.sectionTitle}>Add New Task</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Task Title (e.g., Breakfast)"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.timeRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Start (HH:MM)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="08:00"
                                value={startTime}
                                onChangeText={setStartTime}
                            />
                        </View>
                        <View style={{ width: 10 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>End (HH:MM)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="08:30"
                                value={endTime}
                                onChangeText={setEndTime}
                            />
                        </View>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Icon Emoji (e.g., 🥣)"
                        value={icon}
                        onChangeText={setIcon}
                    />

                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                </View>

                {/* Right Column: Schedule List */}
                <View style={styles.scheduleListContainer}>
                    <Text style={styles.sectionTitleBlack}>Current Schedule</Text>
                    <ScrollView>
                        {events.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No tasks scheduled yet.</Text>
                        ) : (
                            events.map(ev => (
                                <View key={ev.id} style={styles.eventRow}>
                                    <Text style={styles.eventIcon}>{ev.icon}</Text>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventTitle}>{ev.title}</Text>
                                        <Text style={styles.eventTime}>{ev.startTime} - {ev.endTime}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(ev.id)}>
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        height: 50,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
    },
    backButton: {
        width: 100,
        paddingVertical: 15,
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        alignItems: 'center',
    },
    backButtonText: {
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        gap: 20,
    },
    addFormContainer: {
        flex: 0.4,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7B1FA2',
        marginBottom: 10,
    },
    sectionTitleBlack: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
    },
    timeRow: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    addButton: {
        backgroundColor: '#7B1FA2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    scheduleListContainer: {
        flex: 0.6,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    eventIcon: {
        fontSize: 40,
        width: 50,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    eventTime: {
        fontSize: 16,
        color: '#666',
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});
