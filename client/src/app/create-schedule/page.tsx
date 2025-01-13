// InfoSetup.tsx
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
                <h2>新しい予定</h2>

                <div className={styles.toggleGroup}>
                    <span className={styles.toggleLabel}>日帰り</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={isOneDay} onChange={(e) => setIsOneDay(e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.datePickerContainer}>
                    <div className={styles.datePickerGroup}>
                        <p className={styles.dateText} data-checked={isOneDay}></p>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>

                    {!isOneDay && (
                        <div className={styles.datePickerGroup}>
                            <p>終了日</p>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {((isOneDay && startDate) || (!isOneDay && startDate && endDate)) &&
                    schedules.map((schedule, index) => (
                        <div key={index} className={styles.daySchedule}>
                            <p className={styles.date}>{schedule.date}</p>
                            <div className={styles.timePickerGroup}>
                                <div className={styles.pickers}>
                                    開始時間
                                    <div className={styles.pickersBlock}>
                                        <WheelPicker
                                            data={hours}
                                            defaultSelection={hours.indexOf(schedule.startTime.split(':')[0])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'start',
                                                    `${value}:${schedule.startTime.split(':')[1]}`,
                                                )
                                            }
                                        />
                                        <p>-</p>
                                        <WheelPicker
                                            data={minutes}
                                            defaultSelection={minutes.indexOf(schedule.startTime.split(':')[1])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'start',
                                                    `${schedule.startTime.split(':')[0]}:${value}`,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <span>~</span>
                                <div className={styles.pickers}>
                                    終了時間
                                    <div className={styles.pickersBlock}>
                                        <WheelPicker
                                            data={hours}
                                            defaultSelection={hours.indexOf(schedule.endTime.split(':')[0])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'end',
                                                    `${value}:${schedule.endTime.split(':')[1]}`,
                                                )
                                            }
                                        />
                                        <p>-</p>
                                        <WheelPicker
                                            data={minutes}
                                            defaultSelection={minutes.indexOf(schedule.endTime.split(':')[1])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'end',
                                                    `${schedule.endTime.split(':')[0]}:${value}`,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                <div className={styles.btnBox}>
                    <button onClick={handleSubmit} className={styles.submitButton}>
                        次に進む
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}
