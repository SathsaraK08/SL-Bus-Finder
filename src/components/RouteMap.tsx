'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { mockStops } from '@/lib/mock-data';

// Dynamic import for Leaflet (client-side only)
export function RouteMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const { selectedRoute } = useAppStore();

    useEffect(() => {
        // Only import Leaflet on client side
        const initMap = async () => {
            if (!mapRef.current) return;

            const L = (await import('leaflet')).default;
            await import('leaflet/dist/leaflet.css');

            // Fix default marker icons
            delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // Initialize map if not already done
            if (!mapInstanceRef.current) {
                // Center on Colombo
                const map = L.map(mapRef.current).setView([6.9271, 79.8612], 12);

                // Add dark theme tiles
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    maxZoom: 19,
                }).addTo(map);

                mapInstanceRef.current = map;

                // Show all stops initially
                mockStops.forEach(stop => {
                    L.circleMarker([stop.latitude, stop.longitude], {
                        radius: 6,
                        fillColor: '#06b6d4',
                        color: '#0e7490',
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.6,
                    })
                        .bindPopup(`<b>${stop.name}</b><br>${stop.landmark || ''}`)
                        .addTo(map);
                });
            }
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update map when route is selected
    useEffect(() => {
        const updateRoute = async () => {
            if (!mapInstanceRef.current || !selectedRoute?.stops) return;

            const L = (await import('leaflet')).default;
            const map = mapInstanceRef.current;

            // Clear existing route layers
            map.eachLayer((layer) => {
                if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Re-add tile layer if removed
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 19,
            }).addTo(map);

            // Get coordinates for the route
            const coordinates: [number, number][] = [];
            selectedRoute.stops.forEach((routeStop) => {
                const stop = mockStops.find((s) => s.id === routeStop.stop_id);
                if (stop) {
                    coordinates.push([stop.latitude, stop.longitude]);
                }
            });

            if (coordinates.length === 0) return;

            // Draw route line
            const polyline = L.polyline(coordinates, {
                color: '#f59e0b',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5',
            }).addTo(map);

            // Add markers for each stop
            selectedRoute.stops.forEach((routeStop, index) => {
                const stop = mockStops.find((s) => s.id === routeStop.stop_id);
                if (!stop) return;

                const isFirst = index === 0;
                const isLast = index === selectedRoute.stops!.length - 1;

                // Create custom icon
                const iconHtml = `
          <div style="
            width: 30px;
            height: 30px;
            background: ${isFirst ? '#10b981' : isLast ? '#f43f5e' : '#f59e0b'};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          ">
            ${index + 1}
          </div>
        `;

                const icon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                });

                L.marker([stop.latitude, stop.longitude], { icon })
                    .bindPopup(`
            <div style="text-align: center;">
              <b>${stop.name}</b><br>
              <span style="color: #666;">${stop.landmark || ''}</span><br>
              <span style="color: #0891b2;">Stop #${index + 1}</span>
            </div>
          `)
                    .addTo(map);
            });

            // Fit map to route bounds
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        };

        updateRoute();
    }, [selectedRoute]);

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10">
            <div ref={mapRef} className="w-full h-full" />

            {/* Map overlay info */}
            {selectedRoute && (
                <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
                    <p className="text-white font-semibold">
                        Route {selectedRoute.route_number}
                    </p>
                    <p className="text-white/60 text-sm">{selectedRoute.route_name}</p>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
                <p className="text-white/60 text-xs mb-2">Legend</p>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-white/80">Start</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-white/80">End</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-white/80">Stop</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
