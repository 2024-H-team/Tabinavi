'use client';
import styles from '@styles/componentStyles/create-schedule/PreviewSpotItem.module.scss';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface SchedulePreviewSpotItemProps {
    name: string;
    stayTime?: { hour: string; minute: string };
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
    onDelete: () => void;
    isDragging?: boolean;
}

export default function SchedulePreviewSpotItem({
    name,
    stayTime,
    dragHandleProps,
    onDelete,
    isDragging,
}: SchedulePreviewSpotItemProps) {
    const hour = stayTime?.hour || hours[0];
    const minute = stayTime?.minute || minutes[0];

    return (
        <div
            className={styles.PreviewSpotItem}
            style={{
                border: isDragging ? '2px solid green' : '1px solid #ccc',
            }}
        >
            <div className={styles.stayTime}>
                <p>滞在時間:{`${hour}時間${minute}分`}</p>
            </div>
            <h2>{name}</h2>
            <div className={styles.dragHolder} {...dragHandleProps}>
                =
            </div>
            <div className={styles.closeBtn} onClick={onDelete}>
                ✕
            </div>
        </div>
    );
}
