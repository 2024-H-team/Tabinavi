import { PlaceDetails } from '@/types/PlaceDetails';
import Image from 'next/image';
import { useState } from 'react';
import Styles from '@styles/componentStyles/create-schedule/RecommendSpotsContainer.module.scss';

interface RecommendSpotsContainerProps {
    recommendedSpots: PlaceDetails[];
}

export default function RecommendSpotsContainer({ recommendedSpots }: RecommendSpotsContainerProps) {
    const [visibleItems, setVisibleItems] = useState(5);

    if (!recommendedSpots.length) return null;

    const handleLoadMore = () => {
        setVisibleItems((prev) => prev + 5);
    };

    const visibleSpots = recommendedSpots.slice(0, visibleItems);
    const hasMore = visibleItems < recommendedSpots.length;

    return (
        <div className={Styles.container}>
            <h2>おすすめスポット</h2>
            <div className={Styles.spotsGrid}>
                {visibleSpots.map((spot, index) => (
                    <div key={`${spot.placeId}-${index}`} className={Styles.spotCard}>
                        {spot.photos?.[0] && (
                            <div className={Styles.imageWrapper}>
                                <Image
                                    src={spot.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })}
                                    alt={spot.name}
                                    width={200}
                                    height={200}
                                    style={{
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        )}
                        <div className={Styles.spotInfo}>
                            <h3>{spot.name}</h3>
                            <p>{spot.address}</p>
                            {spot.rating && <p>Rating: {spot.rating}★</p>}
                        </div>
                    </div>
                ))}
                {hasMore && (
                    <button onClick={handleLoadMore} className={Styles.loadMoreButton}>
                        もっと見る
                    </button>
                )}
            </div>
        </div>
    );
}
