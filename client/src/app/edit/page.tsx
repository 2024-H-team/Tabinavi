'use client';
import Content from '@/components/edit/Content';
import EditHeader from '@/components/edit/EditHeader';
import { useEffect, useState } from 'react';

type ScheduleData = {
    id: number;
    Location: string;
    Time: string;
    PersonalEffects: { Name: string }[];
    Memo: string;
};

export default function Edit() {
    const [scheduleData, setScheduleData] = useState<ScheduleData | undefined>(undefined);
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await fetch('/ScheduleEdit.json');
                if (!res.ok) {
                    throw new Error('データの取得に失敗しました');
                }
                const data = await res.json();
                setScheduleData(data.scheduledata[0]);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSchedule();
    }, []);

    return (
        <>
            <EditHeader location={scheduleData?.Location || '未設定'} />
            <Content data={scheduleData} />
        </>
    );
}
