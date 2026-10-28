import { apiClient } from '../../api/client';
import type { Movie, Review, CreateReviewDto } from '../../types/movies';

export const moviesApi = {
    getAll: async (): Promise<Movie[]> => {
        const { data } = await apiClient.get<Movie[]>('/movies/');
        return data;
    },

    getById: async (id: number): Promise<Movie> => {
        const { data } = await apiClient.get<Movie>(`/movies/${id}/`);
        return data;
    },

    addReview: async (movieId: number, payload: CreateReviewDto): Promise<Review> => {
        const { data } = await apiClient.post<Review>(`/movies/${movieId}/reviews/`, payload);
        return data;
    },
};