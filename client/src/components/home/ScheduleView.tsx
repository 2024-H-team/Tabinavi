import React from 'react';
import ScheduleDate from '@/components/home/ScheduleDate';
import styles from '@styles/componentStyles/home/ScheduleView.module.scss';
import { BiChevronRight } from 'react-icons/bi';

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

export default function ScheduleView({ data }: ScheduleDateProps) {
    return (
        <div className={styles.ScheduleWrap}>
            <div>
                <ScheduleDate data={data} />
            </div>

            <div className={styles.ContentsWrap}>
                <div className={styles.ScheduleContents}>
                    <p className={styles.time}>
                        {data.TimeStart}~{data.TimeEnd}
                    </p>
                    <h3>{data.Title}</h3>
                    <h4>{data.SubTitle}</h4>
                </div>
                <div className={styles.BiChevronRight}>
                    <BiChevronRight size="30px" color="blue" />
                </div>
            </div>
        </div>
    );
}
