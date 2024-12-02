'use client';
import { useState } from 'react';
import WheelPicker from '@/components/WheelPicker';
import styles from '@styles/appStyles/schedule/InfoSetup.module.scss';
import { useRouter } from 'next/navigation';
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

export default function InfoSetup() {
    const [startHour, setStartHour] = useState(hours[0]);
    const [startMinute, setStartMinute] = useState(minutes[0]);
    const [endHour, setEndHour] = useState(hours[0]);
    const [endMinute, setEndMinute] = useState(minutes[0]);

    const router = useRouter();

    const handleSubmit = () => {
        sessionStorage.setItem('startTime', `${startHour}:${startMinute}`);
        sessionStorage.setItem('endTime', `${endHour}:${endMinute}`);
        router.push('/create-schedule/select-spot');
    };

    return (
        <div className={styles.infoSetup}>
            <h2>設定情報</h2>

            <div className={styles.timePickerGroup}>
                <h3>開始時間</h3>
                <div className={styles.pickers}>
                    <WheelPicker data={hours} defaultSelection={0} onChange={(value) => setStartHour(value)} />
                    <WheelPicker data={minutes} defaultSelection={0} onChange={(value) => setStartMinute(value)} />
                </div>
            </div>

            <div className={styles.timePickerGroup}>
                <h3>終了時間</h3>
                <div className={styles.pickers}>
                    <WheelPicker data={hours} defaultSelection={0} onChange={(value) => setEndHour(value)} />
                    <WheelPicker data={minutes} defaultSelection={0} onChange={(value) => setEndMinute(value)} />
                </div>
            </div>

            <button onClick={handleSubmit} className={styles.submitButton}>
                確認
            </button>
        </div>
    );
}
