import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAppStore } from '../../src/store';
import { BusStop } from '../../src/types';
import BusMap from '../../src/components/BusMap';
import { StatusBar } from 'expo-status-bar';

// Colors
const colors = {
    bg: '#0f172a',
    bgCard: 'rgba(255,255,255,0.05)',
    primary: '#06b6d4',
    accent: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    text: '#f8fafc',
    textMuted: 'rgba(248,250,252,0.6)',
    border: 'rgba(255,255,255,0.1)',
    danger: '#f43f5e',
};

export default function RouteDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const { routes, searchResults } = useAppStore();

    // Resolve what to show
    const searchResult = useMemo(() => searchResults.find(r => r.id === id), [searchResults, id]);
    const baseRoute = useMemo(() => routes.find(r => r.id === id), [routes, id]);

    const isTransfer = searchResult?.type === 'transfer';
    const displayTitle = isTransfer
        ? `Transfer: ${searchResult.legs.map(l => l.route.route_number).join(' + ')}`
        : (baseRoute ? `Route ${baseRoute.route_number}` : 'Route Details');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: displayTitle,
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerBackTitle: 'Back',
        });
    }, [navigation, displayTitle]);

    // Normalized legs for rendering
    const legs = useMemo(() => {
        if (searchResult) return searchResult.legs;
        if (baseRoute && baseRoute.stops && baseRoute.stops.length > 0) {
            const firstRS = baseRoute.stops[0];
            const lastRS = baseRoute.stops[baseRoute.stops.length - 1];

            if (firstRS.stop && lastRS.stop) {
                return [{
                    route: baseRoute,
                    from: firstRS.stop,
                    to: lastRS.stop,
                    fromOrder: firstRS.stop_order,
                    toOrder: lastRS.stop_order,
                    estimated_time_mins: baseRoute.estimated_duration_mins || 0,
                    fare: baseRoute.fare_estimate || 0,
                    alternativeOverlapStops: []
                }];
            }
        }
        return [];
    }, [searchResult, baseRoute]);

    // Map stops needs all physical stops from all routes involved
    const mapStops = useMemo(() => {
        const unique = new Map<string, BusStop>();
        legs.forEach(leg => {
            leg.route.stops?.forEach(s => {
                if (s.stop) unique.set(s.stop.id, s.stop);
            });
        });
        return Array.from(unique.values());
    }, [legs]);

    // Prepare legs for Map containing only the subset of stops in order
    const mapLegs = useMemo(() => {
        return legs.map(leg => ({
            route: leg.route,
            stops: (leg.route.stops || [])
                .filter(s => s.stop_order >= leg.fromOrder && s.stop_order <= leg.toOrder)
                .map(s => s.stop as BusStop)
                .filter(Boolean)
        }));
    }, [legs]);

    if (!searchResult && !baseRoute) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Route Not Found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back to Search</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Calculate totals for stats
    const totalFare = searchResult ? searchResult.total_fare : (baseRoute?.fare_estimate || 0);
    const totalTime = searchResult ? searchResult.total_time_mins : (baseRoute?.estimated_duration_mins || 0);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${displayTitle} on SL Bus Finder!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (legs.length === 0) return null;

    return (
        <ScrollView style={styles.container} bounces={false}>
            <StatusBar style="light" />

            {/* Map Section */}
            <View style={styles.mapContainer}>
                <BusMap legs={mapLegs} stops={mapStops} height={350} />
            </View>

            {/* Route Header */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.routeBadge}>
                        <Text style={styles.routeBadgeText}>{legs[0].route.route_number}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>{isTransfer ? 'Transfer Journey' : legs[0].route.route_name}</Text>
                        <Text style={styles.subtitle}>
                            {isTransfer
                                ? `Via ${legs.map(l => l.route.route_number).join(' and ')}`
                                : legs[0].route.description}
                        </Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>💰</Text>
                        <Text style={styles.statValue}>Rs. {totalFare}</Text>
                        <Text style={styles.statLabel}>Total Fare</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>⏱️</Text>
                        <Text style={styles.statValue}>{totalTime}</Text>
                        <Text style={styles.statLabel}>Minutes</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>📍</Text>
                        <Text style={styles.statValue}>{legs.reduce((acc, l) => acc + (l.route.stops?.length || 0), 0)}</Text>
                        <Text style={styles.statLabel}>Stops</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>Share Journey 📤</Text>
                </TouchableOpacity>

                {/* Journey Timeline */}
                <Text style={styles.sectionTitle}>Journey Timeline</Text>

                <View style={styles.journeyContainer}>
                    {legs.map((leg, legIndex) => (
                        <View key={`leg-${legIndex}`} style={styles.legSection}>
                            <View style={styles.legHeader}>
                                <View style={[styles.miniRouteBadge, { backgroundColor: legIndex === 0 ? colors.accent : colors.primary }]}>
                                    <Text style={styles.miniRouteBadgeText}>{leg.route.route_number}</Text>
                                </View>
                                <Text style={styles.legHeaderText}>Take Bus {leg.route.route_number} to {leg.to.name}</Text>
                            </View>

                            <View style={styles.timeline}>
                                {(leg.route.stops || [])
                                    .filter(s => s.stop_order >= leg.fromOrder && s.stop_order <= leg.toOrder)
                                    .map((stop, stopIndex, stopArr) => {
                                        const isFirstInLeg = stopIndex === 0;
                                        const isLastInLeg = stopIndex === stopArr.length - 1;
                                        const isOverallStart = legIndex === 0 && isFirstInLeg;
                                        const isOverallEnd = legIndex === legs.length - 1 && isLastInLeg;
                                        const isFlexibleHub = leg.alternativeOverlapStops?.some(as => as.id === stop.stop?.id);

                                        return (
                                            <View key={`${stop.stop?.id || stop.id}-${stopIndex}`} style={styles.timelineItem}>
                                                <View style={styles.timelineLeft}>
                                                    <View style={[
                                                        styles.timelineDot,
                                                        isOverallStart && styles.dotStart,
                                                        isOverallEnd && styles.dotEnd,
                                                        isLastInLeg && !isOverallEnd && styles.dotTransfer,
                                                        isFlexibleHub && !isOverallStart && styles.dotFlexible
                                                    ]} />
                                                    {!isOverallEnd && (
                                                        <View style={[
                                                            styles.timelineLine,
                                                            legIndex > 0 && { backgroundColor: colors.primary + '40' }
                                                        ]} />
                                                    )}
                                                </View>
                                                <View style={styles.timelineContent}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={[
                                                            styles.stopName,
                                                            (isFirstInLeg || isLastInLeg) && { fontWeight: '700', fontSize: 17 },
                                                            isFlexibleHub && { color: colors.primary }
                                                        ]}>
                                                            {stop.stop?.name}
                                                        </Text>
                                                        {isLastInLeg && !isOverallEnd && (
                                                            <View style={styles.getOffBadge}>
                                                                <Text style={styles.getOffText}>TRANSFER HUB</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    {stop.stop?.landmark && (
                                                        <Text style={styles.stopLandmark}>{stop.stop?.landmark}</Text>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })}
                            </View>

                            {legIndex < legs.length - 1 && (
                                <View style={styles.transferCard}>
                                    <View style={styles.transferCardIcon}>
                                        <Text style={{ fontSize: 20 }}>🔄</Text>
                                    </View>
                                    <View style={styles.transferCardContent}>
                                        <Text style={styles.transferTitle}>Switch Bus at {leg.to.name}</Text>
                                        <Text style={styles.transferSubtitle}>Wait for Route {legs[legIndex + 1].route.route_number}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Report Issue */}
                <View style={{ marginTop: 30, paddingBottom: 40, alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            borderWidth: 1,
                            borderColor: colors.danger,
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            borderRadius: 24
                        }}
                        onPress={() => router.push({ pathname: '/report', params: { routeId: legs[0].route.id, routeName: legs[0].route.route_number } })}
                    >
                        <Text style={{ color: colors.danger, fontWeight: '600' }}>⚠️ Report Issue</Text>
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
    errorText: {
        color: colors.text,
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    backButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'center',
    },
    backButtonText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    mapContainer: {
        height: 350,
        width: '100%',
    },
    content: {
        padding: 20,
        paddingTop: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    routeBadge: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    routeBadgeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        color: colors.text,
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: 14,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    shareButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.border,
    },
    shareButtonText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        minHeight: 60,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 24,
        marginRight: 12,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.textMuted,
        marginTop: 6,
        zIndex: 2,
    },
    dotStart: {
        backgroundColor: colors.success,
        borderColor: colors.success,
        width: 14,
        height: 14,
        borderRadius: 7,
        marginLeft: -1,
    },
    dotEnd: {
        borderColor: colors.danger,
        backgroundColor: colors.danger,
        width: 14,
        height: 14,
        borderRadius: 7,
        marginLeft: -1,
    },
    dotTransfer: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
        width: 14,
        height: 14,
        borderRadius: 7,
        marginLeft: -1,
    },
    timelineLine: {
        position: 'absolute',
        top: 18,
        bottom: -4,
        width: 2,
        backgroundColor: colors.accent + '40',
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 24,
    },
    stopName: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '500',
    },
    stopLandmark: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    journeyContainer: {
        marginTop: 8,
    },
    legSection: {
        marginBottom: 0,
    },
    legHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
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
    legHeaderText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    getOffBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.accent + '40',
    },
    getOffText: {
        color: colors.accent,
        fontSize: 10,
        fontWeight: '800',
    },
    transferCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        padding: 16,
        borderRadius: 16,
        marginVertical: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.primary,
    },
    transferCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    transferCardContent: {
        flex: 1,
    },
    transferTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    transferSubtitle: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 2,
    },
    dotFlexible: {
        borderColor: colors.primary,
        backgroundColor: colors.bg,
        borderWidth: 2,
    },
});
