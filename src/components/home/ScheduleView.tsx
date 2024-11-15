import React from 'react';
import ScheduleDate from '@/components/home/ScheduleDate';
import style from '@styles/componentStyles/ScheduleView.module.scss';
import { BiChevronRight } from 'react-icons/bi';

interface ScheduleData {
    month: number;
    day: number;
    Title: string;
    SubTitle: string;
    TimeStart: string;
    TimeEnd: string;
}

interface ScheduleDateProps {
    data: ScheduleData;
}

export default function ScheduleView({ data }: ScheduleDateProps) {
    return (
        <div className={style.ScheduleWrap}>
            <div>
                <ScheduleDate month={data.month} day={data.day} />
            </div>

            <div className={style.ScheduleContents}>
                <div className={style.ScheduleInformation}>
                    <p className={style.time}>
                        {data.TimeStart}~{data.TimeEnd}
                    </p>
                    <h3>{data.Title}</h3>
                    <h4>{data.SubTitle}</h4>
                </div>
            </div>
            <div className={style.BiChevronRight}>
                <BiChevronRight size="30px" color="blue" />
            </div>
        </div>
    );
}
