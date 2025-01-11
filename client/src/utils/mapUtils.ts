import { PlaceDetails } from '@/types/PlaceDetails';

export const smoothPanTo = (map: google.maps.Map | null, targetLatLng: google.maps.LatLng) => {
    if (!map) return;

    const start = map.getCenter()!;
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

        map?.setCenter(new google.maps.LatLng(lat, lng));

        if (stepCount === steps) {
            clearInterval(panInterval);
            map?.setCenter(targetLatLng);
        }
    }, 10);
};

export const createMarker = async (
    map: google.maps.Map,
    position: google.maps.LatLng,
): Promise<google.maps.marker.AdvancedMarkerElement> => {
    const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as typeof google.maps.marker;

    const markerContent = document.createElement('div');
    markerContent.style.backgroundColor = 'red';
    markerContent.style.width = '32px';
    markerContent.style.height = '32px';
    markerContent.style.borderRadius = '50%';

    return new AdvancedMarkerElement({
        position,
        map,
        title: 'Selected Place',
        content: markerContent,
    });
};

// mapUtils.ts - Update getPlaceDetails to ensure all fields are captured
export const getPlaceDetails = (service: google.maps.places.PlacesService, placeId: string): Promise<PlaceDetails> => {
    return new Promise((resolve, reject) => {
        service.getDetails(
            {
                placeId,
                fields: [
                    'place_id',
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'international_phone_number',
                    'website',
                    'rating',
                    'geometry',
                    'reviews',
                    'opening_hours',
                    'price_level',
                    'photos',
                    'types',
                    'vicinity',
                    'business_status',
                    'icon',
                    'icon_background_color',
                    'icon_mask_base_uri',
                ],
            },
            (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                    const photoUrls =
                        result.photos?.map((photo) =>
                            photo.getUrl({
                                maxWidth: 800,
                                maxHeight: 600,
                            }),
                        ) || [];
                    resolve({
                        placeId: result.place_id || '',
                        name: result.name || '',
                        address: result.formatted_address || '',
                        phoneNumber: result.formatted_phone_number,
                        website: result.website,
                        rating: result.rating,
                        location: {
                            lat: result.geometry?.location?.lat() || 0,
                            lng: result.geometry?.location?.lng() || 0,
                        },
                        reviews: result.reviews,
                        openingHours: result.opening_hours
                            ? {
                                  weekday_text: result.opening_hours.weekday_text,
                              }
                            : undefined,
                        stayTime: undefined,
                        formattedPhoneNumber: result.formatted_phone_number,
                        internationalPhoneNumber: result.international_phone_number,
                        priceLevel: result.price_level,
                        photos: result.photos,
                        types: result.types,
                        vicinity: result.vicinity,
                        businessStatus: result.business_status,
                        formattedAddress: result.formatted_address,
                        icon: result.icon,
                        iconBackgroundColor: result.icon_background_color,
                        iconMaskBaseUri: result.icon_mask_base_uri,
                        primaryType: result.types?.[0],
                        userRatingsTotal: result.user_ratings_total,
                        photoUrls,
                    });
                } else {
                    reject(new Error(`Place details failed: ${status}`));
                }
            },
        );
    });
};

export const fetchPlaceDetailsFromLatLng = (
    map: google.maps.Map,
    latLng: google.maps.LatLng,
    callbacks: {
        onLocationSet: (location: google.maps.LatLng) => void;
        onPlacesFound: (places: PlaceDetails[]) => void;
    },
) => {
    callbacks.onLocationSet(latLng);
    smoothPanTo(map, latLng);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
            const getTypePriority = (types: string[]): number => {
                if (
                    types.includes('restaurant') ||
                    types.includes('food') ||
                    types.includes('clothing_store') ||
                    types.includes('shopping_mall') ||
                    types.includes('tourist_attraction')
                )
                    return 7;

                if (
                    types.includes('train_station') ||
                    types.includes('subway_station') ||
                    types.includes('bus_station')
                )
                    return 3;

                if (types.includes('point_of_interest')) return 6;
                if (types.includes('establishment')) return 5;
                if (types.includes('street_address')) return 2;
                if (types.includes('premise')) return 1;
                if (types.includes('subpremise')) return 0;

                return 0;
            };

            const filteredAndSortedResults = results
                .filter((result) => {
                    const excludedTypes = [
                        'route',
                        'plus_code',
                        'political',
                        'postal_code',
                        'country',
                        'administrative_area',
                        'locality',
                        'location',
                    ];
                    return !result.types.some((type) => excludedTypes.includes(type));
                })
                .sort((a, b) => {
                    const aScore = getTypePriority(a.types);
                    const bScore = getTypePriority(b.types);

                    if (bScore !== aScore) {
                        return bScore - aScore;
                    }

                    return (a.formatted_address?.length || 0) - (b.formatted_address?.length || 0);
                });

            const mostRelevantResult = filteredAndSortedResults[0];

            if (mostRelevantResult) {
                const service = new google.maps.places.PlacesService(map);
                getPlaceDetails(service, mostRelevantResult.place_id).then((place) => {
                    if (place) {
                        callbacks.onPlacesFound([place]);
                    }
                });
            }
        }
    });
};
