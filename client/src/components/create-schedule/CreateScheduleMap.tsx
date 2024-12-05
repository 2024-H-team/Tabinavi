'use client';

import Styles from '@styles/componentStyles/create-schedule/CreateScheduleMap.module.scss';
import { useMemo, useRef, useState, useEffect } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useMapContext } from '@/components/MapProvider';
import { smoothPanTo, createMarker, fetchPlaceDetailsFromLatLng, getPlaceDetails } from '@/utils/mapUtils';

interface CreateScheduleMapProps {
    onPlaceSelect: (places: PlaceDetails[]) => void;
}

const CreateScheduleMap: React.FC<CreateScheduleMapProps> = ({ onPlaceSelect }) => {
    const { isLoaded, loadError } = useMapContext();
    const mapRef = useRef<google.maps.Map | null>(null);
    const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [clickedLocation, setClickedLocation] = useState<google.maps.LatLng | null>(null);

    const center = useMemo(() => ({ lat: 34.6937, lng: 135.5023 }), []);

    useEffect(() => {
        if (!clickedLocation || !mapRef.current) return;

        const initializeMarker = async () => {
            try {
                if (markerRef.current) {
                    markerRef.current.position = clickedLocation;
                } else {
                    if (mapRef.current) {
                        markerRef.current = await createMarker(mapRef.current, clickedLocation);
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
