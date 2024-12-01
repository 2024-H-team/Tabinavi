import { HiOutlineTrash } from 'react-icons/hi';
import styles from '@styles/componentStyles/edit/DeleteSchedule.module.scss';

export default function DeleteSchedule() {
    return (
        <button className={styles.DeleteScheduleWrap}>
            <p>行き先を消去する</p>
            <HiOutlineTrash color="red" className={styles.TrashIcon} />
        </button>
    );
}
