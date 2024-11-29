import Styles from '@styles/componentStyles/create-schedule/SelectedSpot.module.scss';

interface SelectedSpotProps {
    name: string;
    address: string;
    onDelete: () => void;
}

export default function SelectedSpot({ name, address, onDelete }: SelectedSpotProps) {
    return (
        <div className={Styles.Spot}>
            <h3>{name}</h3>
            <p>住所: {address}</p>
            <div className={Styles.closeBtn} onClick={onDelete}>
                X
            </div>
        </div>
    );
}
