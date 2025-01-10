import ScheduleView from '@/components/home/ScheduleView';
import styles from '@styles/appStyles/home/Home.module.scss';
import Footer from '@/components/Footer';
import { IoSettingsOutline } from 'react-icons/io5';
import Calendar from '@/components/Calendar';

export default function Home() {
    return (
        <>
            <div className={styles.ContentWrap}>
                <div className={styles.Setting}>
                    <IoSettingsOutline size="24px" />
                </div>
                <Calendar />
                <div className={styles.ScheduleWrap}>
                    <ScheduleView />
                </div>
            </div>
            <Footer />
        </>
    );
}
