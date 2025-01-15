'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { DaySchedule, TransportInfo } from '@/app/create-schedule/page';
import styles from '@styles/appStyles/schedule/SchedulePreview.module.scss';
import { IoBagAdd } from 'react-icons/io5';
import { IoIosArrowBack } from 'react-icons/io';
import { HiOutlinePencil } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import PackingItemList from '@/components/create-schedule/PackingItemList';
import apiClient from '@/lib/axios';

export default function PreviewSpotsContainer() {
    const router = useRouter();
    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [activeDateIndex, setActiveDateIndex] = useState(0);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [showPackingList, setShowPackingList] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const editSchedules = sessionStorage.getItem('editSchedules');
        const regularSchedules = sessionStorage.getItem('schedules');

        if (editSchedules) {
            setSchedules(JSON.parse(editSchedules));
        } else if (regularSchedules) {
            setSchedules(JSON.parse(regularSchedules));
        } else {
            router.push('/home');
        }
    }, [router]);

    useEffect(() => {
        if (schedules[0]?.title) {
            setTitleValue(schedules[0].title);
        }
    }, [schedules]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleStayTimeUpdate = useCallback(
        (spotName: string, stayTime: { hour: string; minute: string }) => {
            setSchedules((prev) => {
                const newSchedules = [...prev];
                const currentDay = { ...newSchedules[activeDateIndex] };
                currentDay.spots = currentDay.spots.map((spot) =>
                    spot.name === spotName ? { ...spot, stayTime } : spot,
                );
                newSchedules[activeDateIndex] = currentDay;
                return newSchedules;
            });
        },
        [activeDateIndex],
    );

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
                sessionStorage.setItem('schedules', JSON.stringify(newSchedules));
                return newSchedules;
            });
        }
    };

    const handleDelete = useCallback(
        (spotName: string) => {
            if (confirm(`${spotName}を削除してもよろしいですか？`)) {
                setSchedules((prev) => {
                    const newSchedules = [...prev];
                    const currentDay = { ...newSchedules[activeDateIndex] };
                    currentDay.spots = currentDay.spots.filter((spot) => spot.name !== spotName);
                    newSchedules[activeDateIndex] = currentDay;
                    return newSchedules;
                });
            }
        },
        [activeDateIndex],
    );

    const handleTransportCalculated = useCallback(
        (transportInfo: TransportInfo, transportIndex: number) => {
            setSchedules((prev) => {
                const newSchedules = [...prev];
                const currentDay = { ...newSchedules[activeDateIndex] };

                if (!currentDay.transports) {
                    currentDay.transports = [];
                }

                const existingTransport = currentDay.transports[transportIndex];
                const isSameAsBefore =
                    existingTransport &&
                    existingTransport.mode === transportInfo.mode &&
                    existingTransport.duration === transportInfo.duration &&
                    JSON.stringify(existingTransport.routeDetail) === JSON.stringify(transportInfo.routeDetail);

                if (isSameAsBefore) {
                    return prev;
                }

                currentDay.transports[transportIndex] = transportInfo;
                newSchedules[activeDateIndex] = currentDay;
                // Save immediately after updating
                sessionStorage.setItem('schedules', JSON.stringify(newSchedules));
                return newSchedules;
            });
        },
        [activeDateIndex],
    );

    const handleTitleClick = () => {
        setIsEditingTitle(true);
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 0);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        setSchedules((prev) => {
            const newSchedules = prev.map((schedule) => ({
                ...schedule,
                title: titleValue,
            }));
            sessionStorage.setItem('schedules', JSON.stringify(newSchedules));
            return newSchedules;
        });
    };

    const truncateTitle = (title: string, maxLength: number = 15) => {
        return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    };

    const handleBack = () => {
        const profileEdit = sessionStorage.getItem('profileScheduleEdit');
        const editSchedules = sessionStorage.getItem('editSchedules');

        if (profileEdit) {
            sessionStorage.removeItem('profileScheduleEdit');
            sessionStorage.removeItem('editSchedules');
            sessionStorage.removeItem('schedules');
            router.push('/profile');
        } else if (editSchedules) {
            sessionStorage.removeItem('editSchedules');
            sessionStorage.removeItem('schedules');
            router.push('/home');
        } else {
            router.push('/create-schedule/select-spot');
        }
    };

    const getAllPackingItems = useCallback(() => {
        const allItems = schedules.flatMap((schedule) => schedule.spots.flatMap((spot) => spot.packingList || []));
        return [...new Set(allItems)];
    }, [schedules]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const scheduleId = schedules[0]?.SchedulesID;

            const formattedScheduleData = {
                title: titleValue,
                start_date: new Date(schedules[0].date).toISOString().split('T')[0],
                end_date: new Date(schedules[schedules.length - 1].date).toISOString().split('T')[0],
                schedules: JSON.stringify(schedules),
            };

            let response;
            if (scheduleId) {
                response = await apiClient.put(`/schedules/${scheduleId}`, formattedScheduleData);
                if (response.data.success) {
                    alert('スケジュールが更新されました！自動でホーム画面に移動します。');
                }
            } else {
                response = await apiClient.post('/schedules/create', formattedScheduleData);
                if (response.data.success) {
                    alert('スケジュールが保存されました！自動でホーム画面に移動します。');
                }
            }

            if (response.data.success) {
                sessionStorage.removeItem('schedules');
                sessionStorage.removeItem('editSchedules');
                router.push('/home');
            }
        } catch (error) {
            console.error('Save schedule error:', error);
            alert('スケジュールの保存に失敗しました。');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateNav}>
                <div className={styles.header}>
                    <IoIosArrowBack color="white" size={30} className={styles.back} onClick={handleBack} />
                    <HiOutlinePencil color="white" className={styles.edit} onClick={handleTitleClick} />
                    {isEditingTitle ? (
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleBlur}
                            className={styles.titleInput}
                            autoFocus
                        />
                    ) : (
                        <div className={styles.title} onClick={handleTitleClick}>
                            {truncateTitle(titleValue) || 'スケジュール'}
                        </div>
                    )}
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
                                        spot={spot}
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
                                    onTransportCalculated={(transportInfo) =>
                                        handleTransportCalculated(transportInfo, index)
                                    }
                                    transportInfo={schedules[activeDateIndex].transports?.[index]}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </SortableContext>
            </DndContext>
            {showPackingList && (
                <PackingItemList items={getAllPackingItems()} onClose={() => setShowPackingList(false)} />
            )}

            <div className={styles.btnBox}>
                <button onClick={handleSave} className={styles.saveButton} disabled={isSaving}>
                    {isSaving ? '保存中...' : 'スケジュールを確定する'}
                </button>
                <button
                    className={`${styles.addButton} ${getAllPackingItems().length > 0 ? styles.active : ''}`}
                    onClick={() => setShowPackingList(true)}
                >
                    <IoBagAdd color={getAllPackingItems().length > 0 ? 'blue' : 'gray'} size={30} />
                </button>
            </div>
        </div>
    );
}
