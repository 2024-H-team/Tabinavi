'use client';
import EditHeader from '@/components/edit/EditHeader';
import { useEffect, useState } from 'react';

export default function Edit() {
    const [location, setLocation] = useState<string | null>(null);
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await fetch('/ScheduleEdit.json');
                if (!res.ok) {
                    throw new Error('データの取得に失敗しました');
                }
                const data = await res.json();
                const firstLocation = data.scheduledata[0]?.Location;
                setLocation(firstLocation);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSchedule();
    }, []);

    console.log(location);
    return (
        <>
            <EditHeader location={location} />
            <p>1</p>
        </>
    );
}
