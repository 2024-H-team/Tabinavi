import styles from '@styles/componentStyles/Footer.module.scss';
import { GoHome } from 'react-icons/go';
import { PiPlusSquareBold } from 'react-icons/pi';
import { FaRegUser } from 'react-icons/fa';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className={styles.FooterWrap}>
            <Link className={styles.NavBtn} href={'/home'}>
                <GoHome color="white" size="24px" />
                <p>ホーム</p>
            </Link>
            <Link className={styles.NavBtn} href={'/create-schedule'}>
                <PiPlusSquareBold color="white" size="24px" />
                <p>スケジュール作成</p>
            </Link>
            <Link className={styles.NavBtn} href={'/profile'}>
                <FaRegUser color="white" size="24px" />
                <p>マイページ</p>
            </Link>
        </footer>
    );
}
