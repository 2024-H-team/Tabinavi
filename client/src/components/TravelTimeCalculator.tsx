'use client';
import { useEffect, useState } from 'react';
import styles from '@styles/componentStyles/create-schedule/SchedulePreview.module.scss';

interface TravelTimeCalculatorProps {
    origin: google.maps.LatLngLiteral;
    destination: google.maps.LatLngLiteral;
    onDurationCalculated?: (duration: string) => void;
}

type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

export const TravelTimeCalculator: React.FC<TravelTimeCalculatorProps> = ({
    origin,
    destination,
    onDurationCalculated,
}) => {
    const [selectedMode, setSelectedMode] = useState<TravelMode>('WALKING');
    const [duration, setDuration] = useState<string>('...');

    useEffect(() => {
        if (!window.google) return;

        const calculateWalkingToNearestStation = async () => {
            const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
            const directionsService = new window.google.maps.DirectionsService();

            try {
                // Tìm ga gần nhất từ điểm xuất phát (origin)
                const nearestOriginStation = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
                    placesService.nearbySearch(
                        {
                            location: origin,
                            radius: 1000,
                            type: 'transit_station',
                        },
                        (results, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
                                resolve(results[0]);
                            } else {
                                reject('No origin transit station found');
                            }
                        },
                    );
                });

                // Tìm ga gần nhất từ điểm đích (destination)
                const nearestDestinationStation = await new Promise<google.maps.places.PlaceResult>(
                    (resolve, reject) => {
                        placesService.nearbySearch(
                            {
                                location: destination,
                                radius: 1000,
                                type: 'transit_station',
                            },
                            (results, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
                                    resolve(results[0]);
                                } else {
                                    reject('No destination transit station found');
                                }
                            },
                        );
                    },
                );

                // Tính thời gian đi bộ từ origin tới ga gần nhất
                const walkingToOriginStation = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
                    directionsService.route(
                        {
                            origin,
                            destination: {
                                lat: nearestOriginStation.geometry?.location?.lat() || 0,
                                lng: nearestOriginStation.geometry?.location?.lng() || 0,
                            },
                            travelMode: google.maps.TravelMode.WALKING,
                        },
                        (response, status) => {
                            if (status === google.maps.DirectionsStatus.OK) {
                                if (response) {
                                    resolve(response);
                                } else {
                                    reject('No directions found');
                                }
                            } else {
                                reject(status);
                            }
                        },
                    );
                });

                const walkingDurationToOriginStation = walkingToOriginStation.routes[0].legs[0].duration?.text || 'N/A';

                // Tính thời gian đi bộ từ ga gần nhất tới điểm đích
                const walkingFromDestinationStation = await new Promise<google.maps.DirectionsResult>(
                    (resolve, reject) => {
                        directionsService.route(
                            {
                                origin: {
                                    lat: nearestDestinationStation.geometry?.location?.lat() || 0,
                                    lng: nearestDestinationStation.geometry?.location?.lng() || 0,
                                },
                                destination,
                                travelMode: google.maps.TravelMode.WALKING,
                            },
                            (response, status) => {
                                if (status === google.maps.DirectionsStatus.OK) {
                                    if (response) {
                                        resolve(response);
                                    } else {
                                        reject('No directions found');
                                    }
                                } else {
                                    reject(status);
                                }
                            },
                        );
                    },
                );

                const walkingDurationFromDestinationStation =
                    walkingFromDestinationStation.routes[0].legs[0].duration?.text || 'N/A';

                // Cập nhật kết quả
                setDuration(
                    `出発徒歩: ${walkingDurationToOriginStation}, 目的地歩き: ${walkingDurationFromDestinationStation}`,
                );
                onDurationCalculated?.(
                    `出発徒歩: ${walkingDurationToOriginStation}, 目的地歩き: ${walkingDurationFromDestinationStation}`,
                );
            } catch (error) {
                console.error('Failed to calculate walking durations:', error);
                setDuration('経路が見つかりません');
                onDurationCalculated?.('N/A');
            }
        };

        const calculateRegularDuration = async () => {
            const directionsService = new window.google.maps.DirectionsService();

            try {
                const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
                    directionsService.route(
                        {
                            origin,
                            destination,
                            travelMode: google.maps.TravelMode[selectedMode],
                        },
                        (response, status) => {
                            if (status === google.maps.DirectionsStatus.OK && response) {
                                resolve(response);
                            } else {
                                reject(status);
                            }
                        },
                    );
                });

                const durationText = result.routes[0].legs[0].duration?.text || 'N/A';
                setDuration(durationText);
                onDurationCalculated?.(durationText);
            } catch (error) {
                console.error('Failed to calculate duration:', error);
                setDuration('N/A');
                onDurationCalculated?.('N/A');
            }
        };

        if (selectedMode === 'TRANSIT') {
            calculateWalkingToNearestStation();
        } else {
            calculateRegularDuration();
        }
    }, [origin, destination, selectedMode, onDurationCalculated]);

    return (
        <div className={styles.travelTimeCalculator}>
            <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as TravelMode)}
                className={styles.modeSelect}
            >
                <option value="WALKING">徒歩</option>
                <option value="DRIVING">車</option>
                <option value="TRANSIT">電車</option>
            </select>
            <p className={styles.duration}>移動時間: {duration}</p>
        </div>
    );
};
