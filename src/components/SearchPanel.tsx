'use client';

import { useState } from 'react';
import { ArrowRightLeft, Search, Loader2 } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { useAppStore } from '@/lib/store';

export function SearchPanel() {
    const {
        searchFrom,
        searchTo,
        setSearchFrom,
        setSearchTo,
        searchRoutes,
        isSearching,
    } = useAppStore();

    const [swapAnimation, setSwapAnimation] = useState(false);

    const handleSwap = () => {
        setSwapAnimation(true);
        const temp = searchFrom;
        setSearchFrom(searchTo);
        setSearchTo(temp);
        setTimeout(() => setSwapAnimation(false), 300);
    };

    const handleSearch = () => {
        if (searchFrom && searchTo) {
            searchRoutes(searchFrom, searchTo);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Glass card container */}
            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                {/* Decorative gradient orbs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                {/* Search inputs */}
                <div className="relative space-y-4">
                    {/* From input */}
                    <div
                        className={`transition-transform duration-300 ${swapAnimation ? '-translate-y-2 opacity-50' : ''
                            }`}
                    >
                        <SearchInput
                            placeholder="Where are you starting from?"
                            value={searchFrom}
                            onChange={setSearchFrom}
                            icon="from"
                        />
                    </div>

                    {/* Swap button */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button
                            onClick={handleSwap}
                            className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                            <ArrowRightLeft
                                className={`w-5 h-5 text-white transition-transform duration-300 ${swapAnimation ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* To input */}
                    <div
                        className={`transition-transform duration-300 ${swapAnimation ? 'translate-y-2 opacity-50' : ''
                            }`}
                    >
                        <SearchInput
                            placeholder="Where do you want to go?"
                            value={searchTo}
                            onChange={setSearchTo}
                            icon="to"
                        />
                    </div>
                </div>

                {/* Search button */}
                <button
                    onClick={handleSearch}
                    disabled={!searchFrom || !searchTo || isSearching}
                    className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl font-semibold text-white text-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Find My Bus
                        </>
                    )}
                </button>

                {/* Quick suggestions */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-white/40 text-sm">Popular:</span>
                    {['Fort', 'Nugegoda', 'Maharagama', 'Malabe', 'Kollupitiya'].map(
                        (place) => (
                            <button
                                key={place}
                                onClick={() => {
                                    if (!searchFrom) setSearchFrom(place);
                                    else if (!searchTo) setSearchTo(place);
                                }}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white text-sm transition-colors"
                            >
                                {place}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
