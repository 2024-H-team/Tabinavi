import ScheduleView from '@/components/Home/ScheduleView';
import style from '@styles/appStyles/home.module.scss';
import Footer from '@/components/Home/Footer';
import { IoSettingsOutline } from 'react-icons/io5';

const ScheduleViewArray = [
    {
        month: 1,
        day: 10,
        TimeStart: '10:00',
        TimeEnd: '22:30',
        Title: '直近の予定直近の予定',
        SubTitle: '直近の予定直近の予定',
    },
    {
        month: 1,
        day: 11,
        TimeStart: '11:00',
        TimeEnd: '23:30',
        Title: '直近の予定直近の予定2',
        SubTitle: '直近の予定直近の予定2',
    },
    {
        month: 1,
        day: 12,
        TimeStart: '12:00',
        TimeEnd: '24:30',
        Title: '直近の予定直近の予定3',
        SubTitle: '直近の予定直近の予定3',
    },
];

export default function Home() {
    return (
        <>
            <div className={style.Setting}>
                <IoSettingsOutline size="24px" />
            </div>
            <div className={style.calendar}></div>
            <div className={style.ScheduleWrap}>
                <h2 style={{ fontSize: '16px' }}>直近の予定</h2>
                {ScheduleViewArray.map((schedule, index) => (
                    <ScheduleView key={index} data={schedule} />
                ))}
                {/* <ScheduleView
                    month={1}
                    day={10}
                    TimeStart="10:00"
                    TimeEnd="22:30"
                    Title="直近の予定直近の予定"
                    SubTitle="直近の予定直近の予定"
                />
                <ScheduleView
                    month={1}
                    day={10}
                    TimeStart="10:00"
                    TimeEnd="22:30"
                    Title="直近の予定直近の予定"
                    SubTitle="直近の予定直近の予定"
                />
                <ScheduleView
                    month={1}
                    day={10}
                    TimeStart="10:00"
                    TimeEnd="22:30"
                    Title="直近の予定直近の予定"
                    SubTitle="直近の予定直近の予定"
                /> */}
            </div>
            <Footer />
        </>
    );
}
