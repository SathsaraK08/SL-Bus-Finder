'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { BusStop } from '@/lib/types';

interface SearchInputProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    icon: 'from' | 'to';
}

export function SearchInput({ placeholder, value, onChange, icon }: SearchInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { stops } = useAppStore();

    const suggestions = useMemo(() => {
        if (value.length > 1) {
            return stops.filter(
                (stop) =>
                    stop.name.toLowerCase().includes(value.toLowerCase()) ||
                    stop.landmark?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
        }
        return [];
    }, [value, stops]);

    const handleSelect = (stop: BusStop) => {
        onChange(stop.name);
        setIsFocused(false);
    };

    return (
        <div className="relative w-full">
            <div
                className={`flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-4 border transition-all duration-300 ${isFocused
                    ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'border-white/20 hover:border-white/40'
                    }`}
            >
                <div
                    className={`p-2 rounded-full ${icon === 'from'
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : 'bg-gradient-to-br from-rose-400 to-red-500'
                        }`}
                >
                    {icon === 'from' ? (
                        <Search className="w-4 h-4 text-white" />
                    ) : (
                        <MapPin className="w-4 h-4 text-white" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-lg"
                />
            </div>

            {/* Suggestions dropdown */}
            {isFocused && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl overflow-hidden">
                    {suggestions.map((stop) => (
                        <button
                            key={stop.id}
                            onClick={() => handleSelect(stop)}
                            className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3"
                        >
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            <div>
                                <p className="text-white font-medium">{stop.name}</p>
                                {stop.landmark && (
                                    <p className="text-white/50 text-sm">{stop.landmark}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
