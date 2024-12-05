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
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '@styles/componentStyles/create-schedule/SchedulePreview.module.scss';
import SchedulePreviewSpotItem from '@/components/create-schedule/SchedulePreviewSpotItem';
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
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleStayTimeUpdate = (spotName: string, stayTime: { hour: string; minute: string }) => {
        setSpots((prevSpots) => prevSpots.map((spot) => (spot.name === spotName ? { ...spot, stayTime } : spot)));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = spots.findIndex((spot) => spot.name === active.id);
            const newIndex = spots.findIndex((spot) => spot.name === over?.id);
            setSpots((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleSave = () => {
        sessionStorage.setItem('ScheduleSpot', JSON.stringify(spots));
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                        <SortablePreviewSpot key={spot.name} spot={spot} onStayTimeUpdate={handleStayTimeUpdate} />
                    ))}
                    <button className={styles.createScheduleButton} onClick={handleSave}>
                        保存
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortablePreviewSpot({
    spot,
    onStayTimeUpdate,
}: {
    spot: PlaceDetails;
    onStayTimeUpdate: (spotName: string, stayTime: { hour: string; minute: string }) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: spot.name,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <SchedulePreviewSpotItem name={spot.name} stayTime={spot.stayTime} onStayTimeUpdate={onStayTimeUpdate} />
        </div>
    );
}
