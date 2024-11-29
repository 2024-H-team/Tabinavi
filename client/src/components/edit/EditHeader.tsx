import { IoIosArrowBack } from 'react-icons/io';
import styles from '@styles/componentStyles/edit/EditHeader.module.scss';

export default function EditHeader() {
    return (
        <header className={styles.header}>
            <IoIosArrowBack size={18} color="white" />
            <h1>Test</h1>
        </header>
    );
}
