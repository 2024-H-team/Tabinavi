import React from 'react';
import styles from '@styles/componentStyles/home/ScheduleDate.module.scss';

interface ScheduleDateProps {
    month: number;
    day: number;
}

export default function ScheduleDate({ month, day }: ScheduleDateProps) {
    return (
        <div className={styles.DateWrap}>
            <p className={styles.Date}>
                {month}/<br />
                <span className={styles.day}>{day}</span>
            </p>
        </div>
    );
}
