'use client';
import { useMemo } from 'react';
import styles from '@styles/componentStyles/create-schedule/SelectedSpot.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from 'dayjs';

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

    const timeValue = useMemo(
        () => dayjs(`1970-01-01 ${defaultHour}:${defaultMinute}`, 'YYYY-MM-DD HH:mm'),
        [defaultHour, defaultMinute],
    );

    const handleTimeChange = (newHour: string, newMinute: string) => {
        onStayTimeUpdate(spot.name, { hour: newHour, minute: newMinute });
    };

    const truncateText = (text: string, maxLength: number = 15) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
                    <h3 title={spot.name}>{truncateText(spot.name)}</h3>
                </div>
                <div className={styles.closeBtn} onClick={onDelete}>
                    ✕
                </div>
            </div>
            <div className={styles.timePickerGroup}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                    <MobileTimePicker
                        label="滞在時間"
                        ampm={false}
                        value={timeValue}
                        onChange={(newVal) => {
                            if (!newVal) return;
                            const h = newVal.format('HH');
                            const m = newVal.format('mm');
                            handleTimeChange(h, m);
                        }}
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
}
