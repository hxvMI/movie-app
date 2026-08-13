import { useState } from "react";
import "../css/MovieCard.css";
import { useMovieContext } from "../context/MovieContext";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
    const [ posterFailed, setPosterFailed ] = useState(false);
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
    const favorite = isFavorite(movie.id);

    //Preventing the default keeps the favorite action separate from nearby navigation links.
    function handleFavoriteClick(event) {
        event.preventDefault();
        if (favorite) removeFromFavorites(movie.id);
        else addToFavorites(movie);
    }
    
    return (
        <div className="movie-card">
            <div className="movie-poster">
                {movie.poster_path && !posterFailed ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={`${movie.title} poster`}
                        onError={() => setPosterFailed(true)}
                    />
                ) : (
                    <div className="poster-fallback" role="img" aria-label={`No poster available for ${movie.title}`}>
                        <span>No poster available</span>
                    </div>
                )}

                <div className="movie-overlay">
                    <button
                        className={`favorite-btn ${favorite ? "active" : ""}`}
                        onClick={handleFavoriteClick}
                        aria-label={favorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                        aria-pressed={favorite}
                    >
                        {"\u2665"}
                    </button>
                </div>
            </div>

            <div className="movie-info">
                <h3>
                    {/*The movie ID becomes the dynamic :movieId portion of the details route.*/}
                    <Link to={`/movies/${movie.id}`} className="movie-title-link">
                        {movie.title}
                    </Link>
                </h3>
                <p>{movie.release_date?.split("-")[0] || "Release year unavailable"}</p>
            </div>
        </div>
    );
}

export default MovieCard;
