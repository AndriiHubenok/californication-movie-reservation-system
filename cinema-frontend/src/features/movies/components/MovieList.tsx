import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '../api';
import { formatMediaUrl } from '../../../utils/media';

export const MovieList = () => {
    const { data: movies, isLoading, isError, error } = useQuery({
        queryKey: ['movies'],
        queryFn: moviesApi.getAll,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Загрузка фильмов...</div>;
    }

    if (isError) {
        return <div className="p-8 text-red-500 text-center">Ошибка: {error.message}</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {movies?.map((movie) => (
                <div key={movie.id} className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <img
                        src={formatMediaUrl(movie.poster)}
                        alt={movie.title}
                        className="w-full h-80 object-cover bg-gray-100"
                    />
                    <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <h2 className="text-lg font-bold text-gray-900 leading-snug">{movie.title}</h2>
                            {movie.rating && (
                                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
                  ★ {movie.rating}
                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                            {movie.genres.map((genre) => (
                                <span key={genre.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {genre.name}
                </span>
                            ))}
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-3 mt-auto">
                            {movie.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};