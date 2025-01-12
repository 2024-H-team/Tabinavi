'use client';

import Styles from '@styles/componentStyles/create-schedule/CreateScheduleMap.module.scss';
import { useMemo, useRef, useState, useEffect } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useMapContext } from '@/components/MapProvider';
import { smoothPanTo, createMarker, fetchPlaceDetailsFromLatLng, getPlaceDetails } from '@/utils/mapUtils';

interface CreateScheduleMapProps {
    onPlaceSelect: (places: PlaceDetails[]) => void;
    recommendedSpots?: PlaceDetails[];
    focusedSpot?: PlaceDetails | null; // Thêm prop này để xử lý click từ RecommendSpotsContainer
}

const CreateScheduleMap: React.FC<CreateScheduleMapProps> = ({ onPlaceSelect, recommendedSpots, focusedSpot }) => {
    const { isLoaded, loadError } = useMapContext();
    const mapRef = useRef<google.maps.Map | null>(null);
    const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [clickedLocation, setClickedLocation] = useState<google.maps.LatLng | null>(null);

    // Ref để giữ track các marker đỏ
    const redMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

    const center = useMemo(() => ({ lat: 34.6937, lng: 135.5023 }), []);

    // State để quản lý các marker màu xanh
    const [recommendMarkers, setRecommendMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

    // Effect để xử lý các marker màu xanh (recommendedSpots)
    useEffect(() => {
        if (!mapRef.current || !recommendedSpots?.length) {
            // Remove markers bằng cách set map = null
            recommendMarkers.forEach((marker) => {
                marker.map = null;
            });
            setRecommendMarkers([]);
            return;
        }

        const createRecommendMarkers = async () => {
            // Xóa các marker màu xanh cũ
            recommendMarkers.forEach((marker) => {
                marker.map = null;
            });

            // Tạo các marker màu xanh mới
            const newMarkers = await Promise.all(
                recommendedSpots.map(async (spot) => {
                    return createMarker(
                        mapRef.current!,
                        new google.maps.LatLng(spot.location.lat, spot.location.lng),
                        'blue', // Màu xanh cho recommended spots
                    );
                }),
            );

            setRecommendMarkers(newMarkers);
        };

        createRecommendMarkers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recommendedSpots]);

    // Effect để xử lý marker màu đỏ khi focusedSpot thay đổi
    useEffect(() => {
        if (!mapRef.current || !focusedSpot) return;

        const createHighlightMarker = async () => {
            const position = new google.maps.LatLng(focusedSpot.location.lat, focusedSpot.location.lng);

            // Pan tới vị trí của focusedSpot
            smoothPanTo(mapRef.current, position);

            // Xóa tất cả các marker đỏ hiện có
            redMarkersRef.current.forEach((marker) => {
                marker.map = null;
            });
            redMarkersRef.current = [];

            // Tạo một marker màu đỏ chồng lên marker màu xanh
            const newRedMarker = await createMarker(
                mapRef.current!,
                position,
                'red', // Màu đỏ cho marker highlight
            );

            // Lưu marker màu đỏ vào ref
            redMarkersRef.current.push(newRedMarker);
        };

        createHighlightMarker();
    }, [focusedSpot]);

    // Effect để xử lý marker đỏ khi user click trên map
    useEffect(() => {
        if (!clickedLocation || !mapRef.current) return;

        const initializeMarker = async () => {
            try {
                // Xóa tất cả các marker đỏ hiện có
                redMarkersRef.current.forEach((marker) => {
                    marker.map = null;
                });
                redMarkersRef.current = [];

                if (markerRef.current) {
                    markerRef.current.position = clickedLocation;
                } else {
                    if (mapRef.current) {
                        markerRef.current = await createMarker(mapRef.current, clickedLocation, 'red'); // Màu đỏ cho marker click
                        redMarkersRef.current.push(markerRef.current);
                    }
                }
            } catch (error) {
                console.error('Error initializing AdvancedMarkerElement: ', error);
            }
        };

        initializeMarker();
    }, [clickedLocation]);

    const handlePlaceSelect = () => {
        if (autoCompleteRef.current) {
            const place = autoCompleteRef.current.getPlace();

            if (place && place.geometry && place.geometry.location) {
                const location = place.geometry.location;
                smoothPanTo(mapRef.current, location);

                const service = new google.maps.places.PlacesService(mapRef.current!);
                getPlaceDetails(service, place.place_id!).then((placeDetails) => {
                    if (placeDetails) {
                        setClickedLocation(location);
                        setSelectedPlaces([placeDetails]);
                        onPlaceSelect([placeDetails]);
                    }
                });
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        const latLng = e.latLng;
        if (!latLng || !mapRef.current) return;

        // Check if click was on a POI
        if ('placeId' in e && e.placeId) {
            e.stop?.();

            const service = new google.maps.places.PlacesService(mapRef.current);
            getPlaceDetails(service, e.placeId as string).then((place) => {
                if (place) {
                    setClickedLocation(latLng);
                    setSelectedPlaces([place]);
                    onPlaceSelect([place]);
                }
            });
        } else {
            // Normal click on map
            fetchPlaceDetailsFromLatLng(mapRef.current, latLng, {
                onLocationSet: setClickedLocation,
                onPlacesFound: (places) => {
                    setSelectedPlaces(places);
                    onPlaceSelect(places);
                },
            });
        }
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <>
            <style>{`
                .gm-style-iw { display: none!important; }
                .gm-style-iw-tc { display: none!important; }
            `}</style>
            <div className={Styles.mapContainer}>
                <Autocomplete
                    onLoad={(autocomplete) => (autoCompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceSelect}
                    className={Styles.searchBox}
                >
                    <input type="text" placeholder="Search for a place" />
                </Autocomplete>

                <GoogleMap
                    center={selectedPlaces[0]?.location || center}
                    zoom={10}
                    mapContainerClassName={Styles.mapContainer}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    onLoad={(map) => {
                        mapRef.current = map;
                        map.setOptions({ mapId: '26a4732fc7efb60' });
                    }}
                    onClick={handleMapClick}
                />
            </div>
        </>
    );
};

export default CreateScheduleMap;
