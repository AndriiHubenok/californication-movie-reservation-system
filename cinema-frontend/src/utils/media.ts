export const formatMediaUrl = (url: string | null): string => {
    if (!url) return 'https://placehold.co/400x600?text=No+Poster';
    return url.replace('http://minio:9000', 'http://localhost:9000');
};