'use client';
import { useMemo, useState, useEffect } from 'react';
import styles from '@styles/componentStyles/create-schedule/SelectedSpot.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';
import { TimePicker } from 'rsuite';
import 'rsuite/TimePicker/styles/index.css';

interface SelectedSpotProps {
    onDelete: () => void;
    spot: PlaceDetails;
    onStayTimeUpdate: (spotName: string, stayTime: { hour: string; minute: string }) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
    isDragging?: boolean;
}

export default function SelectedSpot({
    spot,
    onDelete,
    onStayTimeUpdate,
    dragHandleProps,
    isDragging,
}: SelectedSpotProps) {
    const defaultHour = spot.stayTime?.hour || '00';
    const defaultMinute = spot.stayTime?.minute || '00';

    // Tạo 1 đối tượng Date dựa trên hour:minute
    const defaultDate = useMemo(() => {
        const d = new Date();
        d.setHours(Number(defaultHour));
        d.setMinutes(Number(defaultMinute));
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    }, [defaultHour, defaultMinute]);

    const [time, setTime] = useState<Date>(defaultDate);

    const handleTimeChangeRSuite = (val: Date | null) => {
        if (!val) return;
        setTime(val);
        const h = val.getHours().toString().padStart(2, '0');
        const m = val.getMinutes().toString().padStart(2, '0');
        onStayTimeUpdate(spot.name, { hour: h, minute: m });
    };

    const truncateText = (text: string, maxLength: number = 15) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

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
    }, []);

    return (
        <div
            className={styles.spot}
            style={{
                border: isDragging ? '2px solid green' : '',
            }}
        >
            <div className={styles.spotInfo}>
                <div className={styles.dragHolder} {...dragHandleProps}>
                    =
                </div>
                <div>
                    <p title={spot.name} className={styles.name}>
                        {truncateText(spot.name)}
                    </p>
                </div>
                <div className={styles.closeBtn} onClick={onDelete}>
                    ✕
                </div>
            </div>

            <div className={styles.timePickerGroup}>
                滞在時間：
                <TimePicker
                    format="HH:mm"
                    value={time}
                    onChange={handleTimeChangeRSuite}
                    placement="autoVerticalStart"
                />
            </div>
        </div>
    );
}
