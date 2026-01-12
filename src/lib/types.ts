// Database types for SL Bus Finder

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
  // Joined data
  stops?: RouteStop[];
  contributor?: User;
}

export interface BusStop {
  id: string;
  name: string;
  name_si?: string; // Sinhala
  name_ta?: string; // Tamil
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
  // Joined data
  stop?: BusStop;
}

export interface Contribution {
  id: string;
  user_id: string;
  route_id: string;
  type: ContributionType;
  changes: Record<string, unknown>;
  status: ContributionStatus;
  upvotes: number;
  downvotes: number;
  created_at: string;
  // Joined data
  user?: User;
  route?: BusRoute;
}

export interface Vote {
  id: string;
  user_id: string;
  contribution_id: string;
  vote_type: VoteType;
  created_at: string;
}

// Search related types
export interface SearchResult {
  route: BusRoute;
  matchedStops: {
    from: BusStop;
    to: BusStop;
    fromOrder: number;
    toOrder: number;
  };
  travelTime?: number;
  fareEstimate?: number;
}

export interface SearchParams {
  from: string;
  to: string;
  time?: string;
}
