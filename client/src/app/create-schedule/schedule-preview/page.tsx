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
import { handleDragStart, handleDragEnd as handleDragEndUtil } from '@/utils/dragHandlers';
import SchedulePreviewSpotItem from '@/components/create-schedule/SchedulePreviewSpotItem';
import SortableSpotWrapper from '@/components/SortableSpotWrapper';
import { TravelTimeCalculator } from '@/components/create-schedule/TravelTimeCalculator';
import { DaySchedule } from '@/app/create-schedule/page';
import styles from '@styles/componentStyles/create-schedule/SchedulePreview.module.scss';

export default function PreviewSpotsContainer() {
    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [activeDateIndex, setActiveDateIndex] = useState(0);

    useEffect(() => {
        const saved = sessionStorage.getItem('schedules');
        if (saved) {
            setSchedules(JSON.parse(saved));
        }
    }, []);

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
        setSchedules((prev) => {
            const newSchedules = [...prev];
            const currentDay = { ...newSchedules[activeDateIndex] };
            currentDay.spots = currentDay.spots.map((spot) => (spot.name === spotName ? { ...spot, stayTime } : spot));
            newSchedules[activeDateIndex] = currentDay;
            return newSchedules;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        handleDragEndUtil();
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = schedules[activeDateIndex].spots.findIndex((spot) => spot.name === active.id);
            const newIndex = schedules[activeDateIndex].spots.findIndex((spot) => spot.name === over?.id);

            setSchedules((prev) => {
                const newSchedules = [...prev];
                const currentDay = { ...newSchedules[activeDateIndex] };
                currentDay.spots = arrayMove(currentDay.spots, oldIndex, newIndex);
                newSchedules[activeDateIndex] = currentDay;
                return newSchedules;
            });
        }
    };

    const handleDelete = (spotName: string) => {
        setSchedules((prev) => {
            const newSchedules = [...prev];
            const currentDay = { ...newSchedules[activeDateIndex] };
            currentDay.spots = currentDay.spots.filter((spot) => spot.name !== spotName);
            newSchedules[activeDateIndex] = currentDay;
            return newSchedules;
        });
    };

    const handleSave = () => {
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
    };

    const handlePrevDate = () => {
        if (activeDateIndex > 0) {
            setActiveDateIndex(activeDateIndex - 1);
        }
    };

    const handleNextDate = () => {
        if (activeDateIndex < schedules.length - 1) {
            setActiveDateIndex(activeDateIndex + 1);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateNav}>
                <span onClick={handlePrevDate}>≪</span>
                <p>{new Date(schedules[activeDateIndex]?.date).toLocaleDateString('ja-JP')}</p>
                <span onClick={handleNextDate}>≫</span>
            </div>
            <div className={styles.timeInfo}>
                <p>開始時間: {schedules[activeDateIndex]?.startTime}</p>
                <p>終了時間: {schedules[activeDateIndex]?.endTime}</p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <SortableContext items={schedules[activeDateIndex]?.spots.map((spot) => spot.name) || []}>
                    {schedules[activeDateIndex]?.spots.map((spot, index) => (
                        <React.Fragment key={spot.name}>
                            <SortableSpotWrapper
                                spot={spot}
                                onDelete={() => handleDelete(spot.name)}
                                onStayTimeUpdate={handleStayTimeUpdate}
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
                            {index < schedules[activeDateIndex].spots.length - 1 && (
                                <TravelTimeCalculator
                                    origin={spot.location}
                                    destination={schedules[activeDateIndex].spots[index + 1].location}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </SortableContext>
            </DndContext>
            <button onClick={handleSave} className={styles.saveButton}>
                保存
            </button>
        </div>
    );
}
