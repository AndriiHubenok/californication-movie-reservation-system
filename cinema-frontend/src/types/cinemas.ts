

export interface Hall {
    id: number;
    name: string;
    total_seats: number;
}

export interface Cinema {
    id: number;
    name: string;
    address: string;
    halls_count: number;
}

export interface CinemaLocation {
    id: number;
    name: string;
    address: string;
    location: {
        type: string; // "Point"
        coordinates: [number, number]; // [longitude, latitude]
    };
}

export interface CinemaDetail {
    id: number;
    name: string;
    address: string;
    halls: Hall[];
}