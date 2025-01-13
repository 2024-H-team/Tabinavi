'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { searchNearbyPlaces } from '@/utils/mapCalculations';
import Styles from '@styles/appStyles/schedule/CreateSchedule.module.scss';
import SpotInfo from '@/components/create-schedule/SpotInfo';
import { PlaceDetails } from '@/types/PlaceDetails';
import SelectedSpotsContainer from '@/components/create-schedule/SelectedSpotsContainer';
import RecommendSpotsContainer from '@/components/create-schedule/RecommendSpotsContainer';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdMenuOpen } from 'react-icons/md';
import { DaySchedule } from '@/app/create-schedule/page';

const CreateScheduleMap = dynamic(() => import('@/components/create-schedule/CreateScheduleMap'), { ssr: false });

export default function CreateSchedule() {
    const router = useRouter();
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [recommendedSpots, setRecommendedSpots] = useState<PlaceDetails[]>([]);
    const [visibleRecommendedSpots, setVisibleRecommendedSpots] = useState<PlaceDetails[]>([]);
    const [focusedSpot, setFocusedSpot] = useState<PlaceDetails | null>(null);
    const [isContainerOpen, setIsContainerOpen] = useState(false);

    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [activeDateIndex, setActiveDateIndex] = useState<number>(0);

    useEffect(() => {
        const saved = sessionStorage.getItem('schedules');
        if (saved) {
            setSchedules(JSON.parse(saved));
        }
    }, []);

    const handleAddSpot = useCallback(
        (spot: PlaceDetails) => {
            setSchedules((prev) => {
                const newSchedules = [...prev];
                const currentDay = { ...newSchedules[activeDateIndex] };
                currentDay.spots = [...currentDay.spots, spot];
                newSchedules[activeDateIndex] = currentDay;
                return newSchedules;
            });
        },
        [activeDateIndex],
    );

    const handleDeleteSpot = useCallback(
        (index: number) => {
            setSchedules((prev) => {
                const newSchedules = [...prev];
                const currentDay = { ...newSchedules[activeDateIndex] };
                currentDay.spots = currentDay.spots.filter((_, i) => i !== index);
                newSchedules[activeDateIndex] = currentDay;
                return newSchedules;
            });
        },
        [activeDateIndex],
    );

    const handleLoadMore = (visibleSpots: PlaceDetails[]) => {
        setVisibleRecommendedSpots(visibleSpots);
    };

    const handleFocusSpot = useCallback((spot: PlaceDetails) => {
        setFocusedSpot(spot);
        setSelectedPlaces([spot]);
    }, []);

    const handleRecommendClick = async () => {
        if (schedules[activeDateIndex]?.spots.length === 0) {
            alert('少なくとも1つの場所を選択してください');
            return;
        }

        try {
            const processedSpots = schedules[activeDateIndex].spots.reduce(
                (acc: { type: string; count: number }[], spot) => {
                    const type = spot.primaryType;
                    if (!type) return acc;
                    const existing = acc.find((item) => item.type === type);
                    if (existing) {
                        existing.count++;
                    } else {
                        acc.push({ type, count: 1 });
                    }
                    return acc;
                },
                [],
            );

            const response = await apiClient.post('/recommended-place-types', {
                selectedPlaces: processedSpots,
            });

            if (response.data.success) {
                const nearbyPlaces = await searchNearbyPlaces(schedules[activeDateIndex].spots, response.data.data);
                setRecommendedSpots(nearbyPlaces || []);
                setVisibleRecommendedSpots(nearbyPlaces?.slice(0, 5) || []);
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
        }
    };

    const handleCreateSchedule = () => {
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
        router.push('/create-schedule/schedule-preview');
    };

    const handleCloseSpotInfo = useCallback(() => {
        setSelectedPlaces([]);
    }, []);

    const toggleContainer = () => {
        setIsContainerOpen(!isContainerOpen);
    };

    return (
        <div className={Styles.page}>
            <div className={Styles.mapContainer}>
                <CreateScheduleMap
                    onPlaceSelect={setSelectedPlaces}
                    recommendedSpots={visibleRecommendedSpots}
                    focusedSpot={focusedSpot}
                    selectedSpots={schedules[activeDateIndex]?.spots || []}
                />
            </div>
            {selectedPlaces.length > 0 && (
                <SpotInfo places={selectedPlaces} onAddSpot={handleAddSpot} onClose={handleCloseSpotInfo} />
            )}
            <RecommendSpotsContainer
                recommendedSpots={recommendedSpots}
                onLoadMore={handleLoadMore}
                onFocusSpot={handleFocusSpot}
            />
            <div className={Styles.menuBtn} onClick={toggleContainer}>
                <MdMenuOpen color="white" size={30} />
            </div>
            <SelectedSpotsContainer
                schedules={schedules}
                activeDateIndex={activeDateIndex}
                onDateChange={setActiveDateIndex}
                onDeleteSpot={handleDeleteSpot}
                isOpen={isContainerOpen}
                onClose={() => setIsContainerOpen(false)}
            />
            <button onClick={handleRecommendClick} className={Styles.recommendButton}>
                Recommend
            </button>
            <div className={Styles.btnBox}>
                <Link className={Styles.backBtn} href={'/create-schedule'}>
                    戻る
                </Link>
                <button onClick={handleCreateSchedule} className={Styles.submitBtn}>
                    スケジュール作成
                </button>
            </div>
        </div>
    );
}
