// SchedulePreviewSpotItem.tsx
'use client';
import { useState } from 'react';
import styles from '@styles/componentStyles/create-schedule/SchedulePreview.module.scss';
import WheelPicker from '@/components/WheelPicker';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface SchedulePreviewSpotItemProps {
    name: string;
    stayTime?: { hour: string; minute: string };
    onStayTimeUpdate: (name: string, stayTime: { hour: string; minute: string }) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
    onDelete: () => void;
    isDragging?: boolean;
}

export default function SchedulePreviewSpotItem({
    name,
    stayTime,
    onStayTimeUpdate,
    dragHandleProps,
    onDelete,
    isDragging,
}: SchedulePreviewSpotItemProps) {
    const [showPicker, setShowPicker] = useState(false);
    const hour = stayTime?.hour || hours[0];
    const minute = stayTime?.minute || minutes[0];

    const handleChange = (type: 'hour' | 'minute', value: string) => {
        if (type === 'hour') {
            onStayTimeUpdate(name, { hour: value, minute });
        } else {
            onStayTimeUpdate(name, { hour, minute: value });
        }
    };

    return (
        <div
            className={styles.PreviewSpotItem}
            style={{
                border: isDragging ? '2px solid green' : '1px solid #ccc',
            }}
        >
            <h2>{name}</h2>
            <div className={styles.dragHolder} {...dragHandleProps}>
                =
            </div>
            <div className={styles.closeBtn} onClick={onDelete}>
                X
            </div>
            <div className={styles.stayTime}>
                <p>滞在時間:</p>
                {!showPicker ? (
                    <p onClick={() => setShowPicker(true)} style={{ cursor: 'pointer' }}>
                        {`${hour}時間${minute}分`}
                    </p>
                ) : (
                    <div className={styles.timePicker}>
                        <WheelPicker
                            data={hours}
                            defaultSelection={hours.indexOf(hour)}
                            onChange={(value) => handleChange('hour', value)}
                        />
                        <WheelPicker
                            data={minutes}
                            defaultSelection={minutes.indexOf(minute)}
                            onChange={(value) => handleChange('minute', value)}
                        />
                        <button onClick={() => setShowPicker(false)}>完了</button>
                    </div>
                )}
            </div>
        </div>
    );
}
