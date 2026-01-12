import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAppStore } from '../../src/store';
import { BusStop, SearchResult } from '../../src/types';
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
    const { id } = useLocalSearchParams();
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

    if (!searchResult && !baseRoute) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Route Not Found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Normalized legs for rendering
    const legs = searchResult ? searchResult.legs : (baseRoute ? [{
        route: baseRoute,
        from: baseRoute.stops?.[0]?.stop!,
        to: baseRoute.stops?.[baseRoute.stops.length - 1]?.stop!,
        fromOrder: baseRoute.stops?.[0]?.stop_order!,
        toOrder: baseRoute.stops?.[baseRoute.stops.length - 1]?.stop_order!,
        estimated_time_mins: baseRoute.estimated_duration_mins || 0,
        fare: baseRoute.fare_estimate || 0
    }] : []);

    // Calculate totals for stats
    const totalFare = searchResult ? searchResult.total_fare : (baseRoute?.fare_estimate || 0);
    const totalTime = searchResult ? searchResult.total_time_mins : (baseRoute?.estimated_duration_mins || 0);

    // Aggregate ALL stops from ALL legs for the timeline, in order
    const allStopsForTimeline = legs.flatMap(leg => {
        return (leg.route.stops || [])
            .filter(s => s.stop_order >= leg.fromOrder && s.stop_order <= leg.toOrder)
            .map(s => ({ ...s, legRouteNumber: leg.route.route_number }));
    });

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

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${displayTitle} on SL Bus Finder!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ScrollView style={styles.container} bounces={false}>
            <StatusBar style="light" />

            {/* Map Section - We use the first leg's route for BusMap geometry for now, 
                ideally BusMap should handle multiple routes */}
            <View style={styles.mapContainer}>
                <BusMap route={legs[0].route} stops={mapStops} height={350} />
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
                        <Text style={styles.statValue}>{allStopsForTimeline.length}</Text>
                        <Text style={styles.statLabel}>Stops</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>Share Journey 📤</Text>
                </TouchableOpacity>

                {/* Stops List */}
                <Text style={styles.sectionTitle}>Journey Timeline</Text>
                <View style={styles.timeline}>
                    {allStopsForTimeline.map((stop, index) => (
                        <View key={`${stop.id}-${index}`} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[
                                    styles.timelineDot,
                                    index === 0 && styles.dotStart,
                                    index === allStopsForTimeline.length - 1 && styles.dotEnd,
                                    stop.legRouteNumber !== allStopsForTimeline[index - 1]?.legRouteNumber && index > 0 && { backgroundColor: colors.accent }
                                ]} />
                                {index !== allStopsForTimeline.length - 1 && (
                                    <View style={styles.timelineLine} />
                                )}
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.stopName}>{stop.stop?.name}</Text>
                                    {isTransfer && index > 0 && stop.legRouteNumber !== allStopsForTimeline[index - 1]?.legRouteNumber && (
                                        <View style={{ backgroundColor: colors.bgCard, paddingHorizontal: 6, borderRadius: 4 }}>
                                            <Text style={{ color: colors.accent, fontSize: 10 }}>TRANSFER TO {stop.legRouteNumber}</Text>
                                        </View>
                                    )}
                                </View>
                                {stop.stop?.landmark && (
                                    <Text style={styles.stopLandmark}>{stop.stop?.landmark}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Report Issue Section */}
                <View style={{ marginTop: 30, paddingBottom: 40, alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, marginBottom: 12 }}>See something wrong?</Text>
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
                        <Text style={{ color: colors.danger, fontWeight: '600', marginRight: 8 }}>⚠️ Report Issue</Text>
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
        backgroundColor: colors.bgCard,
        borderWidth: 2,
        borderColor: colors.textMuted,
        marginTop: 6,
    },
    dotStart: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    dotEnd: {
        borderColor: '#f43f5e',
        backgroundColor: '#f43f5e', // Consistent with map red
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 20,
    },
    stopName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    stopLandmark: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 2,
    },
    stopTime: {
        color: colors.info,
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
});
