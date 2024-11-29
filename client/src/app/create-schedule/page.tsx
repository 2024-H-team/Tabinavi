'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const CreateScheduleMap = dynamic(() => import('@/components/create-schedule/CreateScheduleMap'), { ssr: false });

import Styles from '@styles/appStyles/schedule/createSchedule.module.scss';
import SpotInfo from '@/components/create-schedule/SpotInfo';
import { PlaceDetails } from '@/types/PlaceDetails';
import SelectedSpotsContainer from '@/components/create-schedule/SelectedSpotsContainer';

export default function CreateSchedule() {
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [selectedSpots, setSelectedSpots] = useState<PlaceDetails[]>([]);

    const handleAddSpot = useCallback((spot: PlaceDetails) => {
        setSelectedSpots((prevSpots) => [...prevSpots, spot]);
    }, []);
    const handleDeleteSpot = useCallback((index: number) => {
        setSelectedSpots((prevSpots) => prevSpots.filter((_, i) => i !== index));
    }, []);

    return (
        <div className={Styles.page}>
            <div className={Styles.mapContainer}>
                <h1>スケジュール作成</h1>
                <CreateScheduleMap onPlaceSelect={setSelectedPlaces} />
            </div>
            <SpotInfo places={selectedPlaces} onAddSpot={handleAddSpot} />
            <SelectedSpotsContainer selectedSpots={selectedSpots} onDeleteSpot={handleDeleteSpot} />
        </div>
    );
}
