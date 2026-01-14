import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { StatusBar } from 'expo-status-bar';

// Colors
const colors = {
    bg: '#0f172a',
    bgCard: 'rgba(255,255,255,0.05)',
    primary: '#06b6d4',
    text: '#f8fafc',
    textMuted: 'rgba(248,250,252,0.6)',
    border: 'rgba(255,255,255,0.1)',
    danger: '#f43f5e',
};

export default function ReportScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const routeId = params.routeId as string;
    const routeName = params.routeName as string;

    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Simple mock picker for types (can be enhanced with a real picker)
    const [type, setType] = useState('correction'); // 'correction', 'report_issue'

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Error', 'Please describe the issue');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Auth Required', 'Please login to submit reports', [
                    { text: 'Login', onPress: () => router.push('/auth') },
                    { text: 'Cancel', style: 'cancel' }
                ]);
                return;
            }

            const { data: contributionData, error } = await supabase
                .from('contributions')
                .insert({
                    user_id: user.id,
                    route_id: routeId || null,
                    type: type,
                    data: { description: description, related_route: routeName },
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            // Trigger AI Verification (Fire and Forget)
            if (contributionData) {
                supabase.functions.invoke('ai-verify', {
                    body: {
                        type,
                        data: { description, related_route: routeName },
                        context: {
                            routeId,
                            routeName,
                            contribution_id: contributionData.id // Pass ID so AI can update it
                        }
                    }
                }).catch(err => console.log('AI Verify Error:', err));
            }

            Alert.alert('Thank You!', 'Your report has been submitted for review. An AI agent is checking it now!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.title}>Report Issue</Text>
                {routeName && (
                    <Text style={styles.subtitle}>Relating to Route {routeName}</Text>
                )}
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>What{"'"}s wrong?</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'correction' && styles.typeButtonActive]}
                            onPress={() => setType('correction')}
                        >
                            <Text style={[styles.typeText, type === 'correction' && styles.typeTextActive]}>Wrong Info</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'report_issue' && styles.typeButtonActive]}
                            onPress={() => setType('report_issue')}
                        >
                            <Text style={[styles.typeText, type === 'report_issue' && styles.typeTextActive]}>Service Issue</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Details</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="e.g. The bus stop location is incorrect..."
                        placeholderTextColor={colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#0f172a" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                    )}
                </TouchableOpacity>
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
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    input: {
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
    },
    textArea: {
        minHeight: 120,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonText: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: 'bold',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        backgroundColor: colors.bgCard,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeButtonActive: {
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderColor: colors.primary,
    },
    typeText: {
        color: colors.textMuted,
        fontWeight: '500',
    },
    typeTextActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});
