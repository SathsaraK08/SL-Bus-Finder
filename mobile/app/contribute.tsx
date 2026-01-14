import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

// Colors (matching app theme)
const colors = {
    bg: '#0f172a',
    bgCard: 'rgba(255,255,255,0.05)',
    primary: '#06b6d4',
    text: '#f8fafc',
    textMuted: 'rgba(248,250,252,0.6)',
    border: 'rgba(255,255,255,0.1)',
    success: '#10b981',
};

export default function ContributeScreen() {
    const router = useRouter();
    const [routeNumber, setRouteNumber] = useState('');
    const [routeName, setRouteName] = useState('');
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');

    const handleSubmit = () => {
        if (!routeNumber || !routeName || !startPoint || !endPoint) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Here we would submit to backend
        Alert.alert(
            'Success',
            'Thank you for your contribution! It will be verified by the community.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Add New Route</Text>
                <Text style={styles.subtitle}>
                    Help the community by adding missing bus routes.
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Route Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 138"
                        placeholderTextColor={colors.textMuted}
                        value={routeNumber}
                        onChangeText={setRouteNumber}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Route Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Pettah - Maharagama"
                        placeholderTextColor={colors.textMuted}
                        value={routeName}
                        onChangeText={setRouteName}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Start Point</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Pettah"
                            placeholderTextColor={colors.textMuted}
                            value={startPoint}
                            onChangeText={setStartPoint}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>End Point</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Maharagama"
                            placeholderTextColor={colors.textMuted}
                            value={endPoint}
                            onChangeText={setEndPoint}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Route</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 40, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 }}>
                    <Text style={[styles.label, { marginBottom: 10 }]}>Developer Tools</Text>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.primary }]}
                        onPress={async () => {
                            try {
                                const { seedDatabase } = await import('../src/lib/seed');
                                await seedDatabase();
                                Alert.alert('Success', 'Database seeded with initial data!');
                            } catch (e) {
                                const message = e instanceof Error ? e.message : 'An unknown error occurred';
                                Alert.alert('Error', message);
                            }
                        }}
                    >
                        <Text style={[styles.submitButtonText, { color: colors.primary }]}>☁️ Upload Initial Data</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        color: colors.text,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
