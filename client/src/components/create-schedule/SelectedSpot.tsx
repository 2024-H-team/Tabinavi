// SelectedSpot.tsx
'use client';
import styles from '@styles/componentStyles/create-schedule/SelectedSpot.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';
import WheelPicker from '@/components/WheelPicker';
import { useState } from 'react';

// Time arrays
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

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
    const [hour, setHour] = useState(hours[1]);
    const [minute, setMinute] = useState(minutes[0]);

    const handleTimeChange = (newHour: string, newMinute: string) => {
        setHour(newHour);
        setMinute(newMinute);
        onStayTimeUpdate(spot.name, { hour: newHour, minute: newMinute });
    };

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
                    <h3>{spot.name}</h3>
                </div>
                <div className={styles.closeBtn} onClick={onDelete}>
                    X
                </div>
            </div>
            <div className={styles.timePickerGroup}>
                <p>滞在時間</p>
                <div className={styles.pickers}>
                    <WheelPicker
                        data={hours}
                        defaultSelection={1}
                        onChange={(value) => {
                            setHour(value);
                            handleTimeChange(value, minute);
                        }}
                    />
                    <WheelPicker
                        data={minutes}
                        defaultSelection={0}
                        onChange={(value) => {
                            setMinute(value);
                            handleTimeChange(hour, value);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
