import React from 'react';
import styles from '@styles/componentStyles/home/ScheduleDate.module.scss';

interface ScheduleData {
    id: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    Title: string;
    SubTitle: string;
}

interface ScheduleDateProps {
    data: ScheduleData;
}

export default function ScheduleDate({ data }: ScheduleDateProps) {
    const getMonthAndDay = (date: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [year, month, day] = date.split('-');
        return { month, day };
    };

    const start = getMonthAndDay(data.startDate);
    const end = getMonthAndDay(data.endDate);
    return (
        <div className={styles.DateWrap}>
            <p className={styles.Date}>
                {start.month}/<br />
                <span className={styles.day}>{start.day === end.day ? start.day : `${start.day}-${end.day}`}</span>
            </p>
        </div>
    );
}
