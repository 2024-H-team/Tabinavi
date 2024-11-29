import Styles from '@styles/componentStyles/create-schedule/SelectedSpotsContainer.module.scss';
import SelectedSpot from './SelectedSpot';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useRouter } from 'next/navigation';
interface SelectedSpotsContainerProps {
    selectedSpots: PlaceDetails[];
    onDeleteSpot: (index: number) => void;
}

export default function SelectedSpotsContainer({ selectedSpots, onDeleteSpot }: SelectedSpotsContainerProps) {
    const router = useRouter();
    const handleCreateSchedule = () => {
        sessionStorage.setItem('ScheduleSpot', JSON.stringify(selectedSpots));
        router.push('/schedule');
    };
    return (
        <div className={Styles.Container}>
            {selectedSpots.map((spot, index) => (
                <SelectedSpot
                    key={index}
                    name={spot.name}
                    address={spot.address}
                    onDelete={() => onDeleteSpot(index)}
                />
            ))}
            <button onClick={handleCreateSchedule}>スケジュール作成</button>
        </div>
    );
}
