import ScheduleView from '@/components/home/ScheduleView';
import Bookmark from '@/components/Bookmark';
import styles from '@styles/appStyles/home/Home.module.scss';
import Footer from '@/components/Footer';
import { IoSettingsOutline } from 'react-icons/io5';
import ScheduleViewArray from '@/utils/ScheduleViewArray';

export default function Home() {
    return (
        <>
            <div className={styles.Setting}>
                <IoSettingsOutline size="24px" />
            </div>
            <div className={styles.Calendar}></div>
            <div className={styles.ScheduleWrap}>
                <h2 style={{ fontSize: '16px' }}>直近の予定</h2>
                {ScheduleViewArray.map((schedule, index) => (
                    <ScheduleView key={index} data={schedule} />
                ))}
            </div>
            <Bookmark />
            <Footer />
        </>
    );
}
