import { create } from 'zustand';
import { BusRoute, BusStop, SearchResult, User } from './types';
import { mockRoutes, mockStops } from './mock-data';

interface AppState {
    // User state
    user: User | null;
    setUser: (user: User | null) => void;

    // Search state
    searchFrom: string;
    searchTo: string;
    searchResults: SearchResult[];
    isSearching: boolean;
    setSearchFrom: (value: string) => void;
    setSearchTo: (value: string) => void;
    setSearchResults: (results: SearchResult[]) => void;
    setIsSearching: (value: boolean) => void;

    // Selected route for map display
    selectedRoute: BusRoute | null;
    setSelectedRoute: (route: BusRoute | null) => void;

    // All routes and stops (cached)
    routes: BusRoute[];
    stops: BusStop[];
    setRoutes: (routes: BusRoute[]) => void;
    setStops: (stops: BusStop[]) => void;

    // Search function
    searchRoutes: (from: string, to: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // User
    user: null,
    setUser: (user) => set({ user }),

    // Search
    searchFrom: '',
    searchTo: '',
    searchResults: [],
    isSearching: false,
    setSearchFrom: (value) => set({ searchFrom: value }),
    setSearchTo: (value) => set({ searchTo: value }),
    setSearchResults: (results) => set({ searchResults: results }),
    setIsSearching: (value) => set({ isSearching: value }),

    // Selected route
    selectedRoute: null,
    setSelectedRoute: (route) => set({ selectedRoute: route }),

    // Data
    routes: mockRoutes,
    stops: mockStops,
    setRoutes: (routes) => set({ routes }),
    setStops: (stops) => set({ stops }),

    // Search function
    searchRoutes: (from: string, to: string) => {
        set({ isSearching: true });

        const { routes, stops } = get();
        const fromLower = from.toLowerCase();
        const toLower = to.toLowerCase();

        const results: SearchResult[] = [];

        for (const route of routes) {
            if (!route.stops) continue;

            let fromStop: { stop: BusStop; order: number } | null = null;
            let toStop: { stop: BusStop; order: number } | null = null;

            for (const routeStop of route.stops) {
                const stop = stops.find(s => s.id === routeStop.stop_id);
                if (!stop) continue;

                const stopName = stop.name.toLowerCase();
                const stopLandmark = stop.landmark?.toLowerCase() || '';

                if (stopName.includes(fromLower) || stopLandmark.includes(fromLower)) {
                    if (!fromStop || routeStop.stop_order < fromStop.order) {
                        fromStop = { stop, order: routeStop.stop_order };
                    }
                }

                if (stopName.includes(toLower) || stopLandmark.includes(toLower)) {
                    if (!toStop || routeStop.stop_order > (fromStop?.order || 0)) {
                        toStop = { stop, order: routeStop.stop_order };
                    }
                }
            }

            // Only add if from comes before to
            if (fromStop && toStop && fromStop.order < toStop.order) {
                const fromRouteStop = route.stops.find(s => s.stop_id === fromStop!.stop.id);
                const toRouteStop = route.stops.find(s => s.stop_id === toStop!.stop.id);

                const travelTime = toRouteStop?.estimated_time_from_start_mins && fromRouteStop?.estimated_time_from_start_mins
                    ? toRouteStop.estimated_time_from_start_mins - fromRouteStop.estimated_time_from_start_mins
                    : undefined;

                results.push({
                    route,
                    matchedStops: {
                        from: fromStop.stop,
                        to: toStop.stop,
                        fromOrder: fromStop.order,
                        toOrder: toStop.order,
                    },
                    travelTime,
                    fareEstimate: route.fare_estimate,
                });
            }
        }

        // Sort by travel time if available
        results.sort((a, b) => {
            if (a.travelTime && b.travelTime) return a.travelTime - b.travelTime;
            return 0;
        });

        set({ searchResults: results, isSearching: false });
    },
}));
