import { create } from 'zustand';
import { BusRoute, BusStop, SearchResult } from './types';
import { mockRoutes, mockStops } from './data';

interface AppState {
    searchFrom: string;
    searchTo: string;
    searchResults: SearchResult[];
    isSearching: boolean;
    selectedRoute: BusRoute | null;
    routes: BusRoute[];
    stops: BusStop[];

    setSearchFrom: (value: string) => void;
    setSearchTo: (value: string) => void;
    setSelectedRoute: (route: BusRoute | null) => void;
    searchRoutes: (from: string, to: string) => void;
    swapLocations: () => void;
    initializeData: () => Promise<void>;
}

// Re-adding the missing create wrapper
export const useAppStore = create<AppState>((set, get) => ({
    searchFrom: '',
    searchTo: '',
    searchResults: [],
    isSearching: false,
    selectedRoute: null,
    routes: [], // Start empty, fetch from Supabase
    stops: [],

    initializeData: async () => {
        try {
            const { supabase } = await import('./lib/supabase');

            console.log('Fetching data from Supabase...');
            const [routesRes, stopsRes] = await Promise.all([
                supabase.from('routes').select(`*, stops:route_stops(*)`),
                supabase.from('stops').select('*')
            ]);

            if (routesRes.error) console.error('Routes Error:', routesRes.error);
            if (stopsRes.error) console.error('Stops Error:', stopsRes.error);

            if (routesRes.data && stopsRes.data) {
                const stops = stopsRes.data as BusStop[];
                // IMPORTANT: Sort stops by order AND link the actual Stop object
                const routes = routesRes.data.map((r: any) => ({
                    ...r,
                    stops: (r.stops || [])
                        .sort((a: any, b: any) => a.stop_order - b.stop_order)
                        .map((rs: any) => ({
                            ...rs,
                            stop: stops.find(s => s.id === rs.stop_id)
                        }))
                }));

                set({ routes, stops });
                console.log(`✅ Loaded ${routes.length} routes and ${stops.length} stops.`);
            }
        } catch (e) {
            console.error('Failed to init data', e);
        }
    },

    setSearchFrom: (value) => set({ searchFrom: value }),
    setSearchTo: (value) => set({ searchTo: value }),
    setSelectedRoute: (route) => set({ selectedRoute: route }),

    swapLocations: () => {
        const { searchFrom, searchTo } = get();
        set({ searchFrom: searchTo, searchTo: searchFrom });
    },

    searchRoutes: async (from: string, to: string) => {
        set({ isSearching: true });
        console.log(`Searching for: ${from} -> ${to}`);

        const { routes, stops } = get();
        const fromLower = from.toLowerCase().trim();
        const toLower = to.toLowerCase().trim();

        if (!fromLower || !toLower) {
            set({ isSearching: false, searchResults: [] });
            return;
        }

        // Distance Helper (Haversine)
        const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const results: SearchResult[] = [];

        // Helper to find stops matching a query
        const getMatchingStops = (query: string) => stops.filter(s =>
            s.name.toLowerCase().includes(query) ||
            (s.landmark && s.landmark.toLowerCase().includes(query))
        );

        const startStops = getMatchingStops(fromLower);
        const endStops = getMatchingStops(toLower);

        if (startStops.length === 0 || endStops.length === 0) {
            set({ isSearching: false, searchResults: [] });
            return;
        }

        // AI PRE-ANALYSIS
        const { analyzeJourneyAI } = await import('./lib/ai');
        const aiAdvice = await analyzeJourneyAI(from, to, stops);
        console.log(`AI Strategy: ${aiAdvice.strategy} - ${aiAdvice.logic}`);

        const avgStart = { lat: startStops[0].latitude, lon: startStops[0].longitude };
        const avgEnd = { lat: endStops[0].latitude, lon: endStops[0].longitude };
        const directAirDist = getDist(avgStart.lat, avgStart.lon, avgEnd.lat, avgEnd.lon);

        // 1. DIRECT ROUTES
        for (const route of routes) {
            if (!route.stops) continue;
            const routeStartMatches = route.stops.filter(rs => startStops.some(s => s.id === rs.stop_id));
            const routeEndMatches = route.stops.filter(rs => endStops.some(s => s.id === rs.stop_id));

            for (const start of routeStartMatches) {
                for (const end of routeEndMatches) {
                    if (start.stop_order < end.stop_order) {
                        const fromStop = stops.find(s => s.id === start.stop_id)!;
                        const toStop = stops.find(s => s.id === end.stop_id)!;
                        const time = (end.estimated_time_from_start_mins || 0) - (start.estimated_time_from_start_mins || 0);

                        results.push({
                            id: `direct-${route.id}`,
                            type: 'direct',
                            transferCount: 0,
                            total_time_mins: time,
                            total_fare: route.fare_estimate || 0,
                            legs: [{
                                route: route,
                                from: fromStop,
                                to: toStop,
                                fromOrder: start.stop_order,
                                toOrder: end.stop_order,
                                estimated_time_mins: time,
                                fare: route.fare_estimate || 0
                            }]
                        });
                    }
                }
            }
        }

        // 2. TRANSFER ROUTES (1 Transfer)
        const routesThroughStop: Record<string, { route: BusRoute, stop: any }[]> = {};
        routes.forEach(r => r.stops?.forEach(s => {
            if (!routesThroughStop[s.stop_id]) routesThroughStop[s.stop_id] = [];
            routesThroughStop[s.stop_id].push({ route: r, stop: s });
        }));

        const potentialLeg1: { route: BusRoute, startStop: any, endStop: any }[] = [];
        for (const route of routes) {
            if (!route.stops) continue;
            const myStarts = route.stops.filter(rs => startStops.some(s => s.id === rs.stop_id));
            for (const start of myStarts) {
                route.stops.filter(s => s.stop_order > start.stop_order).forEach(transferPoint => {
                    potentialLeg1.push({ route, startStop: start, endStop: transferPoint });
                });
            }
        }

        for (const leg1 of potentialLeg1) {
            const transferStopId = leg1.endStop.stop_id;
            const transferStopData = stops.find(s => s.id === transferStopId);
            if (!transferStopData) continue;

            // GEOGRAPHIC HEURISTIC: Is this transfer point totally out of the way?
            // If distance(Start -> Transfer) + distance(Transfer -> End) > 3x Direct Distance, reject.
            const dist1 = getDist(avgStart.lat, avgStart.lon, transferStopData.latitude, transferStopData.longitude);
            const dist2 = getDist(transferStopData.latitude, transferStopData.longitude, avgEnd.lat, avgEnd.lon);
            if (dist1 + dist2 > directAirDist * 2.5) continue;

            const connectingRoutes = routesThroughStop[transferStopId] || [];
            for (const connection of connectingRoutes) {
                const leg2Route = connection.route;
                const leg2Start = connection.stop;
                if (leg1.route.id === leg2Route.id) continue;
                const myEnds = leg2Route.stops?.filter(rs => endStops.some(s => s.id === rs.stop_id)) || [];

                for (const end of myEnds) {
                    if (leg2Start.stop_order < end.stop_order) {
                        const fromStop = stops.find(s => s.id === leg1.startStop.stop_id)!;
                        const transferStop = stops.find(s => s.id === transferStopId)!;
                        const toStop = stops.find(s => s.id === end.stop_id)!;

                        const time1 = (leg1.endStop.estimated_time_from_start_mins || 0) - (leg1.startStop.estimated_time_from_start_mins || 0);
                        const time2 = (end.estimated_time_from_start_mins || 0) - (leg2Start.estimated_time_from_start_mins || 0);

                        results.push({
                            id: `transfer-${leg1.route.id}-${leg2Route.id}`,
                            type: 'transfer',
                            transferCount: 1,
                            total_time_mins: time1 + time2 + 15, // +15 mins transfer overhead
                            total_fare: (leg1.route.fare_estimate || 50) + (leg2Route.fare_estimate || 50),
                            legs: [
                                {
                                    route: leg1.route,
                                    from: fromStop,
                                    to: transferStop,
                                    fromOrder: leg1.startStop.stop_order,
                                    toOrder: leg1.endStop.stop_order,
                                    estimated_time_mins: time1,
                                    fare: leg1.route.fare_estimate || 50
                                },
                                {
                                    route: leg2Route,
                                    from: transferStop,
                                    to: toStop,
                                    fromOrder: leg2Start.stop_order,
                                    toOrder: end.stop_order,
                                    estimated_time_mins: time2,
                                    fare: leg2Route.fare_estimate || 50
                                }
                            ]
                        });
                    }
                }
            }
        }

        // SMART RANKING & AI FILTERING
        let filteredResults = results;

        // Apply AI advice
        if (aiAdvice.strategy === 'direct_priority') {
            const hasDirect = results.some(r => r.type === 'direct');
            if (hasDirect) {
                // If direct routes exist on a main corridor, only keep transfers if they are significantly faster (rare)
                filteredResults = results.filter(r => r.type === 'direct' || r.total_time_mins < (results.find(x => x.type === 'direct')?.total_time_mins || 999) - 10);
            }
        } else if (aiAdvice.strategy === 'transfer_required' && aiAdvice.preferredTransferPoints) {
            // Check if transfer point matches preferred ones
            filteredResults = results.filter(r => {
                if (r.type === 'direct') return true;
                const transferStopName = r.legs[1]?.from.name;
                return (aiAdvice.preferredTransferPoints as string[]).some(p => transferStopName.includes(p));
            });

            // If we filtered EVERYTHING out (AI too strict?), revert to original results but ranked lower
            if (filteredResults.length === 0) filteredResults = results;
        }

        // Final Sort by Score (Direct is king, time is secondary)
        filteredResults.sort((a, b) => {
            const scoreA = a.total_time_mins + (a.type === 'transfer' ? 30 : 0);
            const scoreB = b.total_time_mins + (b.type === 'transfer' ? 30 : 0);
            return scoreA - scoreB;
        });

        const uniqueResults = filteredResults.filter((value, index, self) =>
            index === self.findIndex((t) => {
                const getJourneyKey = (item: SearchResult) =>
                    item.legs.map(l => l.route.route_number).join('->');
                return getJourneyKey(t) === getJourneyKey(value);
            })
        ).slice(0, 5);

        console.log(`Found ${uniqueResults.length} AI-optimized results.`);
        set({ searchResults: uniqueResults, isSearching: false });
    },
}));
