import styles from '@styles/componentStyles/Footer.module.scss';
import { GoHome } from 'react-icons/go';
import { PiPlusSquareBold } from 'react-icons/pi';
import { BsClockHistory } from 'react-icons/bs';

export default function Footer() {
    return (
        <footer className={styles.FooterWrap}>
            <div className={styles.NavBtn}>
                <GoHome color="white" size="24px" />
                <p>Home</p>
            </div>
            <div className={styles.NavBtn}>
                <PiPlusSquareBold color="white" size="24px" />
                <p>Home</p>
            </div>
            <div className={styles.NavBtn}>
                <BsClockHistory color="white" size="24px" />
                <p>Home</p>
            </div>
        </footer>
    );
}
