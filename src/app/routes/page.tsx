'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusRoute } from '@/lib/types';
import { Bus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function RoutesPage() {
    const [routes, setRoutes] = useState<BusRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRoutes() {
            const { data } = await supabase.from('routes').select('*').order('route_number');
            setRoutes(data || []);
            setIsLoading(false);
        }
        fetchRoutes();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Bus Routes</h1>
                        <p className="text-slate-400">All currently supported routes in the Colombo network.</p>
                    </div>
                    <Bus className="w-10 h-10 text-cyan-400 opacity-20" />
                </div>

                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {routes.map((route) => (
                            <Link
                                key={route.id}
                                href="/"
                                className="group bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-xl text-white border border-slate-700 group-hover:border-cyan-500/50 transition-colors">
                                        {route.route_number}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{route.route_name}</h3>
                                        <p className="text-slate-500 text-sm">{route.description || 'No description available'}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
