'use client';

import { Bus, MapPin, Users, TrendingUp } from 'lucide-react';
import { mockRoutes, mockStops } from '@/lib/mock-data';

export function Stats() {
    const stats = [
        {
            icon: Bus,
            label: 'Bus Routes',
            value: mockRoutes.length,
            color: 'from-amber-400 to-orange-500',
        },
        {
            icon: MapPin,
            label: 'Bus Stops',
            value: mockStops.length,
            color: 'from-cyan-400 to-blue-500',
        },
        {
            icon: Users,
            label: 'Contributors',
            value: 12,
            color: 'from-purple-400 to-pink-500',
        },
        {
            icon: TrendingUp,
            label: 'Searches Today',
            value: '1.2K',
            color: 'from-emerald-400 to-green-500',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300"
                >
                    {/* Background gradient on hover */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />

                    <div className="relative">
                        <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
                        >
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-white/50 text-sm">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
