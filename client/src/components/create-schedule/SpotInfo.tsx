import Styles from '@styles/componentStyles/create-schedule/spotInfo.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';

interface SpotInfoProps {
    places: PlaceDetails[];
    onAddSpot: (spot: PlaceDetails) => void;
}

export default function SpotInfo({ places, onAddSpot }: SpotInfoProps) {
    return (
        <div className={Styles.infoContainer}>
            {places.length > 0 ? (
                places.map((place, index) => (
                    <div key={index} className={Styles.placeInfo}>
                        <h2>{place.name}</h2>
                        <p>住所：{place.address}</p>
                        {place.phoneNumber && <p>電話番号: {place.phoneNumber}</p>}
                        {place.website && (
                            <p>
                                ウェブサイト:{' '}
                                <a href={place.website} target="_blank" rel="noopener noreferrer">
                                    {place.website}
                                </a>
                            </p>
                        )}
                        {place.rating && <p>評価 : {place.rating}★</p>}
                        <button onClick={() => onAddSpot(place)}>この場所を選ぶ</button>
                    </div>
                ))
            ) : (
                <p>選択されていません。地図上で場所を選択してください。</p>
            )}
        </div>
    );
}
