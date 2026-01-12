'use client';

import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
import { RouteCard } from '@/components/RouteCard';
import { Stats } from '@/components/Stats';
import { useAppStore } from '@/lib/store';
import { Bus, MapPin, Sparkles, ArrowRight } from 'lucide-react';

// Dynamic import for map (client-side only, no SSR)
const RouteMap = dynamic(
  () => import('@/components/RouteMap').then((mod) => mod.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-800/50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const { searchResults, selectedRoute } = useAppStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero text */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">
                Community Powered
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Find Your Bus in{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Colombo
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              The easiest way to navigate Colombo&apos;s bus network. Search routes,
              view stops, and get to your destination hassle-free.
            </p>
          </div>

          {/* Search Panel */}
          <SearchPanel />

          {/* Stats */}
          <div className="mt-12">
            <Stats />
          </div>
        </div>
      </section>

      {/* Results Section */}
      {searchResults.length > 0 && (
        <section className="py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Available Routes
                </h2>
                <p className="text-white/50">
                  Found {searchResults.length} route
                  {searchResults.length !== 1 ? 's' : ''} for your journey
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-white/50 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Click a route to view on map</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Route cards */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {searchResults.map((result) => (
                  <RouteCard key={result.route.id} result={result} />
                ))}
              </div>

              {/* Map */}
              <div className="h-[400px] lg:h-[600px] sticky top-24">
                <RouteMap />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty state / How it works */}
      {searchResults.length === 0 && (
        <section className="py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MapPin,
                  title: 'Enter Your Locations',
                  description:
                    'Tell us where you are and where you want to go',
                  color: 'from-emerald-400 to-green-500',
                },
                {
                  icon: Bus,
                  title: 'Find Your Bus',
                  description:
                    'We\'ll show you all available routes with times and fares',
                  color: 'from-amber-400 to-orange-500',
                },
                {
                  icon: ArrowRight,
                  title: 'Start Your Journey',
                  description:
                    'View the route on the map and head to your stop',
                  color: 'from-cyan-400 to-blue-500',
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 group hover:bg-white/10 transition-all duration-300"
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 border border-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Map preview */}
            <div className="mt-12 h-[400px] rounded-2xl overflow-hidden border border-white/10">
              <RouteMap />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60 text-sm">
                SL Bus Finder © 2026 - Made with ❤️ for Sri Lanka
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-white/50 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-white transition-colors"
              >
                Contribute
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-white transition-colors"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
