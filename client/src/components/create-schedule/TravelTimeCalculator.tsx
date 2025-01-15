'use client';
import { useEffect, useState } from 'react';
import styles from '@styles/componentStyles/create-schedule/PreviewSpotItem.module.scss';
import { BestRoute } from '@/types/TransferData';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { TransportInfo } from '@/app/create-schedule/page';

type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

interface TravelTimeCalculatorProps {
    origin: google.maps.LatLngLiteral;
    destination: google.maps.LatLngLiteral;
    onTransportCalculated?: (transportInfo: TransportInfo) => void;
    transportInfo?: TransportInfo;
}

export const TravelTimeCalculator: React.FC<TravelTimeCalculatorProps> = ({
    origin,
    destination,
    onTransportCalculated,
    transportInfo,
}) => {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<TravelMode>(transportInfo?.mode || 'WALKING');
    const [duration, setDuration] = useState<string>('計算中');
    const [transferData, setTransferData] = useState<BestRoute | null>(null);
    const [isGoogleMapsReady, setGoogleMapsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && window.google.maps && typeof window.google.maps.DirectionsService === 'function') {
                setGoogleMapsReady(true);
                clearInterval(interval);
            }
        }, 300);
        if (!isGoogleMapsReady) return;

        const findNearestStation = async (location: google.maps.LatLngLiteral, types: string[]) => {
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
                                radius: 1500,
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
                } catch {}
            }
            return null;
        };

        const calculateWalkingToNearestStation = async () => {
            setLoading(true);
            const directionsService = new window.google.maps.DirectionsService();
            const stationTypes = ['transit_station', 'subway_station', 'train_station'];
            try {
                const nearestOriginStation = await findNearestStation(origin, stationTypes);
                const nearestDestinationStation = await findNearestStation(destination, stationTypes);
                if (!nearestOriginStation || !nearestDestinationStation) {
                    throw new Error();
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
                            if (status === google.maps.DirectionsStatus.OK && response) resolve(response);
                            else reject(status || 'No response received');
                        },
                    );
                });
                const walkingDurationToOriginStation = walkingToOriginStation.routes[0].legs[0].duration?.value || 0;
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
                                if (status === google.maps.DirectionsStatus.OK && response) resolve(response);
                                else reject(status || 'No response received');
                            },
                        );
                    },
                );
                const walkingDurationFromDestinationStation =
                    walkingFromDestinationStation.routes[0].legs[0].duration?.value || 0;
                const startName = (nearestOriginStation.name || '').replace(/駅$/, '');
                const endName = (nearestDestinationStation.name || '').replace(/駅$/, '');
                const response = await apiClient.post('/route', {
                    startStation: startName,
                    endStation: endName,
                });
                const data: BestRoute = response.data;
                setTransferData(data);
                const totalTimeSeconds =
                    walkingDurationToOriginStation + walkingDurationFromDestinationStation + data.totalCost * 60;
                const totalHours = Math.floor(totalTimeSeconds / 3600);
                const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);
                if (totalHours > 0) setDuration(`歩き：${totalHours}時間${totalMinutes}分`);
                else setDuration(`${totalMinutes}分`);
                setLoading(false);
            } catch {
                setDuration('経路が見つかりません');
            }
        };

        const calculateRegularDuration = async () => {
            setLoading(true);
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
                            if (status === google.maps.DirectionsStatus.OK && response) resolve(response);
                            else reject(status);
                        },
                    );
                });
                const durationText = result.routes[0].legs[0].duration?.text || 'N/A';
                setDuration(durationText);
                setLoading(false);
            } catch {
                setDuration('N/A');
            }
        };

        if (selectedMode === 'TRANSIT') {
            calculateWalkingToNearestStation();
        } else {
            calculateRegularDuration();
        }
    }, [origin, destination, selectedMode, isGoogleMapsReady]);

    useEffect(() => {
        if (!loading && duration !== '計算中' && duration !== 'N/A') {
            onTransportCalculated?.({
                mode: selectedMode,
                duration,
                routeDetail: transferData || undefined,
            });
        }
    }, [loading, duration, selectedMode, transferData, onTransportCalculated]);

    const handleDurationClick = () => {
        if (transferData) {
            sessionStorage.setItem('transferData', JSON.stringify(transferData));
            router.push('/create-schedule/schedule-preview/transfer');
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
            {loading ? (
                <p className={styles.duration}>計算中...</p>
            ) : (
                <p className={styles.duration}>
                    {duration}
                    {selectedMode === 'TRANSIT' && transferData && (
                        <span
                            onClick={handleDurationClick}
                            style={{ cursor: 'pointer', marginLeft: '8px', color: 'blue', fontWeight: 'bold' }}
                        >
                            &gt;
                        </span>
                    )}
                </p>
            )}
        </div>
    );
};
