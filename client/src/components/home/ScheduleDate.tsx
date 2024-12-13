import React from 'react';
import styles from '@styles/componentStyles/home/ScheduleDate.module.scss';

interface ScheduleData {
    month: number;
    startday: number;
    endday: number;
    Title: string;
    SubTitle: string;
    TimeStart: string;
    TimeEnd: string;
}

interface ScheduleDateProps {
    data: ScheduleData;
}
export default function ScheduleDate({ data }: ScheduleDateProps) {
    return (
        <div className={styles.DateWrap}>
            <p className={styles.Date}>
                {data.month}/<br />
                <span className={styles.day}>
                    {data.endday === data.startday ? data.startday : `${data.startday}-${data.endday}`}
                </span>
            </p>
        </div>
    );
}
