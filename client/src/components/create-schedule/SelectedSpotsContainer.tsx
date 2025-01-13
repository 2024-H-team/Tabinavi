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
import { DaySchedule } from '@/app/create-schedule/page';
interface SelectedSpotsContainerProps {
    schedules: DaySchedule[];
    activeDateIndex: number;
    onDateChange: (index: number) => void;
    onDeleteSpot: (index: number) => void;
    onReorderSpots: (oldIndex: number, newIndex: number) => void; // Add this
    isOpen: boolean;
    onClose: () => void;
}

export default function SelectedSpotsContainer({
    schedules,
    activeDateIndex,
    onDateChange,
    onDeleteSpot,
    onReorderSpots,
    isOpen,
    onClose,
}: SelectedSpotsContainerProps) {
    const [spots, setSpots] = useState<PlaceDetails[]>([]);

    useEffect(() => {
        setSpots(schedules[activeDateIndex]?.spots || []);
    }, [schedules, activeDateIndex]);

    const handlePrevDate = () => {
        if (activeDateIndex > 0) {
            onDateChange(activeDateIndex - 1);
        }
    };

    const handleNextDate = () => {
        if (activeDateIndex < schedules.length - 1) {
            onDateChange(activeDateIndex + 1);
        }
    };

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

            onReorderSpots(oldIndex, newIndex);
            setSpots((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        >
            <SortableContext items={spots.map((spot) => spot.name)}>
                <div className={`${styles.containerWrapper} ${isOpen ? styles.open : ''}`} onClick={onClose}>
                    <div
                        className={`${styles.Container} ${isOpen ? styles.open : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            {schedules[activeDateIndex]?.date || 'No date'}
                            <span className={styles.closeBtn} onClick={onClose}>
                                ✕
                            </span>
                        </div>
                        <div className={styles.datePageSelect}>
                            <span onClick={handlePrevDate}>≪</span>
                            <p className={styles.date}>
                                {new Date(schedules[activeDateIndex]?.date).toLocaleDateString('ja-JP')}
                            </p>
                            <span onClick={handleNextDate}>≫</span>
                        </div>
                        <div className={styles.content}>
                            {spots.map((spot, index) => (
                                <SortableSpotWrapper
                                    key={spot.name}
                                    spot={spot}
                                    onDelete={() => onDeleteSpot(index)}
                                    onStayTimeUpdate={handleStayTimeUpdate}
                                    className={styles.selectedSpot}
                                >
                                    {({ dragHandleProps, isDragging }) => (
                                        <SelectedSpot
                                            spot={spot}
                                            onDelete={() => onDeleteSpot(index)}
                                            onStayTimeUpdate={handleStayTimeUpdate}
                                            dragHandleProps={dragHandleProps}
                                            isDragging={isDragging}
                                        />
                                    )}
                                </SortableSpotWrapper>
                            ))}
                        </div>
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}
