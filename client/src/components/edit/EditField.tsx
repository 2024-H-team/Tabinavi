'use client';
import { useState } from 'react';
import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { PlaceDetails } from '@/types/PlaceDetails';
import { DaySchedule } from '@/app/create-schedule/page';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';

interface EditFieldTimeProps {
    title: string;
    spot: PlaceDetails;
}

export default function EditFieldTime({ title, spot }: EditFieldTimeProps) {
    const [showPicker, setShowPicker] = useState(false);

    const defaultHour = spot.stayTime?.hour || '00';
    const defaultMinute = spot.stayTime?.minute || '00';

    const [time, setTime] = useState<Dayjs>(dayjs(`1970-01-01 ${defaultHour}:${defaultMinute}`, 'YYYY-MM-DD HH:mm'));

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

    const handleTimeChange = (newVal: Dayjs | null) => {
        if (!newVal) return;
        setTime(newVal);
        const h = newVal.format('HH');
        const m = newVal.format('mm');
        updateStorages(h, m);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
            <div className={styles.EditWrap} onClick={() => setShowPicker(true)}>
                <div className={styles.EditFieldWrap}>
                    <h2>{title}</h2>
                    {showPicker ? (
                        <div className={styles.timePickerContainer} onClick={(e) => e.stopPropagation()}>
                            <MobileTimePicker
                                ampm={false}
                                value={time}
                                onChange={handleTimeChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        fontSize: '1.2rem',
                                        padding: '6px 10px',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#436EEE',
                                    },
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPicker(false);
                                }}
                            >
                                確定
                            </button>
                        </div>
                    ) : (
                        <div className={styles.EditField}>{`${time.format('HH')}時間${time.format('mm')}分`}</div>
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
        </LocalizationProvider>
    );
}
