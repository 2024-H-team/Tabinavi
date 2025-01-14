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
import { IoBagAdd } from 'react-icons/io5';

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
        const isConfirmed = confirm(`${spotName}を削除してもよろしいですか？`);

        if (isConfirmed) {
            setSchedules((prev) => {
                const newSchedules = [...prev];
                const currentDay = { ...newSchedules[activeDateIndex] };
                currentDay.spots = currentDay.spots.filter((spot) => spot.name !== spotName);
                newSchedules[activeDateIndex] = currentDay;
                return newSchedules;
            });
        }
    };

    const handleSave = () => {
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateNav}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{schedules[0]?.title || 'スケジュール'}</h2>
                    <div className={styles.dateInfo}>
                        {schedules.length > 0 &&
                            `${new Date(schedules[0].date).toLocaleDateString('ja-JP')} - 
                         ${new Date(schedules[schedules.length - 1].date).toLocaleDateString('ja-JP')}`}
                    </div>
                </div>
                <div className={styles.dateSelect}>
                    {schedules.map((schedule, index) => (
                        <div
                            key={index}
                            className={index === activeDateIndex ? styles.active : ''}
                            onClick={() => setActiveDateIndex(index)}
                        >
                            {new Date(schedule.date).toLocaleDateString('ja-JP', {
                                month: 'numeric',
                                day: 'numeric',
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.timeInfo}>
                <p>
                    予定時間：{schedules[activeDateIndex]?.startTime} - {schedules[activeDateIndex]?.endTime}
                </p>
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
                                className={styles.selectedSpot}
                            >
                                {({ dragHandleProps, isDragging }) => (
                                    <SchedulePreviewSpotItem
                                        name={spot.name}
                                        stayTime={spot.stayTime}
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
            <div className={styles.btnBox}>
                <button onClick={handleSave} className={styles.saveButton}>
                    スケジュールを確定する
                </button>
                <button className={styles.addButton}>
                    <IoBagAdd color="gray" size={30} />
                </button>
            </div>
        </div>
    );
}
