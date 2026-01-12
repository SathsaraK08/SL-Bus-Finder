// Mock data for the mobile app - same as web version
import { BusRoute, BusStop, RouteStop } from './types';

export const mockStops: BusStop[] = [
    // Central Colombo
    { id: 'stop-1', name: 'Fort Railway Station', name_si: 'කොළඹ කොටුව දුම්රිය ස්ථානය', latitude: 6.9344, longitude: 79.8428, landmark: 'Main railway station', created_at: new Date().toISOString() },
    { id: 'stop-2', name: 'Pettah Bus Stand', name_si: 'පිටකොටුව බස් නැවතුම', latitude: 6.9366, longitude: 79.8486, landmark: 'Central market', created_at: new Date().toISOString() },
    { id: 'stop-3', name: 'Maradana', name_si: 'මරදාන', latitude: 6.9289, longitude: 79.8654, landmark: 'Railway Station', created_at: new Date().toISOString() },
    { id: 'stop-4', name: 'Borella Junction', name_si: 'බොරැල්ල හන්දිය', latitude: 6.9147, longitude: 79.8773, landmark: 'Cancer Hospital', created_at: new Date().toISOString() },
    { id: 'stop-5', name: 'Kollupitiya', name_si: 'කොල්ලුපිටිය', latitude: 6.9107, longitude: 79.8499, landmark: 'Liberty Plaza', created_at: new Date().toISOString() },
    { id: 'stop-6', name: 'Bambalapitiya', name_si: 'බම්බලපිටිය', latitude: 6.8933, longitude: 79.8559, landmark: 'Savoy Cinema', created_at: new Date().toISOString() },
    { id: 'stop-7', name: 'Wellawatte', name_si: 'වැල්ලවත්ත', latitude: 6.8744, longitude: 79.8611, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-8', name: 'Dehiwala', name_si: 'දෙහිවල', latitude: 6.8519, longitude: 79.8654, landmark: 'Zoo', created_at: new Date().toISOString() },
    { id: 'stop-9', name: 'Mount Lavinia', name_si: 'ගල්කිස්ස', latitude: 6.8283, longitude: 79.8659, landmark: 'Beach Hotel', created_at: new Date().toISOString() },
    { id: 'stop-10', name: 'Nugegoda', name_si: 'නුගේගොඩ', latitude: 6.8728, longitude: 79.8899, landmark: 'Super Market', created_at: new Date().toISOString() },
    { id: 'stop-11', name: 'Maharagama', name_si: 'මහරගම', latitude: 6.8467, longitude: 79.9269, landmark: 'Town Center', created_at: new Date().toISOString() },
    { id: 'stop-12', name: 'Kottawa', name_si: 'කොට්ටාව', latitude: 6.8417, longitude: 79.9647, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-13', name: 'Rajagiriya', name_si: 'රාජගිරිය', latitude: 6.9066, longitude: 79.8961, landmark: 'Parliament Road', created_at: new Date().toISOString() },
    { id: 'stop-14', name: 'Battaramulla', name_si: 'බත්තරමුල්ල', latitude: 6.8989, longitude: 79.9178, landmark: 'Parliament', created_at: new Date().toISOString() },
    { id: 'stop-15', name: 'Malabe', name_si: 'මාලබේ', latitude: 6.9022, longitude: 79.9558, landmark: 'SLIIT, NSBM', created_at: new Date().toISOString() },
    { id: 'stop-16', name: 'Moratuwa', name_si: 'මොරටුව', latitude: 6.7733, longitude: 79.8819, landmark: 'University', created_at: new Date().toISOString() },
    { id: 'stop-17', name: 'Panadura', name_si: 'පානදුර', latitude: 6.7133, longitude: 79.9044, landmark: 'Town', created_at: new Date().toISOString() },
    { id: 'stop-18', name: 'Peliyagoda', name_si: 'පැලියගොඩ', latitude: 6.9611, longitude: 79.8833, landmark: 'Manning Market', created_at: new Date().toISOString() },
    { id: 'stop-19', name: 'Kadawatha', name_si: 'කඩවත', latitude: 7.0022, longitude: 79.9431, landmark: 'Town', created_at: new Date().toISOString() },
    { id: 'stop-20', name: 'Kiribathgoda', name_si: 'කිරිබත්ගොඩ', latitude: 6.9783, longitude: 79.9289, landmark: 'Junction', created_at: new Date().toISOString() },
    // New stops from user data
    { id: 'stop-21', name: 'Thalawathugoda', name_si: 'තලවතුගොඩ', latitude: 6.8747, longitude: 79.9123, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-31', name: 'Sethsiripaya', name_si: 'සෙත්සිරිපාය', latitude: 6.8994, longitude: 79.9155, landmark: 'Government Building', created_at: new Date().toISOString() },
    { id: 'stop-32', name: 'Koswatte', name_si: 'කොස්වත්ත', latitude: 6.9067, longitude: 79.9322, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-33', name: 'Town Hall', name_si: 'නගර ශාලාව', latitude: 6.9147, longitude: 79.8655, landmark: 'Colombo Municipal Council', created_at: new Date().toISOString() },
    { id: 'stop-34', name: 'Ratmalana', name_si: 'රත්මලාන', latitude: 6.8183, longitude: 79.8859, landmark: 'Airport Junction', created_at: new Date().toISOString() },
    { id: 'stop-35', name: 'Boralesgamuwa', name_si: 'බොරලැස්ගමුව', latitude: 6.8406, longitude: 79.9044, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-36', name: 'Kaduwela', name_si: 'කඩුවෙල', latitude: 6.9322, longitude: 79.9839, landmark: 'Bus Stand', created_at: new Date().toISOString() },
];

const createRouteStops = (routeId: string, stopIds: string[], times: number[]): RouteStop[] => {
    return stopIds.map((stopId, index) => ({
        id: `rs-${routeId}-${index}`,
        route_id: routeId,
        stop_id: stopId,
        stop_order: index + 1,
        estimated_time_from_start_mins: times[index],
    }));
};

export const mockRoutes: BusRoute[] = [
    {
        id: 'route-177', route_number: '177', route_name: 'Kollupitiya - Kaduwela',
        description: 'Via Sethsiripaya & Battaramulla', fare_estimate: 60, estimated_duration_mins: 55, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        // Kollupitiya (5) -> Town Hall (33) -> Borella (4) -> Rajagiriya (13) -> Battaramulla (14) -> Sethsiripaya (31) -> Malabe (15) -> Kaduwela (36)
        stops: createRouteStops('route-177', ['stop-5', 'stop-33', 'stop-4', 'stop-13', 'stop-14', 'stop-31', 'stop-15', 'stop-36'], [0, 8, 15, 25, 30, 35, 45, 55]),
    },
    {
        id: 'route-174', route_number: '174', route_name: 'Borella - Kottawa',
        description: 'Via Sethsiripaya & Thalawathugoda', fare_estimate: 55, estimated_duration_mins: 50, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        // Borella (4) -> Rajagiriya (13) -> Battaramulla (14) -> Sethsiripaya (31) -> Thalawathugoda (21) -> Kottawa (12)
        stops: createRouteStops('route-174', ['stop-4', 'stop-13', 'stop-14', 'stop-31', 'stop-21', 'stop-12'], [0, 10, 15, 20, 35, 50]),
    },
    {
        id: 'route-171', route_number: '171', route_name: 'Koswatte - Pettah',
        description: 'Via Rajagiriya', fare_estimate: 50, estimated_duration_mins: 45, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        // Koswatte (32) -> Thalawathugoda (21) -> Sethsiripaya (31) -> Battaramulla (14) -> Rajagiriya (13) -> Borella (4) -> Pettah (2)
        stops: createRouteStops('route-171', ['stop-32', 'stop-21', 'stop-31', 'stop-14', 'stop-13', 'stop-4', 'stop-2'], [0, 10, 15, 20, 30, 35, 45]),
    },
    {
        id: 'route-138', route_number: '138', route_name: 'Maharagama - Pettah',
        description: 'Main route from Maharagama', fare_estimate: 60, estimated_duration_mins: 55, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        stops: createRouteStops('route-138', ['stop-11', 'stop-10', 'stop-7', 'stop-6', 'stop-5', 'stop-1', 'stop-2'], [0, 15, 25, 35, 45, 52, 55]),
    },
    {
        id: 'route-100', route_number: '100', route_name: 'Panadura - Pettah',
        description: 'Galle Road direct', fare_estimate: 80, estimated_duration_mins: 90, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        stops: createRouteStops('route-100', ['stop-17', 'stop-16', 'stop-34', 'stop-9', 'stop-8', 'stop-7', 'stop-6', 'stop-5', 'stop-1', 'stop-2'], [0, 20, 35, 45, 55, 65, 75, 82, 88, 90]),
    },
    {
        id: 'route-101', route_number: '101', route_name: 'Moratuwa - Pettah',
        description: 'Galle Road direct', fare_estimate: 70, estimated_duration_mins: 75, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        stops: createRouteStops('route-101', ['stop-16', 'stop-34', 'stop-9', 'stop-8', 'stop-7', 'stop-6', 'stop-5', 'stop-1', 'stop-2'], [0, 15, 25, 35, 45, 55, 62, 70, 75]),
    },
    {
        id: 'route-154', route_number: '154', route_name: 'Angulana - Kiribathgoda',
        description: 'Cross-city main route', fare_estimate: 70, estimated_duration_mins: 75, status: 'verified',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        stops: createRouteStops('route-154', ['stop-9', 'stop-7', 'stop-6', 'stop-4', 'stop-3', 'stop-18', 'stop-20'], [0, 15, 25, 45, 55, 65, 75]),
    },
];

// Ensure required stops are present in mockStops
const extraStops = [
    { id: 'stop-22', name: 'Nawala', name_si: 'නාවල', latitude: 6.8933, longitude: 79.8889, landmark: 'OUSL', created_at: new Date().toISOString() },
    { id: 'stop-23', name: 'Narahenpita', name_si: 'නාරාහේන්පිට', latitude: 6.9006, longitude: 79.8672, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-24', name: 'Kotte', name_si: 'කෝට්ටේ', latitude: 6.8914, longitude: 79.9039, landmark: 'Jayawardenepura', created_at: new Date().toISOString() },
    { id: 'stop-25', name: 'Pitakotte', name_si: 'පිටකෝට්ටේ', latitude: 6.8883, longitude: 79.8961, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-29', name: 'Mirihana', name_si: 'මිරිහාන', latitude: 6.8722, longitude: 79.9042, landmark: 'Junction', created_at: new Date().toISOString() },
    { id: 'stop-30', name: 'Wijerama', name_si: 'විජේරාම', latitude: 6.8772, longitude: 79.8856, landmark: 'Junction', created_at: new Date().toISOString() },
];

extraStops.forEach(s => {
    if (!mockStops.find(ms => ms.id === s.id)) {
        mockStops.push(s);
    }
});

// Populate stop data in routes
mockRoutes.forEach(route => {
    if (route.stops) {
        route.stops.forEach(routeStop => {
            routeStop.stop = mockStops.find(s => s.id === routeStop.stop_id);
        });
    }
});
