'use client';

import { Bus, Github, Heart } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-shadow">
                                <Bus className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                <span className="text-[8px] font-bold text-slate-900">SL</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">
                                SL Bus Finder
                            </h1>
                            <p className="text-white/40 text-xs">Western Province</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-white/70 hover:text-white transition-colors text-sm"
                        >
                            Find Routes
                        </Link>
                        <Link
                            href="/routes"
                            className="text-white/70 hover:text-white transition-colors text-sm"
                        >
                            All Routes
                        </Link>
                        <Link
                            href="/contribute"
                            className="text-white/70 hover:text-white transition-colors text-sm"
                        >
                            Contribute
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <Github className="w-5 h-5 text-white/70" />
                        </a>
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                            <Heart className="w-4 h-4" />
                            Contribute
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
