import { IoIosArrowBack } from 'react-icons/io';
import styles from '@styles/componentStyles/edit/EditHeader.module.scss';

type Props = {
    location: string | null;
};

export default function EditHeader(props: Props) {
    return (
        <header className={styles.header}>
            <IoIosArrowBack size={18} color="white" />
            <h1>{props.location}</h1>
        </header>
    );
}
