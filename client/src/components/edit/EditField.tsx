'use client';

import { useState, useEffect } from 'react';
import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { PlaceDetails } from '@/types/PlaceDetails';
import { DaySchedule } from '@/app/create-schedule/page';
import { TimePicker } from 'rsuite';
import 'rsuite/TimePicker/styles/index.css';

interface EditFieldTimeProps {
    title: string;
    spot: PlaceDetails;
}

export default function EditFieldTime({ title, spot }: EditFieldTimeProps) {
    const [showPicker, setShowPicker] = useState(false);

    const defaultHour = spot.stayTime?.hour || '00';
    const defaultMinute = spot.stayTime?.minute || '00';

    const defaultDate = new Date();
    defaultDate.setHours(Number(defaultHour));
    defaultDate.setMinutes(Number(defaultMinute));
    defaultDate.setSeconds(0);
    defaultDate.setMilliseconds(0);

    const [time, setTime] = useState<Date>(defaultDate);

    const updateStorages = (newHour: string, newMinute: string) => {
        const editSpot = JSON.parse(sessionStorage.getItem('editSpot') || '{}');
        editSpot.stayTime = { hour: newHour, minute: newMinute };
        sessionStorage.setItem('editSpot', JSON.stringify(editSpot));

        const schedules: DaySchedule[] = JSON.parse(sessionStorage.getItem('schedules') || '[]');
        schedules.forEach((schedule) => {
            schedule.spots = schedule.spots.map((s) =>
                s.placeId === spot.placeId ? { ...s, stayTime: { hour: newHour, minute: newMinute } } : s,
            );
        });
        sessionStorage.setItem('schedules', JSON.stringify(schedules));

        const editSchedules = sessionStorage.getItem('editSchedules');
        if (editSchedules) {
            sessionStorage.setItem('editSchedules', JSON.stringify(schedules));
        }
    };

    const handleTimeChange = (val: Date | null) => {
        if (!val) return;
        setTime(val);
        const h = val.getHours().toString().padStart(2, '0');
        const m = val.getMinutes().toString().padStart(2, '0');
        updateStorages(h, m);
    };

    const displayHour = time.getHours().toString().padStart(2, '0');
    const displayMinute = time.getMinutes().toString().padStart(2, '0');

    useEffect(() => {
        const interval = setInterval(() => {
            document.querySelectorAll('.rs-calendar-time-dropdown-column-title').forEach((el) => {
                if (el.textContent?.trim() === 'Hours') {
                    el.textContent = '時';
                } else if (el.textContent?.trim() === 'Minutes') {
                    el.textContent = '分';
                }
            });
        }, 10);

        return () => clearInterval(interval);
    }, [showPicker]);

    return (
        <div className={styles.EditWrap} onClick={() => setShowPicker(true)}>
            <div className={styles.EditFieldWrap}>
                <p className={styles.title}>{title}</p>
                {showPicker ? (
                    <div className={styles.timePickerContainer} onClick={(e) => e.stopPropagation()}>
                        <TimePicker
                            format="HH:mm"
                            value={time}
                            onChange={handleTimeChange}
                            style={{
                                fontSize: '1.2rem',
                                padding: '6px 10px',
                            }}
                        />
                        <button
                            className={styles.confirmBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPicker(false);
                            }}
                        >
                            確定
                        </button>
                    </div>
                ) : (
                    <div className={styles.EditField}>{`${displayHour}時間${displayMinute}分`}</div>
                )}
            </div>
            <button
                className={styles.EditBtn}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowPicker(true);
                }}
            >
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}
