import ScheduleView from '@/components/Home/ScheduleView';
import style from '@styles/appStyles/home.module.scss';

export default function Home() {
    return (
        <div className={style.ScheduleWrap}>
            <h2 style={{ fontSize: '16px' }}>直近の予定</h2>
            <ScheduleView
                month={1}
                day={10}
                TimeStart="10:00"
                TimeEnd="22:30"
                Title="直近の予定直近の予定"
                SubTitle="直近の予定直近の予定"
            />
        </div>
    );
}
