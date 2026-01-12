'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusRoute, BusStop } from '@/lib/types';
import {
    Bus,
    MapPin,
    Settings,
    Plus,
    CheckCircle2,
    Clock,
    ChevronRight,
    Database,
    BarChart3,
    Users
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRoutes: 0,
        totalStops: 0,
        pendingVerifications: 0,
        totalContributions: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [routes, stops] = await Promise.all([
                    supabase.from('routes').select('*', { count: 'exact', head: true }),
                    supabase.from('stops').select('*', { count: 'exact', head: true })
                ]);

                setStats({
                    totalRoutes: routes.count || 0,
                    totalStops: stops.count || 0,
                    pendingVerifications: 0, // Placeholder
                    totalContributions: 0 // Placeholder
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Command Center</h1>
                    <p className="text-slate-400">Manage the Sri Lanka Bus Finder network</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/routes/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Route
                    </Link>
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                        <Settings className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Active Routes', value: stats.totalRoutes, icon: Bus, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                    { label: 'Total Stops', value: stats.totalStops, icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Pending Edits', value: stats.pendingVerifications, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Total Users', value: 124, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-slate-400 font-medium">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Management Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Link href="/admin/routes" className="group p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Database className="w-6 h-6 text-cyan-400" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Route Database</h3>
                            <p className="text-slate-400 text-sm">View, edit, and optimize all Colombo bus routes</p>
                        </Link>

                        <Link href="/admin/stops" className="group p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6 text-purple-400" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bus Stops</h3>
                            <p className="text-slate-400 text-sm">Manage the geolocations and landmarks of central hubs</p>
                        </Link>
                    </div>

                    {/* Pending Tasks */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-400" />
                            Verifications Required
                        </h3>
                        <div className="text-center py-10">
                            <div className="p-4 bg-slate-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                                <CheckCircle2 className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400">All routes are currently verified. Great job!</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                            System Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Supabase API</span>
                                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Healthy
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Gemini AI Engine</span>
                                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Mobile Sync</span>
                                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Syncing
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">Admin Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3" /> API Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3" /> Data Export (CSV)
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3" /> Community Guidelines
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
