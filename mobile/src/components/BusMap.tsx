import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { BusRoute, BusStop } from '../types';

interface MapProps {
    legs?: {
        route: BusRoute;
        stops: BusStop[]; // Stops specific to this leg in order
    }[];
    stops: BusStop[]; // All relevant stops for markers
    height?: number;
}

export default function BusMap({ legs, stops, height = 300 }: MapProps) {
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
    }, [stops, legs]);

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
                {/* Draw Route Paths for each leg */}
                {legs && legs.map((leg, index) => (
                    <Polyline
                        key={`poly-${index}`}
                        coordinates={leg.stops.map(s => ({ latitude: s.latitude, longitude: s.longitude }))}
                        strokeColor={index === 0 ? "#06b6d4" : "#8b5cf6"} // Alternate colors for legs
                        strokeWidth={5}
                        lineDashPattern={index === 0 ? undefined : [5, 2]} // Dash second leg?
                    />
                ))}

                {/* Draw Stops */}
                {stops.map((stop, index) => {
                    const isTransferHub = legs && legs.length > 1 && legs[0].stops[legs[0].stops.length - 1].id === stop.id;

                    return (
                        <Marker
                            key={`${stop.id}-${index}`}
                            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                            title={stop.name}
                            description={stop.landmark}
                            pinColor={index === 0 ? 'green' : index === stops.length - 1 ? 'red' : isTransferHub ? 'orange' : '#06b6d4'}
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
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
