'use client';

import Link from 'next/link';
import { Heart, Smartphone, Download } from 'lucide-react';

export default function ContributePage() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
                    <Heart className="w-10 h-10 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Join the Community</h1>
                <p className="text-slate-400 mb-8">
                    The best way to contribute is through our mobile app! Report live bus positions, suggest new stops, and help Colombo stay moving.
                </p>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
                    <Smartphone className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Available on Mobile</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Download our beta app to start contributing today.
                    </p>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Download APK
                    </button>
                </div>

                <Link href="/" className="text-cyan-400 hover:underline text-sm">Back to Search</Link>
            </div>
        </div>
    );
}
