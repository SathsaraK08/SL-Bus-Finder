'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusStop } from '@/lib/types';
import {
    MapPin,
    Search,
    Plus,
    Edit3,
    Trash2,
    ChevronLeft,
    Globe2,
    Navigation,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function StopManagement() {
    const [stops, setStops] = useState<BusStop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStops();
    }, []);

    async function fetchStops() {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('stops')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setStops(data || []);
        } catch (error) {
            console.error('Error fetching stops:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredStops = stops.filter(stop =>
        stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.landmark?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-10">
            {/* Breadcrumbs & Header */}
            <div className="flex items-center gap-2 mb-6">
                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    Dashboard
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-sm font-medium">Bus Stops</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Bus Stop Hubs</h1>
                    <p className="text-slate-400">Manage geolocations for {stops.length} major hubs and stops</p>
                </div>
                <Link
                    href="/admin/stops/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Stop
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl mb-8">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search stops by name or landmark..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading stops database...</p>
                    </div>
                ) : filteredStops.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl">
                        <p className="text-slate-400">No stops found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    filteredStops.map((stop) => (
                        <div key={stop.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-slate-800 rounded-xl">
                                    <MapPin className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-100 mb-1">{stop.name}</h3>
                                {stop.landmark && (
                                    <p className="text-slate-400 text-sm flex items-center gap-1.5">
                                        <Navigation className="w-3 h-3" />
                                        {stop.landmark}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 mb-4 pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium uppercase tracking-wider">Coordinates</span>
                                    <span className="text-slate-300 font-mono">
                                        {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium uppercase tracking-wider">Sinhala</span>
                                    <span className="text-slate-300">{stop.name_si || '—'}</span>
                                </div>
                            </div>

                            <a
                                href={`https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-750 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 transition-colors"
                            >
                                <Globe2 className="w-3.5 h-3.5" />
                                View on Google Maps
                                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
