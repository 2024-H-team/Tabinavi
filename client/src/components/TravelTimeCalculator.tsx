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

        const calculateDuration = async () => {
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

        calculateDuration();
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
