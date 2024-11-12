import ScheduleView from '@/components/Home/ScheduleView';
import style from '@styles/appStyles/Home/Home.module.scss';
import Footer from '@/components/Footer';
import { IoSettingsOutline } from 'react-icons/io5';
import ScheduleViewArray from './utils/ScheduleViewArray';

export default function Home() {
    return (
        <>
            <div className={style.Setting}>
                <IoSettingsOutline size="24px" />
            </div>
            <div className={style.Calendar}></div>
            <div className={style.ScheduleWrap}>
                <h2 style={{ fontSize: '16px' }}>直近の予定</h2>
                {ScheduleViewArray.map((schedule, index) => (
                    <ScheduleView key={index} data={schedule} />
                ))}
            </div>
            <Footer />
        </>
    );
}
