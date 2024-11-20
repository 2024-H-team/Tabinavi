import React from 'react';
import style from '@styles/componentStyles/ScheduleDate.module.scss';

interface ScheduleDateProps {
    month: number;
    day: number;
}

export default function ScheduleDate({ month, day }: ScheduleDateProps) {
    return (
        <div className={style.DateWrap}>
            <p className={style.Date}>
                {month}/<br />
                <span className={style.day}>{day}</span>
            </p>
        </div>
    );
}
