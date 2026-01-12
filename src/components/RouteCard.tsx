'use client';

import { Clock, Banknote, MapPin, ChevronRight, Bus } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface RouteCardProps {
    result: SearchResult;
}

export function RouteCard({ result }: RouteCardProps) {
    const { setSelectedRoute, selectedRoute } = useAppStore();
    const isSelected = selectedRoute?.id === result.route.id;

    return (
        <button
            onClick={() => setSelectedRoute(result.route)}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
        >
            {/* Route number badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <Bus className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-slate-900 rounded-full border border-amber-400/50">
                            <span className="text-amber-400 text-xs font-bold">
                                {result.route.route_number}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg">
                            Route {result.route.route_number}
                        </h3>
                        <p className="text-white/60 text-sm">{result.route.route_name}</p>
                    </div>
                </div>
                <ChevronRight
                    className={`w-5 h-5 transition-transform ${isSelected ? 'text-cyan-400 rotate-90' : 'text-white/40'
                        }`}
                />
            </div>

            {/* From - To */}
            <div className="flex items-center gap-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white/80">{result.matchedStops.from.name}</span>
                </div>
                <div className="flex-1 border-t border-dashed border-white/20" />
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-white/80">{result.matchedStops.to.name}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
                {result.travelTime && (
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="text-white/70">{result.travelTime} mins</span>
                    </div>
                )}
                {result.fareEstimate && (
                    <div className="flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span className="text-white/70">Rs. {result.fareEstimate}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-white/70">
                        {result.matchedStops.toOrder - result.matchedStops.fromOrder} stops
                    </span>
                </div>
            </div>

            {/* Expanded details when selected */}
            {isSelected && result.route.stops && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/50 text-sm mb-3">All stops on this route:</p>
                    <div className="flex flex-wrap gap-2">
                        {result.route.stops.map((routeStop, index) => (
                            <span
                                key={routeStop.id}
                                className={`px-3 py-1 rounded-full text-xs ${routeStop.stop?.name === result.matchedStops.from.name
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : routeStop.stop?.name === result.matchedStops.to.name
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            : 'bg-white/5 text-white/60'
                                    }`}
                            >
                                {routeStop.stop?.name || `Stop ${index + 1}`}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </button>
    );
}
