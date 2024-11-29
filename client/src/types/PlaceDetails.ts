export interface PlaceDetails {
    name: string;
    address: string;
    phoneNumber?: string;
    website?: string;
    rating?: number;
    location: { lat: number; lng: number };
}
