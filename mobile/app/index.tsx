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

    const transferPoint = isTransfer ? legs[0].to.name : null;

    return (
        <TouchableOpacity
            style={[styles.routeCard, isSelected && styles.routeCardSelected]}
            onPress={onPress}
        >
            {/* NEW: Journey Header Summary */}
            <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={styles.routeTitle}>
                        {isTransfer ? `${legs[0].route.route_number} → ${legs[1].route.route_number}` : `Route ${legs[0].route.route_number}`}
                    </Text>
                    <View style={styles.timeBadge}>
                        <Ionicons name="time" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.timeBadgeText}>{item.total_time_mins} min</Text>
                    </View>
                </View>
                {isTransfer && (
                    <View style={styles.transferSummary}>
                        <Ionicons name="swap-horizontal" size={14} color={colors.warning} style={{ marginRight: 6 }} />
                        <Text style={styles.transferSummaryText}>Transfer at <Text style={{ fontWeight: 'bold', color: colors.text }}>{transferPoint}</Text></Text>
                    </View>
                )}
            </View>

            <View style={styles.journeyVisual}>
                {legs.map((leg, index) => (
                    <React.Fragment key={index}>
                        <View style={styles.compactLeg}>
                            <View style={[styles.miniRouteBadge, { backgroundColor: index === 0 ? colors.accent : colors.secondary, width: 24, height: 24, borderRadius: 6 }]}>
                                <Text style={[styles.miniRouteBadgeText, { fontSize: 10 }]}>{leg.route.route_number}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.stopText} numberOfLines={1}>{leg.from.name} → {leg.to.name}</Text>
                            </View>
                        </View>
                        {index < legs.length - 1 && (
                            <View style={styles.visualConnector}>
                                <View style={styles.connectorLine} />
                            </View>
                        )}
                    </React.Fragment>
                ))}
            </View>

            {/* Footer: Stats */}
            <View style={[styles.routeStats, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={styles.statItem}>
                    <Ionicons name="cash-outline" style={[styles.statIcon, { fontSize: 16 }]} color={colors.textMuted} />
                    <Text style={[styles.statText, { fontSize: 13 }]}>Rs. {item.total_fare}</Text>
                </View>
                {isTransfer ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={styles.statItem}>
                            <Ionicons name="git-compare-outline" style={[styles.statIcon, { fontSize: 16 }]} color={colors.warning} />
                            <Text style={[styles.statText, { color: colors.warning, fontSize: 13 }]}>1 Change</Text>
                        </View>
                        {legs[0].alternativeOverlapStops && legs[0].alternativeOverlapStops.length > 1 && (
                            <View style={[styles.optimizedBadge, { backgroundColor: colors.primary + '10' }]}>
                                <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
                                <Text style={[styles.optimizedText, { fontSize: 10 }]}>FLEXIBLE HUBS</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.optimizedBadge}>
                        <Ionicons name="star" size={10} color={colors.primary} />
                        <Text style={[styles.optimizedText, { fontSize: 10 }]}>DIRECT</Text>
                    </View>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => router.push(`/route/${item.id}`)}
                    style={styles.viewDetailsButton}
                >
                    <Text style={styles.viewDetailsText}>Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
            </View>
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
    // New Journey Summary Styles
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeBadgeText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    transferSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning + '10',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.warning + '20',
    },
    transferSummaryText: {
        color: colors.textMuted,
        fontSize: 12,
    },
    journeyVisual: {
        marginBottom: 4,
    },
    compactLeg: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    visualConnector: {
        height: 12,
        marginLeft: 11, // Center with 24px badge
        width: 2,
        borderLeftWidth: 2,
        borderLeftColor: colors.border,
        marginVertical: 4,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    miniRouteBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    miniRouteBadgeText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
    },
    connectorLine: {
        flex: 1,
        width: 2,
        backgroundColor: colors.border,
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
