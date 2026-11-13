import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    createMovieReview,
    fetchMovieInfo,
    type MovieReview,
} from '../api/movies';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import type { Movie } from '../types/movie';

export const MovieDetailsPage = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const { isAuthenticated } = useAuth();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [reviews, setReviews] = useState<MovieReview[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [grade, setGrade] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!movieId) return;

        const controller = new AbortController();

        const loadPageData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const movieInfo = await fetchMovieInfo(movieId, controller.signal)

                setMovie(movieInfo);
                setReviews(movieInfo.reviews || []);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'It is not possible to load the movie details at the moment. Please try again later.'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadPageData();

        return () => controller.abort();
    }, [movieId]);

    const handleReviewSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!movieId) return;

        if (!comment.trim()) {
            setSubmitError('Write a review text before submitting.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const createdReview = await createMovieReview(movieId, {
                grade,
                comment: comment.trim(),
            });
            setReviews((prev) => [createdReview, ...prev]);
            setComment('');
            setGrade(5);
        } catch (err) {
            setSubmitError(
                err instanceof ApiError
                    ? err.message
                    : 'It is not possible to save the review at the moment. Please try again later.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <main className="movie-details-page"><p>Loading...</p></main>;
    }

    if (error || !movie) {
        return (
            <main className="movie-details-page">
                <p style={{ color: '#ff4d4d', marginBottom: '16px' }}>{error ?? 'Movie not found'}</p>
                <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    ← Back to the poster
                </Link>
            </main>
        );
    }

    return (
        <main className="movie-details-page">
            <Link to="/" className="back-link">← Back to the homepage</Link>

            <section className="movie-hero">
                <img src={movie.poster} alt={movie.title} className="movie-hero-poster" />
                <div className="movie-hero-info">
                    <h2>{movie.title}</h2>
                    <p className="movie-meta">
                        Duration: {movie.duration} min · Genres: {movie.genres?.join(', ')}
                    </p>
                    <p className="movie-description">{movie.description}</p>
                </div>
            </section>

            <section className="reviews-section">
                <h3>Reviews ({reviews.length})</h3>

                {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="review-form">
                        <h4>Leave a review</h4>
                        <div className="form-group">
                            <label>Your grade:</label>
                            <StarRating value={grade} onChange={setGrade} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="review-comment">Comment:</label>
                            <textarea
                                id="review-comment"
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about the movie..."
                                required
                            />
                        </div>
                        {submitError && <p className="error-message">{submitError}</p>}
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Publishing...' : 'Publish Review'}
                        </button>
                    </form>
                ) : (
                    <div className="review-auth-prompt">
                        <p>
                            To leave a rating or review, please{' '}
                            <Link to="/login">sign in to your account</Link>.
                        </p>
                    </div>
                )}

                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <p style={{ color: '#a0a0a0' }}>There are no reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <article key={review.id} className="review-card">
                                <div className="review-header">
                                    <strong>{review.user}</strong>
                                    <StarRating value={review.rating} readOnly />
                                </div>
                                <p className="review-body">{review.comment}</p>
                                <time className="review-date">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </time>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
};