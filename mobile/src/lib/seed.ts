import { supabase } from './supabase';
import { mockRoutes, mockStops } from '../data';

export const seedDatabase = async () => {
    try {
        console.log('Starting seed process...');

        // 0. CLEANUP
        console.log('Cleaning old data...');
        const { error: cleanError1 } = await supabase.from('route_stops').delete().neq('stop_order', -1);
        const { error: cleanError2 } = await supabase.from('routes').delete().neq('route_name', 'IsNotReal');
        const { error: cleanError3 } = await supabase.from('stops').delete().neq('name', 'IsNotReal');

        if (cleanError1) console.error('Clean error 1:', cleanError1);
        if (cleanError2) console.error('Clean error 2:', cleanError2);
        if (cleanError3) console.error('Clean error 3:', cleanError3);

        // 1. Seed Stops
        const stopIdMap: Record<string, string> = {};
        console.log('Seeding stops...');

        for (const stop of mockStops) {
            const { data, error } = await supabase
                .from('stops')
                .insert({
                    name: stop.name,
                    name_si: stop.name_si,
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    landmark: stop.landmark,
                })
                .select()
                .single();

            if (error) {
                console.error('Error inserting stop:', stop.name, error);
                continue;
            }

            if (data) {
                stopIdMap[stop.id] = data.id;
            }
        }
        console.log(`Seeded ${Object.keys(stopIdMap).length} stops.`);

        // 2. Seed Routes and RouteStops
        console.log('Seeding routes...');
        for (const route of mockRoutes) {
            // Forward Route
            const { data: routeData, error: routeError } = await supabase
                .from('routes')
                .insert({
                    route_number: route.route_number,
                    route_name: route.route_name,
                    description: route.description,
                    fare_estimate: route.fare_estimate,
                    estimated_duration_mins: route.estimated_duration_mins,
                    status: 'verified',
                })
                .select()
                .single();

            if (routeError) console.error('Error inserting route:', route.route_number, routeError);

            // Reverse Route (Append 'R' to number to avoid unique constraint issues)
            const reverseName = `${route.route_name.split(' - ')[1] || 'End'} - ${route.route_name.split(' - ')[0] || 'Start'}`;
            const { data: reverseRouteData, error: reverseRouteError } = await supabase
                .from('routes')
                .insert({
                    route_number: `${route.route_number}R`, // Changed: Append R
                    route_name: reverseName,
                    description: route.description + ' (Return)',
                    fare_estimate: route.fare_estimate,
                    estimated_duration_mins: route.estimated_duration_mins,
                    status: 'verified',
                })
                .select()
                .single();

            if (reverseRouteError) console.error('Error inserting REVERSE route:', route.route_number, reverseRouteError);

            // Insert Stops for Forward Route
            if (routeData && route.stops) {
                const routeStopsToInsert = route.stops.map(rs => {
                    const newStopId = stopIdMap[rs.stop_id];
                    if (!newStopId) return null;
                    return {
                        route_id: routeData.id,
                        stop_id: newStopId,
                        stop_order: rs.stop_order,
                        estimated_time_from_start_mins: rs.estimated_time_from_start_mins
                    };
                }).filter(Boolean);

                if (routeStopsToInsert.length > 0) {
                    const { error } = await supabase.from('route_stops').insert(routeStopsToInsert);
                    if (error) console.error('Error linking stops to route:', route.route_number, error);
                }
            }

            // Insert Stops for Reverse Route
            if (reverseRouteData && route.stops) {
                const reversedStops = [...route.stops].reverse();
                const totalDuration = route.stops[route.stops.length - 1].estimated_time_from_start_mins;

                const reverseRouteStopsToInsert = reversedStops.map((rs, index) => {
                    const newStopId = stopIdMap[rs.stop_id];
                    if (!newStopId) return null;

                    const originalTime = rs.estimated_time_from_start_mins || 0;
                    const newTime = (totalDuration || 60) - originalTime;

                    return {
                        route_id: reverseRouteData.id,
                        stop_id: newStopId,
                        stop_order: index + 1,
                        estimated_time_from_start_mins: Math.max(0, newTime)
                    };
                }).filter(Boolean);

                if (reverseRouteStopsToInsert.length > 0) {
                    const { error } = await supabase.from('route_stops').insert(reverseRouteStopsToInsert);
                    if (error) console.error('Error linking stops to REVERSE route:', route.route_number, error);
                }
            }
        }

        console.log('Seed process completed!');
        return true;
    } catch (error) {
        console.error('Seed error:', error);
        throw error;
    }
};
