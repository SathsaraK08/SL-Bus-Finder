import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { BusStop, BusRoute } from '../types';

interface BusMapProps {
    legs: {
        route: BusRoute;
        stops: BusStop[];
    }[];
    stops: BusStop[];
    height?: number;
}

const colors = {
    bg: '#0f172a',
    primary: '#06b6d4',
    accent: '#f59e0b',
    success: '#10b981',
    text: '#f8fafc',
    danger: '#f43f5e',
};

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#1e293b" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#94a3b8" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#0f172a" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#334155" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#334155" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#1e293b" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#0f172a" }]
    }
];

export default function BusMap({ legs, stops, height = 300 }: BusMapProps) {
    // Calculate initial region based on stops
    const initialRegion = useMemo(() => {
        if (!stops || stops.length === 0) {
            return {
                latitude: 6.9271, // Colombo
                longitude: 79.8612,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
        }

        const lats = stops.map(s => s.latitude);
        const lngs = stops.map(s => s.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: (maxLat - minLat) * 1.5 || 0.02,
            longitudeDelta: (maxLng - minLng) * 1.5 || 0.02,
        };
    }, [stops]);

    return (
        <View style={[styles.container, { height }]}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                customMapStyle={mapStyle}
            >
                {/* Render routes as polylines */}
                {legs.map((leg, index) => (
                    <Polyline
                        key={`poly-${index}`}
                        coordinates={leg.stops.map(s => ({
                            latitude: s.latitude,
                            longitude: s.longitude
                        }))}
                        strokeColor={index === 0 ? colors.accent : colors.primary}
                        strokeWidth={4}
                    />
                ))}

                {/* Render stops as markers */}
                {stops.map(stop => {
                    const isTransfer = legs.length > 1 && legs.some((l, idx) =>
                        idx < legs.length - 1 && l.stops[l.stops.length - 1].id === stop.id
                    );

                    return (
                        <Marker
                            key={stop.id}
                            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                            title={stop.name}
                            description={stop.landmark || ''}
                            pinColor={isTransfer ? colors.success : colors.primary}
                        />
                    );
                })}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
