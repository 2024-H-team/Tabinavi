'use client';
import React, { useEffect, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import styles from '@styles/componentStyles/create-schedule/SelectedSpotsContainer.module.scss';
import SelectedSpot from './SelectedSpot';
import SortableSpotWrapper from '@/components/SortableSpotWrapper';
import { handleDragStart, handleDragEnd as handleDragEndUtil } from '@/utils/dragHandlers';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useRouter } from 'next/navigation';

interface SelectedSpotsContainerProps {
    selectedSpots: PlaceDetails[];
    onDeleteSpot: (index: number) => void;
}
declare global {
    interface Window {
        preventScrollHandler?: (e: Event) => void;
    }
}
export default function SelectedSpotsContainer({ selectedSpots, onDeleteSpot }: SelectedSpotsContainerProps) {
    const [spots, setSpots] = useState(selectedSpots);
    const router = useRouter();

    useEffect(() => {
        setSpots(selectedSpots);
    }, [selectedSpots]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleStayTimeUpdate = (spotName: string, stayTime: { hour: string; minute: string }) => {
        setSpots((prevSpots) => prevSpots.map((spot) => (spot.name === spotName ? { ...spot, stayTime } : spot)));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        handleDragEndUtil();

        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = spots.findIndex((spot) => spot.name === active.id);
            const newIndex = spots.findIndex((spot) => spot.name === over?.id);
            setSpots((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleCreateSchedule = () => {
        sessionStorage.setItem('ScheduleSpot', JSON.stringify(spots));
        router.push('/create-schedule/schedule-preview');
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        >
            <SortableContext items={spots.map((spot) => spot.name)}>
                <div className={styles.Container}>
                    {spots.map((spot) => (
                        <SortableSpotWrapper
                            key={spot.name}
                            spot={spot}
                            onDelete={() => onDeleteSpot(spots.indexOf(spot))}
                            onStayTimeUpdate={handleStayTimeUpdate}
                            className={styles.selectedSpot}
                        >
                            {({ dragHandleProps, isDragging }) => (
                                <SelectedSpot
                                    spot={spot}
                                    onDelete={() => onDeleteSpot(spots.indexOf(spot))}
                                    onStayTimeUpdate={handleStayTimeUpdate}
                                    dragHandleProps={dragHandleProps}
                                    isDragging={isDragging}
                                />
                            )}
                        </SortableSpotWrapper>
                    ))}
                    <button onClick={handleCreateSchedule}>スケジュール作成</button>
                </div>
            </SortableContext>
        </DndContext>
    );
}
