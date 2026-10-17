from rest_framework import serializers

from movies.models import Genre, Movie, Showtime, Review, Hall


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class MovieSerializer(serializers.ModelSerializer):

    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), source='genres', write_only=True, many=True
    )
    rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Movie
        fields = ['id', 'title', 'rating', 'description', 'poster', 'genres', 'genre_ids']

class ReviewSerializer(serializers.ModelSerializer):

    movie_title = serializers.CharField(source='movie.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'movie', 'movie_title', 'points', 'grade', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'movie', 'created_at']

class PostReviewSerializer(serializers.Serializer):

    grade = serializers.IntegerField(min_value=1, max_value=10)
    comment = serializers.CharField(max_length=500)

class ShowtimeSerializer(serializers.ModelSerializer):

    movie_title = serializers.CharField(source='movie.title', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)

    class Meta:
        model = Showtime
        fields = ['id', 'movie', 'movie_title', 'hall', 'hall_name', 'start_time', 'end_time', 'price']

class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ["id", "name", "total_seats"]