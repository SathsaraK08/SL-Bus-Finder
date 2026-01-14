'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusRoute } from '@/lib/types';
import {
    Bus,
    Search,
    AlertCircle,
    Trash2,
    Edit3,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function RouteManagement() {
    const [routes, setRoutes] = useState<BusRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

    useEffect(() => {
        fetchRoutes();
    }, []);

    async function fetchRoutes() {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('route_number', { ascending: true });

            if (error) throw error;
            setRoutes(data || []);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredRoutes = routes.filter(route => {
        const matchesSearch =
            route.route_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.route_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || route.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'rejected': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-10">
            {/* Breadcrumbs & Header */}
            <div className="flex items-center gap-2 mb-6">
                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    Dashboard
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-sm font-medium">Routes</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Route Management</h1>
                    <p className="text-slate-400">Total {routes.length} routes registered in the system</p>
                </div>
                <Link
                    href="/admin/routes/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition-colors"
                >
                    <Bus className="w-4 h-4" />
                    Add New Route
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by number or name..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'verified', 'pending', 'rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s as 'all' | 'verified' | 'pending' | 'rejected')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${statusFilter === s
                                ? 'bg-slate-700 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Routes Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading database...</p>
                    </div>
                ) : filteredRoutes.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 text-lg">No routes found matching your criteria</p>
                        <button
                            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                            className="mt-4 text-cyan-400 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/30">
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Number</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Route Info</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fare (Rs)</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoutes.map((route) => (
                                    <tr key={route.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-100 border border-slate-600">
                                                {route.route_number}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-100 text-sm">{route.route_name}</div>
                                            <div className="text-slate-500 text-xs mt-1 truncate max-w-xs">{route.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-mono text-slate-300">{route.fare_estimate}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(route.status)}`}>
                                                {route.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Tips Footer */}
            <div className="mt-8 flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-slate-400 text-sm">
                    <span className="text-cyan-400 font-semibold">Tip:</span> Ensure route numbers are accurate as they are used for mobile search logic and transfer identifications.
                </p>
            </div>
        </div>
    );
}
