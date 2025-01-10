export interface PlaceDetails {
    name: string;
    address: string;
    phoneNumber?: string;
    website?: string;
    rating?: number;
    location: {
        lat: number;
        lng: number;
    };
    reviews?: google.maps.places.PlaceReview[];
    openingHours?: {
        weekday_text?: string[];
    };
    stayTime?: {
        hour: string;
        minute: string;
    };
}
