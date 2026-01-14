import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Keyboard, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { BusStop } from '../types';

// Colors (matching app theme)
const colors = {
    bgCard: 'rgba(255,255,255,0.05)',
    primary: '#06b6d4',
    text: '#f8fafc',
    textMuted: 'rgba(248,250,252,0.6)',
    border: 'rgba(255,255,255,0.1)',
};

interface AutocompleteInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    iconColor: string;
    icon: string;
}

export default function AutocompleteInput({
    placeholder,
    value,
    onChangeText,
    iconColor,
    icon,
}: AutocompleteInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<BusStop[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounce logic
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // If value is cleared, clear suggestions
        if (value.length < 2) {
            setSuggestions([]);
            return;
        }

        // Only search if focused
        if (!isFocused) return;

        // Clear previous timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('stops')
                    .select('*')
                    .ilike('name', `%${value}%`)
                    .limit(5);

                if (error) throw error;
                if (data) {
                    setSuggestions(data as BusStop[]);
                }
            } catch (err) {
                console.log('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [value, isFocused]);

    const handleSelect = (stop: BusStop) => {
        onChangeText(stop.name);
        setSuggestions([]);
        setIsFocused(false);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
                <View style={[styles.inputIcon, { backgroundColor: iconColor }]}>
                    <Text style={styles.inputIconText}>{icon}</Text>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        // Delay hide so click registers
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                />
                {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
            </View>

            {suggestions.length > 0 && isFocused && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((stop) => (
                        <TouchableOpacity
                            key={stop.id}
                            style={styles.suggestionItem}
                            onPress={() => handleSelect(stop)}
                        >
                            <Text style={styles.suggestionText}>{stop.name}</Text>
                            {stop.landmark && (
                                <Text style={styles.suggestionSubtext}>{stop.landmark}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 10,
        zIndex: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    inputIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    inputIconText: {
        fontSize: 12,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    suggestionItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    suggestionText: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '500',
    },
    suggestionSubtext: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
});
