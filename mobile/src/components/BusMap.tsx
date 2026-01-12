import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { BusRoute, BusStop } from '../types';

interface MapProps {
    route?: BusRoute;
    stops: BusStop[];
    height?: number;
}

export default function BusMap({ route, stops, height = 300 }: MapProps) {
    const mapRef = useRef<MapView>(null);

    // Calculate region to fit all stops
    useEffect(() => {
        if (stops.length > 0 && mapRef.current) {
            const coordinates = stops.map(stop => ({
                latitude: stop.latitude,
                longitude: stop.longitude,
            }));

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [stops, route]);

    // If no stops, default to Colombo center
    const initialRegion = {
        latitude: 6.9271,
        longitude: 79.8612,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <View style={[styles.container, { height }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {/* Draw Route Path */}
                {route && stops.length > 1 && (
                    <Polyline
                        coordinates={stops.map(s => ({ latitude: s.latitude, longitude: s.longitude }))}
                        strokeColor="#06b6d4" // Primary cyan color
                        strokeWidth={4}
                        lineDashPattern={[1]}
                    />
                )}

                {/* Draw Stops */}
                {stops.map((stop, index) => (
                    <Marker
                        key={stop.id}
                        coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                        title={stop.name}
                        description={stop.landmark}
                        pinColor={index === 0 ? 'green' : index === stops.length - 1 ? 'red' : '#06b6d4'}
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
