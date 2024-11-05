import style from '@styles/componentStyles/Footer.module.scss';
import { GoHome } from 'react-icons/go';
import { PiPlusSquareBold } from 'react-icons/pi';
import { BsClockHistory } from 'react-icons/bs';

export default function Footer() {
    return (
        <footer className={style.FooterWrap}>
            <div className={style.navBtn}>
                <GoHome color="white" size="24px" />
                <p>Home</p>
            </div>
            <div className={style.navBtn}>
                <PiPlusSquareBold color="white" size="24px" />
                <p>Home</p>
            </div>
            <div className={style.navBtn}>
                <BsClockHistory color="white" size="24px" />
                <p>Home</p>
            </div>
        </footer>
    );
}
