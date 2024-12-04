import styles from '@styles/componentStyles/create-schedule/SelectedSpot.module.scss';

interface SelectedSpotProps {
    name: string;
    address: string;
    onDelete: () => void;
}

export default function SelectedSpot({ name, address, onDelete }: SelectedSpotProps) {
    return (
        <div className={styles.spot}>
            <div className={styles.dragHolder}>=</div>
            <h3>{name}</h3>
            <p>住所: {address}</p>
            <div className={styles.closeBtn} onClick={onDelete}>
                X
            </div>
        </div>
    );
}
