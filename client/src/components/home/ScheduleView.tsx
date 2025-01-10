import React, { useEffect } from 'react';
import ScheduleDate from '@/components/home/ScheduleDate';
import styles from '@styles/componentStyles/home/ScheduleView.module.scss';
import { BiChevronRight } from 'react-icons/bi';
import ScheduleViewArray from '@/utils/ScheduleViewArray';

interface Schedule {
    id: number;
    startDate: string;
    endDate: string;
    StartTime: string;
    EndTime: string;
    Title: string;
    SubTitle: string;
}

export default function ScheduleView() {
    const [schedule, setSchedule] = React.useState<Schedule[]>([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            const response = await fetch('/schedule.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch schedule: ${response.status}`);
            }

            const data: Schedule[] = await response.json();

            setSchedule(data);
        };
        fetchSchedule();
    }, []);

    return (
        <>
            <h2 style={{ fontSize: '16px' }}>直近の予定</h2>
            {ScheduleViewArray.map((schedule, index) => (
                <div key={index} className={styles.ScheduleWrap}>
                    <div>
                        <ScheduleDate month={schedule.month} day={schedule.day} />
                    </div>

                    <div className={styles.ScheduleContents}>
                        <div className={styles.ScheduleInformation}>
                            <p className={styles.time}>
                                {schedule.TimeStart}~{schedule.TimeEnd}
                            </p>
                            <h3>{schedule.Title}</h3>
                            <h4>{schedule.SubTitle}</h4>
                        </div>
                    </div>
                    <div className={styles.BiChevronRight}>
                        <BiChevronRight size="30px" color="blue" />
                    </div>
                </div>
            ))}
        </>
    );
}
