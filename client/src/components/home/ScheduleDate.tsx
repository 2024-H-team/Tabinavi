import React from 'react';
import styles from '@styles/componentStyles/home/ScheduleDate.module.scss';

interface ScheduleDateProps {
    data: {
        startDate: string;
        endDate: string;
    };
}

export default function ScheduleDate({ data }: ScheduleDateProps) {
    const getMonthAndDay = (date: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [year, month, day] = date.split('-');
        return { month: parseInt(month), day: parseInt(day) };
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
