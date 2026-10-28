
export interface Movie {
    id: number;
    title: string;
    rating: number | null;
    description: string;
    poster: string | null;
    genres: Genre[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface Showtime {
    id: number;
    movie: number;
    movie_title: string;
    hall: number;
    hall_name: string;
    price: number;
    start_time: string; // ISO: "2026-05-12T14:30:00Z"
    end_time: string; // ISO: "2026-05-12T16:30:00Z"
}

export interface Review {
    id: number;
    user_email: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    created_at: string;
}

export interface CreateReviewDto {
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
}