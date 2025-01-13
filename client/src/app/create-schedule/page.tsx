'use client';

import { useState, useEffect } from 'react';
import WheelPicker from '@/components/WheelPicker';
import styles from '@styles/appStyles/schedule/InfoSetup.module.scss';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface DaySchedule {
    date: string;
    startTime: string;
    endTime: string;
}

export default function InfoSetup() {
    const [isOneDay, setIsOneDay] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [schedules, setSchedules] = useState<DaySchedule[]>([
        { date: '', startTime: `${hours[0]}:${minutes[0]}`, endTime: `${hours[0]}:${minutes[0]}` },
    ]);

    const router = useRouter();

    // Function to generate dates between start and end date inclusive
    const getDateRange = (start: string, end: string): string[] => {
        const startDt = new Date(start);
        const endDt = new Date(end);
        const dateArray: string[] = [];

        for (let dt = new Date(startDt); dt <= endDt; dt.setDate(dt.getDate() + 1)) {
            const year = dt.getFullYear();
            const month = (dt.getMonth() + 1).toString().padStart(2, '0');
            const day = dt.getDate().toString().padStart(2, '0');
            dateArray.push(`${year}-${month}-${day}`);
        }

        return dateArray;
    };

    // Update schedules when dates change
    useEffect(() => {
        if (isOneDay) {
            setSchedules([
                { date: startDate, startTime: `${hours[0]}:${minutes[0]}`, endTime: `${hours[0]}:${minutes[0]}` },
            ]);
        } else if (startDate && endDate) {
            const dates = getDateRange(startDate, endDate);
            const newSchedules: DaySchedule[] = dates.map((date, index) => {
                if (index === 0) {
                    return { date, startTime: `${hours[0]}:${minutes[0]}`, endTime: `${hours[23]}:${minutes[55]}` };
                } else if (index === dates.length - 1) {
                    return { date, startTime: `${hours[0]}:${minutes[0]}`, endTime: `${hours[0]}:${minutes[0]}` };
                } else {
                    return { date, startTime: `${hours[0]}:${minutes[0]}`, endTime: `${hours[23]}:${minutes[55]}` };
                }
            });
            setSchedules(newSchedules);
        }
    }, [isOneDay, startDate, endDate]);

    // Handle time changes for a specific day
    const handleTimeChange = (index: number, type: 'start' | 'end', value: string) => {
        setSchedules((prev) =>
            prev.map((schedule, i) =>
                i === index
                    ? type === 'start'
                        ? { ...schedule, startTime: value }
                        : { ...schedule, endTime: value }
                    : schedule,
            ),
        );
    };

    const handleSubmit = () => {
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
        router.push('/create-schedule/select-spot');
    };

    return (
        <>
            <div className={styles.infoSetup}>
                <h2>設定情報</h2>

                <div className={styles.toggleGroup}>
                    <label>
                        <input type="checkbox" checked={isOneDay} onChange={(e) => setIsOneDay(e.target.checked)} />
                        日帰り
                    </label>
                </div>

                <div className={styles.datePickerGroup}>
                    <h3>開始日</h3>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                {!isOneDay && (
                    <div className={styles.datePickerGroup}>
                        <h3>終了日</h3>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                )}

                {schedules.map((schedule, index) => (
                    <div key={index} className={styles.daySchedule}>
                        <h3>{schedule.date}</h3>
                        <div className={styles.timePickerGroup}>
                            <div className={styles.pickers}>
                                <WheelPicker
                                    data={hours}
                                    defaultSelection={hours.indexOf(schedule.startTime.split(':')[0])}
                                    onChange={(value) =>
                                        handleTimeChange(index, 'start', `${value}:${schedule.startTime.split(':')[1]}`)
                                    }
                                />
                                <WheelPicker
                                    data={minutes}
                                    defaultSelection={minutes.indexOf(schedule.startTime.split(':')[1])}
                                    onChange={(value) =>
                                        handleTimeChange(index, 'start', `${schedule.startTime.split(':')[0]}:${value}`)
                                    }
                                />
                            </div>
                            <span>~</span>
                            <div className={styles.pickers}>
                                <WheelPicker
                                    data={hours}
                                    defaultSelection={hours.indexOf(schedule.endTime.split(':')[0])}
                                    onChange={(value) =>
                                        handleTimeChange(index, 'end', `${value}:${schedule.endTime.split(':')[1]}`)
                                    }
                                />
                                <WheelPicker
                                    data={minutes}
                                    defaultSelection={minutes.indexOf(schedule.endTime.split(':')[1])}
                                    onChange={(value) =>
                                        handleTimeChange(index, 'end', `${schedule.endTime.split(':')[0]}:${value}`)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={handleSubmit} className={styles.submitButton}>
                    確認
                </button>
            </div>
            <Footer />
        </>
    );
}
