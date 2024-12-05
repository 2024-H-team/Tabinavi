// page.tsx
'use client';
import React, { useState, useEffect } from 'react';
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
import styles from '@styles/componentStyles/create-schedule/SchedulePreview.module.scss';
import SchedulePreviewSpotItem from '@/components/create-schedule/SchedulePreviewSpotItem';
import SortableSpotWrapper from '@/components/SortableSpotWrapper';
import { handleDragStart, handleDragEnd as handleDragEndUtil } from '@/utils/dragHandlers';
import { PlaceDetails } from '@/types/PlaceDetails';

interface ScheduleTime {
    startTime: string;
    endTime: string;
    selectedDate: string;
}

export default function PreviewSpotsContainer() {
    const [spots, setSpots] = useState<PlaceDetails[]>([]);
    const [scheduleTime, setScheduleTime] = useState<ScheduleTime>({
        startTime: '',
        endTime: '',
        selectedDate: '',
    });

    useEffect(() => {
        const startTime = sessionStorage.getItem('startTime') || '';
        const endTime = sessionStorage.getItem('endTime') || '';
        const selectedDate = sessionStorage.getItem('selectedDate') || '';

        setScheduleTime({
            startTime,
            endTime,
            selectedDate,
        });

        const scheduleSpots = sessionStorage.getItem('ScheduleSpot');
        if (scheduleSpots) {
            setSpots(JSON.parse(scheduleSpots));
        }
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
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
            setSpots((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };
    const handleDelete = (spotName: string) => {
        setSpots(spots.filter((spot) => spot.name !== spotName));
    };

    const handleSave = () => {
        sessionStorage.setItem('ScheduleSpot', JSON.stringify(spots));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        >
            <SortableContext items={spots.map((spot) => spot.name)}>
                <div className={styles.schedulePreview}>
                    <div className={styles.scheduleTime}>
                        <h2>スケジュール</h2>
                        <p>予定日：{scheduleTime.selectedDate ? formatDate(scheduleTime.selectedDate) : ''}</p>
                        <p>
                            予定時間：{scheduleTime.startTime} - {scheduleTime.endTime}
                        </p>
                    </div>
                    {spots.map((spot) => (
                        <SortableSpotWrapper
                            key={spot.name}
                            spot={spot}
                            onDelete={() => handleDelete(spot.name)}
                            onStayTimeUpdate={handleStayTimeUpdate}
                            className={styles.schedulePreviewSpot}
                        >
                            {({ dragHandleProps, isDragging }) => (
                                <SchedulePreviewSpotItem
                                    name={spot.name}
                                    stayTime={spot.stayTime}
                                    onStayTimeUpdate={handleStayTimeUpdate}
                                    dragHandleProps={dragHandleProps}
                                    onDelete={() => handleDelete(spot.name)}
                                    isDragging={isDragging}
                                />
                            )}
                        </SortableSpotWrapper>
                    ))}
                    <button className={styles.createScheduleButton} onClick={handleSave}>
                        保存
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    );
}
