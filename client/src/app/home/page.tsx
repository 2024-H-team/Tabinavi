import ScheduleView from '@/components/home/ScheduleView';
import styles from '@styles/appStyles/home/Home.module.scss';
import Footer from '@/components/Footer';
import { IoSettingsOutline } from 'react-icons/io5';
import ScheduleViewArray from '@/utils/ScheduleViewArray';
import Calender from '@/components/Calender';

export default function Home() {
    return (
        <>
            <div className={styles.ContentWrap}>
                <div className={styles.Setting}>
                    <IoSettingsOutline size="24px" />
                </div>
                <Calender />
                <div className={styles.ScheduleWrap}>
                    <h2 style={{ fontSize: '16px' }}>直近の予定</h2>
                    {ScheduleViewArray.map((schedule, index) => (
                        <ScheduleView key={index} data={schedule} />
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
