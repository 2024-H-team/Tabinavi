import React from 'react';
import ScheduleDate from '@/components/Home/ScheduleDate';
import style from '@styles/componentStyles/ScheduleView.module.scss';
import { BiChevronRight } from 'react-icons/bi';

interface ScheduleDateProps {
    month: number;
    day: number;
    Title: string;
    SubTitle: string;
    TimeStart: string;
    TimeEnd: string;
}

export default function ScheduleView({ month, day, SubTitle, Title, TimeStart, TimeEnd }: ScheduleDateProps) {
    return (
        <div className={style.ScheduleWrap}>
            <div>
                <ScheduleDate month={month} day={day} />
            </div>

            <div className={style.ScheduleContents}>
                <div className={style.ScheduleInformation}>
                    <p className={style.time}>
                        {TimeStart}~{TimeEnd}
                    </p>
                    <h3>{Title}</h3>
                    <h4>{SubTitle}</h4>
                </div>
                <BiChevronRight size="30px" color="blue" />
            </div>
        </div>
    );
}
