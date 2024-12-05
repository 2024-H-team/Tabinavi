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
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from '@styles/componentStyles/create-schedule/SelectedSpotsContainer.module.scss';
import SelectedSpot from './SelectedSpot';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useRouter } from 'next/navigation';

interface SelectedSpotsContainerProps {
    selectedSpots: PlaceDetails[];
    onDeleteSpot: (index: number) => void;
}

export default function SelectedSpotsContainer({ selectedSpots, onDeleteSpot }: SelectedSpotsContainerProps) {
    const [spots, setSpots] = useState(selectedSpots);
    const router = useRouter();

    useEffect(() => {
        setSpots(selectedSpots);
    }, [selectedSpots]);

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

    const handleCreateSchedule = () => {
        sessionStorage.setItem('ScheduleSpot', JSON.stringify(spots));
        router.push('/create-schedule/schedule-preview');
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={spots.map((spot) => spot.name)}>
                <div className={styles.Container}>
                    {spots.map((spot) => (
                        <SortableSpot
                            key={spot.name}
                            spot={spot}
                            onDelete={() => onDeleteSpot(spots.indexOf(spot))}
                            onStayTimeUpdate={handleStayTimeUpdate}
                        />
                    ))}
                    <button onClick={handleCreateSchedule}>スケジュール作成</button>
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableSpot({
    spot,
    onDelete,
    onStayTimeUpdate,
}: {
    spot: PlaceDetails;
    onDelete: () => void;
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.selectedSpot}>
            <SelectedSpot spot={spot} onDelete={onDelete} onStayTimeUpdate={onStayTimeUpdate} />
        </div>
    );
}
