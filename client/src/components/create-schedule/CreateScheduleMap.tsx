'use client';

import Styles from '@styles/componentStyles/create-schedule/CreateScheduleMap.module.scss';
import { useMemo, useRef, useState, useEffect } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useMapContext } from '@/components/MapProvider';

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
                const { AdvancedMarkerElement } = (await google.maps.importLibrary(
                    'marker',
                )) as typeof google.maps.marker;

                const markerContent = document.createElement('div');
                markerContent.style.backgroundColor = 'red';
                markerContent.style.width = '32px';
                markerContent.style.height = '32px';
                markerContent.style.borderRadius = '50%';

                if (markerRef.current) {
                    markerRef.current.position = clickedLocation;
                    markerRef.current.content = markerContent;
                } else {
                    markerRef.current = new AdvancedMarkerElement({
                        position: clickedLocation,
                        map: mapRef.current,
                        title: 'Selected Place',
                        content: markerContent,
                    });
                }
            } catch (error) {
                console.error('Error initializing AdvancedMarkerElement: ', error);
            }
        };

        initializeMarker();
    }, [clickedLocation]);

    const smoothPanTo = (targetLatLng: google.maps.LatLng) => {
        if (!mapRef.current) return;

        const start = mapRef.current.getCenter()!;
        const startLat = start.lat();
        const startLng = start.lng();
        const targetLat = targetLatLng.lat();
        const targetLng = targetLatLng.lng();
        const steps = 30;
        let stepCount = 0;

        const panInterval = setInterval(() => {
            stepCount++;
            const progress = stepCount / steps;
            const lat = startLat + (targetLat - startLat) * progress;
            const lng = startLng + (targetLng - startLng) * progress;

            mapRef.current?.setCenter(new google.maps.LatLng(lat, lng));

            if (stepCount === steps) {
                clearInterval(panInterval);
                mapRef.current?.setCenter(targetLatLng);
            }
        }, 10);
    };

    const fetchPlaceDetailsFromLatLng = (latLng: google.maps.LatLng) => {
        setClickedLocation(latLng);

        smoothPanTo(latLng);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results) {
                const filteredAndSortedResults = results
                    .slice(0, 5)
                    .filter(
                        (result) =>
                            !result.types.includes('route') &&
                            !result.types.includes('plus_code') &&
                            !result.types.includes('premise'),
                    )
                    .sort((a, b) => {
                        const aTypePriority = a.types.includes('street_address') ? 1 : 0;
                        const bTypePriority = b.types.includes('street_address') ? 1 : 0;
                        return aTypePriority - bTypePriority;
                    });

                const placeIds = filteredAndSortedResults.map((result) => result.place_id);
                const service = new google.maps.places.PlacesService(mapRef.current!);

                const placeDetailsPromises = placeIds.map((placeId) => {
                    return new Promise<PlaceDetails | null>((resolve) => {
                        service.getDetails({ placeId }, (place, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                                const placeDetails: PlaceDetails = {
                                    name: place.name || '',
                                    address: place.formatted_address || '',
                                    phoneNumber: place.formatted_phone_number || undefined,
                                    website: place.website || undefined,
                                    rating: place.rating || undefined,
                                    location: {
                                        lat: place.geometry?.location?.lat() || 0,
                                        lng: place.geometry?.location?.lng() || 0,
                                    },
                                };
                                resolve(placeDetails);
                            } else {
                                resolve(null);
                            }
                        });
                    });
                });

                Promise.all(placeDetailsPromises).then((places) => {
                    const validPlaces = places.filter((place) => place !== null) as PlaceDetails[];
                    setSelectedPlaces(validPlaces);
                    onPlaceSelect(validPlaces);
                });
            } else {
                console.error('Geocoding failed: ' + status);
            }
        });
    };
    const handlePlaceSelect = () => {
        if (autoCompleteRef.current) {
            const place = autoCompleteRef.current.getPlace();

            if (place && place.geometry && place.geometry.location) {
                const location = place.geometry.location;
                smoothPanTo(location);

                const placeDetails: PlaceDetails = {
                    name: place.name || '',
                    address: place.formatted_address || '',
                    phoneNumber: place.formatted_phone_number || undefined,
                    website: place.website || undefined,
                    rating: place.rating || undefined,
                    location: { lat: location.lat(), lng: location.lng() },
                };

                setClickedLocation(location);
                setSelectedPlaces([placeDetails]);
                onPlaceSelect([placeDetails]);
            }
        }
    };

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <>
            <style>
                {`
                .gm-style-iw {
                    display: none!important;
                }
                .gm-style-iw-tc {
                    display: none!important;
                }
            `}
            </style>
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
                    onClick={(e) => {
                        const latLng = e.latLng;
                        if (latLng) fetchPlaceDetailsFromLatLng(latLng);
                    }}
                />
            </div>
        </>
    );
};

export default CreateScheduleMap;
