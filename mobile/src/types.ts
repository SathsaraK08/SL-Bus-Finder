// Shared types for SL Bus Finder mobile app
// Same types as web version for consistency

export type UserRole = 'user' | 'contributor' | 'moderator' | 'admin';
export type RouteStatus = 'pending' | 'verified' | 'rejected';
export type ContributionType = 'new_route' | 'edit' | 'correction';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';
export type VoteType = 'up' | 'down';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: UserRole;
    reputation_score: number;
    created_at: string;
}

export interface BusRoute {
    id: string;
    route_number: string;
    route_name: string;
    description?: string;
    fare_estimate?: number;
    estimated_duration_mins?: number;
    status: RouteStatus;
    verified_by?: string;
    created_at: string;
    updated_at: string;
    stops?: RouteStop[];
    contributor?: User;
}

export interface BusStop {
    id: string;
    name: string;
    name_si?: string;
    name_ta?: string;
    latitude: number;
    longitude: number;
    landmark?: string;
    created_at: string;
}

export interface RouteStop {
    id: string;
    route_id: string;
    stop_id: string;
    stop_order: number;
    estimated_time_from_start_mins?: number;
    stop?: BusStop;
}

export interface TripLeg {
    route: BusRoute;
    from: BusStop;
    to: BusStop;
    fromOrder: number;
    toOrder: number;
    estimated_time_mins: number;
    fare: number;
}

export interface SearchResult {
    id: string;
    legs: TripLeg[];
    total_time_mins: number;
    total_fare: number;
    transferCount: number;
    type: 'direct' | 'transfer';
}

export interface SearchParams {
    from: string;
    to: string;
    time?: string;
}
