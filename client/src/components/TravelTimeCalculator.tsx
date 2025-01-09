'use client';
import { useEffect, useState } from 'react';
import styles from '@styles/componentStyles/create-schedule/SchedulePreview.module.scss';
import { BestRoute } from '@/types/TransferData';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<TravelMode>('WALKING');
    const [duration, setDuration] = useState<string>('...');
    const [transferData, setTransferData] = useState<BestRoute | null>(null);
    useEffect(() => {
        if (!window.google) return;

        const findNearestStation = async (
            location: google.maps.LatLngLiteral,
            types: string[],
        ): Promise<google.maps.places.PlaceResult | null> => {
            const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));

            const isBusStation = (name: string) => {
                const busKeywords = ['バス', 'bus', 'バス停', 'バスターミナル'];
                return busKeywords.some((keyword) => name.toLowerCase().includes(keyword.toLowerCase()));
            };

            const isTrainStation = (name: string) => {
                return name.endsWith('駅');
            };

            for (const type of types) {
                try {
                    const result = await new Promise<google.maps.places.PlaceResult | null>((resolve, reject) => {
                        placesService.nearbySearch(
                            {
                                location,
                                radius: 1000,
                                type: type as string,
                            },
                            (results, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
                                    const nonBusStations = results.filter((place) => !isBusStation(place.name || ''));
                                    const trainStation = nonBusStations.find((place) =>
                                        isTrainStation(place.name || ''),
                                    );
                                    resolve(trainStation || nonBusStations[0]);
                                } else {
                                    reject(null);
                                }
                            },
                        );
                    });
                    if (result) return result;
                } catch (error) {
                    console.warn(`No results found for type: ${type}, ${error}`);
                }
            }

            console.error('No stations found within range for all types.');
            return null;
        };

        const calculateWalkingToNearestStation = async () => {
            const directionsService = new window.google.maps.DirectionsService();
            const stationTypes = ['transit_station', 'subway_station', 'train_station'];

            try {
                const nearestOriginStation = await findNearestStation(origin, stationTypes);
                const nearestDestinationStation = await findNearestStation(destination, stationTypes);

                if (!nearestOriginStation || !nearestDestinationStation) {
                    throw new Error('No stations found near origin or destination.');
                }

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
                            if (status === google.maps.DirectionsStatus.OK && response) {
                                resolve(response);
                            } else {
                                reject(status || 'No response received');
                            }
                        },
                    );
                });

                const walkingDurationToOriginStation = walkingToOriginStation.routes[0].legs[0].duration?.value || 0; // seconds

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
                                if (status === google.maps.DirectionsStatus.OK && response) {
                                    resolve(response);
                                } else {
                                    reject(status || 'No response received');
                                }
                            },
                        );
                    },
                );

                const walkingDurationFromDestinationStation =
                    walkingFromDestinationStation.routes[0].legs[0].duration?.value || 0;

                const cleanStationName = (name: string) => name.replace(/駅$/, '');
                const startName = cleanStationName(nearestOriginStation.name || '');
                const endName = cleanStationName(nearestDestinationStation.name || '');

                const response = await fetch('http://localhost:5050/api/route', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startStation: startName,
                        endStation: endName,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch route data from API.');
                }

                const data: BestRoute = await response.json();
                setTransferData(data);
                const trainCostMinutes = data.totalCost;

                const totalTimeSeconds =
                    walkingDurationToOriginStation + walkingDurationFromDestinationStation + trainCostMinutes * 60;

                const totalHours = Math.floor(totalTimeSeconds / 3600);
                const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);
                const totalDuration = totalHours > 0 ? `${totalHours}時間${totalMinutes}分` : `${totalMinutes}分`;

                setDuration(
                    `出発徒歩: ${Math.floor(
                        walkingDurationToOriginStation / 60,
                    )}分, 電車時間: ${trainCostMinutes}分, 目的地歩き: ${Math.floor(
                        walkingDurationFromDestinationStation / 60,
                    )}分, 合計: ${totalDuration}`,
                );
                onDurationCalculated?.(totalDuration);
            } catch (error) {
                console.error('Failed to calculate durations:', error);
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

    const handleDurationClick = () => {
        if (transferData) {
            sessionStorage.setItem('transferData', JSON.stringify(transferData));
            router.push('/create-schedule/schedule-preview/transfer');
        } else {
            console.error('No transfer data to save');
        }
    };

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
            <p className={styles.duration}>
                移動時間: {duration}
                {selectedMode === 'TRANSIT' && (
                    <span
                        onClick={handleDurationClick}
                        style={{
                            cursor: 'pointer',
                            marginLeft: '8px',
                            color: 'blue', // Màu sắc để nhấn mạnh
                            fontWeight: 'bold',
                        }}
                    >
                        &gt;
                    </span>
                )}
            </p>
        </div>
    );
};
