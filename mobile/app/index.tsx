import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Keyboard,
    Dimensions,
} from 'react-native';
import { useAppStore } from '../src/store';
import { mockStops } from '../src/data';
import { BusStop, SearchResult } from '../src/types';
import { useRouter } from 'expo-router';
import AutocompleteInput from '../src/components/AutocompleteInput';

import { Ionicons } from '@expo/vector-icons';

// Colors
const colors = {
    bg: '#0f172a',
    bgCard: 'rgba(255,255,255,0.05)',
    bgCardHover: 'rgba(255,255,255,0.1)',
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    success: '#10b981',
    danger: '#f43f5e',
    warning: '#eab308', // Added warning color
    text: '#f8fafc',
    textMuted: 'rgba(248,250,252,0.6)',
    border: 'rgba(255,255,255,0.1)',
};

// Search Input Component
// Search Input replaced by AutocompleteInput

// Route Card Component
const RouteCard = ({ item, onPress }: { item: SearchResult; onPress: () => void }) => {
    const { selectedRoute } = useAppStore();
    const router = useRouter();
    const isTransfer = item.type === 'transfer';
    const legs = item.legs;
    const isSelected = selectedRoute?.id === item.legs[0].route.id;

    return (
        <TouchableOpacity
            style={[styles.routeCard, isSelected && styles.routeCardSelected]}
            onPress={onPress}
        >
            {legs.map((leg, index) => (
                <View key={index} style={{ marginBottom: index < legs.length - 1 ? 16 : 0 }}>
                    {/* Header: Route Number & Name */}
                    <View style={styles.routeCardHeader}>
                        <View style={[styles.routeBadge, { backgroundColor: index > 0 ? colors.secondary : colors.accent }]}>
                            <Ionicons name="bus" size={28} color="#fff" />
                            <View style={styles.routeNumber}>
                                <Text style={styles.routeNumberText}>{leg.route.route_number}</Text>
                            </View>
                        </View>
                        <View style={styles.routeInfo}>
                            <Text style={styles.routeTitle}>{leg.route.route_name}</Text>
                            <Text style={styles.routeSubtitle}>
                                {index === 0 ? 'Start' : 'Transfer'}: {leg.from.name}
                            </Text>
                        </View>
                    </View>

                    {/* Stops Visualization */}
                    <View style={styles.routeStops}>
                        <View style={styles.stopBadge}>
                            <View style={[styles.stopDot, { backgroundColor: colors.success }]} />
                            <Text style={styles.stopText}>{leg.from.name}</Text>
                        </View>
                        <View style={styles.routeLine} />
                        <View style={styles.stopBadge}>
                            <View style={[styles.stopDot, { backgroundColor: colors.danger }]} />
                            <Text style={styles.stopText}>{leg.to.name}</Text>
                        </View>
                    </View>
                </View>
            ))}

            {/* Footer: Stats */}
            <View style={[styles.routeStats, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={styles.statItem}>
                    <Ionicons name="time-outline" style={styles.statIcon} color={colors.textMuted} />
                    <Text style={styles.statText}>{item.total_time_mins} min</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="cash-outline" style={styles.statIcon} color={colors.textMuted} />
                    <Text style={styles.statText}>Rs. {item.total_fare}</Text>
                </View>
                {isTransfer ? (
                    <View style={styles.statItem}>
                        <Ionicons name="git-compare-outline" style={styles.statIcon} color={colors.warning} />
                        <Text style={[styles.statText, { color: colors.warning }]}>1 Transfer</Text>
                    </View>
                ) : (
                    <View style={styles.optimizedBadge}>
                        <Ionicons name="flash" size={12} color={colors.primary} />
                        <Text style={styles.optimizedText}>RECOMMENDED</Text>
                    </View>
                )}
            </View>

            {isSelected && (
                <View style={styles.expandedStops}>
                    <Text style={styles.expandedTitle}>Journey Details:</Text>
                    {legs.map((leg, lIndex) => {
                        // Filter the route stops to only those between fromOrder and toOrder
                        const filteredStops = leg.route.stops?.filter(s =>
                            s.stop_order >= leg.fromOrder && s.stop_order <= leg.toOrder
                        ) || [];

                        return (
                            <View key={lIndex} style={{ marginBottom: 16 }}>
                                <Text style={[styles.suggestionSubtext, { marginBottom: 8, color: colors.primary, fontWeight: 'bold' }]}>
                                    Bus {leg.route.route_number}: {leg.from.name} → {leg.to.name}
                                </Text>
                                <View style={styles.stopsRow}>
                                    {filteredStops.map((rs, rsIndex) => (
                                        <React.Fragment key={rs.id}>
                                            <View style={[
                                                styles.stopChip,
                                                rs.stop_id === leg.from.id && styles.stopChipFrom,
                                                rs.stop_id === leg.to.id && styles.stopChipTo
                                            ]}>
                                                <Text style={[
                                                    styles.stopChipText,
                                                    (rs.stop_id === leg.from.id || rs.stop_id === leg.to.id) && styles.stopChipTextHighlight
                                                ]}>
                                                    {rs.stop?.name}
                                                </Text>
                                            </View>
                                            {rsIndex < filteredStops.length - 1 && (
                                                <Text style={{ color: colors.textMuted, alignSelf: 'center' }}>→</Text>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={[styles.searchButton, { paddingVertical: 12, marginTop: 10 }]}
                        onPress={() => router.push(`/route/${item.id}`)}
                    >
                        <Text style={styles.searchButtonText}>View Full Map & Info</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

// Main Home Screen
export default function Home() {
    const router = useRouter();
    const {
        searchFrom,
        searchTo,
        searchResults,
        isSearching,
        selectedRoute,
        setSearchFrom,
        setSearchTo,
        setSelectedRoute,
        searchRoutes,
        swapLocations,
        initializeData, // Get this function
    } = useAppStore();

    // Load data on startup
    React.useEffect(() => {
        initializeData();
    }, []);

    const handleSearch = useCallback(() => {
        if (searchFrom && searchTo) {
            Keyboard.dismiss();
            searchRoutes(searchFrom, searchTo);
        }
    }, [searchFrom, searchTo, searchRoutes]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoIcon}>🚌</Text>
                    </View>
                    <View>
                        <Text style={styles.logoTitle}>SL Bus Finder</Text>
                        <Text style={styles.logoSubtitle}>Western Province</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={styles.contributeButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.contributeIcon}>👤</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contributeButton}
                        onPress={() => {
                            console.log('Navigating to contribute');
                            router.push('/contribute');
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.contributeIcon}>➕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchCard}>
                    <View style={{ zIndex: 20 }}>
                        <AutocompleteInput
                            placeholder="Where are you starting from?"
                            value={searchFrom}
                            onChangeText={setSearchFrom}
                            iconColor={colors.success}
                            icon="📍"
                        />
                    </View>

                    <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
                        <Text style={styles.swapIcon}>⇅</Text>
                    </TouchableOpacity>

                    <View style={{ zIndex: 10 }}>
                        <AutocompleteInput
                            placeholder="Where do you want to go?"
                            value={searchTo}
                            onChangeText={setSearchTo}
                            iconColor={colors.danger}
                            icon="🎯"
                        />

                        <TouchableOpacity
                            style={[
                                styles.searchButton,
                                (!searchFrom || !searchTo) && styles.searchButtonDisabled,
                            ]}
                            onPress={handleSearch}
                            disabled={!searchFrom || !searchTo || isSearching}
                        >
                            <Text style={styles.searchButtonText}>
                                {isSearching ? '🔍 Searching...' : '🔍 Find My Bus'}
                            </Text>
                        </TouchableOpacity>

                        {/* Quick suggestions - Hide when results are found */}
                        {searchResults.length === 0 && (
                            <View style={styles.quickTags}>
                                {['Fort', 'Nugegoda', 'Malabe', 'Thalawathugoda'].map((place) => (
                                    <TouchableOpacity
                                        key={place}
                                        style={styles.quickTag}
                                        onPress={() => {
                                            if (!searchFrom) setSearchFrom(place);
                                            else if (!searchTo) setSearchTo(place);
                                        }}
                                    >
                                        <Text style={styles.quickTagText}>{place}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Results */}
                {searchResults.length > 0 && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>
                            Found {searchResults.length} Route
                            {searchResults.length !== 1 ? 's' : ''}
                        </Text>
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id} // Updated key to use unique ID
                            renderItem={({ item }) => (
                                <RouteCard
                                    item={item}
                                    onPress={() => setSelectedRoute(selectedRoute?.id === item.legs[0].route.id ? null : item.legs[0].route)}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.resultsList}
                        />
                    </View>
                )}

                {/* Empty state */}
                {searchResults.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🚌</Text>
                        <Text style={styles.emptyTitle}>Find Your Bus</Text>
                        <Text style={styles.emptyText}>
                            Enter your start and destination to find available bus routes
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        paddingTop: 45,
        paddingHorizontal: 20,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoIcon: {
        fontSize: 18,
    },
    logoTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoSubtitle: {
        color: colors.textMuted,
        fontSize: 11,
    },
    contributeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    contributeIcon: {
        fontSize: 16,
        color: colors.text,
    },
    searchSection: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputContainer: {
        marginBottom: 8,
        zIndex: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 16,
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
        marginRight: 12,
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
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    suggestionText: {
        color: colors.text,
        fontSize: 14,
    },
    suggestionSubtext: {
        color: colors.textMuted,
        fontSize: 11,
        marginTop: 2,
    },
    swapButton: {
        position: 'absolute',
        top: '50%',
        right: 30,
        marginTop: -18,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    swapIcon: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 6,
    },
    searchButtonDisabled: {
        opacity: 0.5,
    },
    searchButtonText: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '600',
    },
    quickTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
    },
    quickTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    quickTagText: {
        color: colors.textMuted,
        fontSize: 11,
    },
    resultsSection: {
        flex: 1,
        paddingTop: 15,
    },
    resultsTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    resultsList: {
        paddingBottom: 40,
    },
    routeCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    routeCardSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(6,182,212,0.1)',
    },
    routeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    routeBadge: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    routeBadgeText: {
        fontSize: 24,
    },
    routeNumber: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: colors.bg,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    routeNumberText: {
        color: colors.accent,
        fontSize: 10,
        fontWeight: 'bold',
    },
    routeInfo: {
        flex: 1,
    },
    routeTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
    },
    routeSubtitle: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 2,
    },
    routeStops: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    stopBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stopDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    stopText: {
        color: colors.text,
        fontSize: 13,
    },
    routeLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 10,
        borderStyle: 'dashed',
    },
    routeStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    optimizedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: 'rgba(6,182,212,0.1)',
        borderRadius: 8,
        marginLeft: 'auto',
        gap: 4,
    },
    optimizedText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statIcon: {
        fontSize: 12,
    },
    statText: {
        color: colors.textMuted,
        fontSize: 13,
    },
    expandedStops: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    expandedTitle: {
        color: colors.textMuted,
        fontSize: 12,
        marginBottom: 10,
    },
    stopsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    stopChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    stopChipFrom: {
        backgroundColor: 'rgba(16,185,129,0.2)',
        borderWidth: 1,
        borderColor: colors.success,
    },
    stopChipTo: {
        backgroundColor: 'rgba(244,63,94,0.2)',
        borderWidth: 1,
        borderColor: colors.danger,
    },
    stopChipText: {
        color: colors.textMuted,
        fontSize: 11,
    },
    stopChipTextHighlight: {
        color: colors.text,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyTitle: {
        color: colors.text,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 15,
        textAlign: 'center',
    },
});
