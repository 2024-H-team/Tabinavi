'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { searchNearbyPlaces } from '@/utils/mapCalculations';
import Styles from '@styles/appStyles/schedule/createSchedule.module.scss';
import SpotInfo from '@/components/create-schedule/SpotInfo';
import { PlaceDetails } from '@/types/PlaceDetails';
import SelectedSpotsContainer from '@/components/create-schedule/SelectedSpotsContainer';
import apiClient from '@/lib/axios';
import RecommendSpotsContainer from '@/components/create-schedule/RecommendSpotsContainer';

const CreateScheduleMap = dynamic(() => import('@/components/create-schedule/CreateScheduleMap'), { ssr: false });

export default function CreateSchedule() {
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [selectedSpots, setSelectedSpots] = useState<PlaceDetails[]>([]);
    const [recommendedSpots, setRecommendedSpots] = useState<PlaceDetails[]>([]);
    const [visibleRecommendedSpots, setVisibleRecommendedSpots] = useState<PlaceDetails[]>([]);
    const [focusedSpot, setFocusedSpot] = useState<PlaceDetails | null>(null);

    const handleAddSpot = useCallback((spot: PlaceDetails) => {
        setSelectedSpots((prevSpots) => [...prevSpots, spot]);
    }, []);

    const handleDeleteSpot = useCallback((index: number) => {
        setSelectedSpots((prevSpots) => prevSpots.filter((_, i) => i !== index));
    }, []);

    const handleLoadMore = (visibleSpots: PlaceDetails[]) => {
        setVisibleRecommendedSpots(visibleSpots);
    };

    const handleFocusSpot = useCallback((spot: PlaceDetails) => {
        setFocusedSpot(spot);
        setSelectedPlaces([spot]);
    }, []);

    const handleRecommendClick = async () => {
        if (selectedSpots.length === 0) {
            alert('少なくとも1つの場所を選択してください');
            return;
        }

        try {
            const processedSpots = selectedSpots.reduce((acc: { type: string; count: number }[], spot) => {
                const type = spot.primaryType;
                if (!type) return acc;
                const existing = acc.find((item) => item.type === type);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({ type, count: 1 });
                }
                return acc;
            }, []);

            const response = await apiClient.post('/recommended-place-types', {
                selectedPlaces: processedSpots,
            });

            if (response.data.success) {
                const nearbyPlaces = await searchNearbyPlaces(selectedSpots, response.data.data);
                setRecommendedSpots(nearbyPlaces || []);
                setVisibleRecommendedSpots(nearbyPlaces?.slice(0, 5) || []);
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
        }
    };

    return (
        <div className={Styles.page}>
            <div className={Styles.mapContainer}>
                <h1>スケジュール作成</h1>
                <CreateScheduleMap
                    onPlaceSelect={setSelectedPlaces}
                    recommendedSpots={visibleRecommendedSpots}
                    focusedSpot={focusedSpot}
                />
            </div>
            <SpotInfo places={selectedPlaces} onAddSpot={handleAddSpot} />
            <RecommendSpotsContainer
                recommendedSpots={recommendedSpots}
                onLoadMore={handleLoadMore}
                onFocusSpot={handleFocusSpot}
            />
            <SelectedSpotsContainer selectedSpots={selectedSpots} onDeleteSpot={handleDeleteSpot} />
            <button
                onClick={handleRecommendClick}
                style={{
                    position: 'absolute',
                    top: '50px',
                    right: '50px',
                    padding: '10px 20px',
                }}
            >
                Recommend
            </button>
        </div>
    );
}
