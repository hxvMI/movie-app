import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MovieCard from "../components/MovieCard";
import { useMovieContext } from "../context/MovieContext";
import "../css/MovieDetails.css";
import { getMovieDetails } from "../services/api";

/*
Program Flow — Movie Details
1. useParams reads the movieId from /movies/:movieId.
2. One TMDB request loads details plus videos, cast credits, and recommendations.
3. Derived values select the preferred trailer, principal cast, rating, and related movies.
4. MovieContext supplies the current favorite state and add/remove actions.
5. The page renders resilient fallbacks when images or optional TMDB sections are unavailable.
*/

function MovieDetails() {
    const { movieId } = useParams();
    const [movieDetails, setMovieDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posterFailed, setPosterFailed] = useState(false);
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();

    useEffect(() => {
        let requestIsCurrent = true;

        //The current flag prevents an older request from replacing a newer movie after navigation.
        async function loadMovieDetails() {
            setLoading(true);
            setError(null);
            setPosterFailed(false);

            try {
                const details = await getMovieDetails(movieId);
                if (requestIsCurrent) setMovieDetails(details);
            }
            catch (err) {
                console.error(err);
                if (requestIsCurrent) setError("Unable to load movie details. Please try again later.");
            }
            finally {
                if (requestIsCurrent) setLoading(false);
            }
        }

        loadMovieDetails();
        return () => { requestIsCurrent = false; };
    }, [movieId]);

    if (loading) {
        return <EmptyState title="Loading movie..." message="Movie details are coming soon." />;
    }

    if (error) {
        return <EmptyState title="An error occurred" message={error} />;
    }

    if (!movieDetails) {
        return <EmptyState title="No movie information found" message="Details are unavailable." />;
    }

    const favorite = isFavorite(movieDetails.id);
    //Optional chaining provides safe fallbacks when TMDB has no trailer, cast, or recommendations.
    const videos = movieDetails.videos?.results ?? [];
    const trailer = videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official)
        ?? videos.find((video) => video.site === "YouTube" && video.type === "Trailer");
    const principalCast = movieDetails.credits?.cast?.slice(0, 8) ?? [];
    const recommendations = movieDetails.recommendations?.results?.slice(0, 8) ?? [];
    const releaseYear = movieDetails.release_date?.split("-")[0];
    const rating = Number.isFinite(movieDetails.vote_average) ? movieDetails.vote_average.toFixed(1) : null;

    function onFavoriteClick() {
        if (favorite) removeFromFavorites(movieDetails.id);
        else addToFavorites(movieDetails);
    }

    return (
        <article className="movie-details-page">
            <section className="details-hero">
                {movieDetails.backdrop_path && (
                    <div className="details-backdrop" aria-hidden="true">
                        <img src={`https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`} alt="" />
                    </div>
                )}

                <div className="details-hero-content">
                    <div className="details-poster-wrap">
                        {movieDetails.poster_path && !posterFailed ? (
                            <img
                                className="details-poster"
                                src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                                alt={`${movieDetails.title} poster`}
                                onError={() => setPosterFailed(true)}
                            />
                        ) : (
                            <div className="details-poster details-poster-fallback">No poster available</div>
                        )}
                    </div>

                    <div className="details-summary">
                        <p className="details-kicker">Movie details</p>
                        <h1>{movieDetails.title}</h1>
                        {movieDetails.tagline && <p className="details-tagline">“{movieDetails.tagline}”</p>}

                        <div className="details-facts" aria-label="Movie facts">
                            {releaseYear && <span>{releaseYear}</span>}
                            {movieDetails.runtime > 0 && <span>{movieDetails.runtime} min</span>}
                            {rating && <span className="details-rating">★ {rating}/10</span>}
                        </div>

                        {movieDetails.genres?.length > 0 && (
                            <ul className="details-genres" aria-label="Genres">
                                {movieDetails.genres.map((genre) => <li key={genre.id}>{genre.name}</li>)}
                            </ul>
                        )}

                        <p className="details-overview">
                            {movieDetails.overview || "No overview is available for this movie."}
                        </p>

                        <button
                            className={`details-favorite-btn ${favorite ? "active" : ""}`}
                            onClick={onFavoriteClick}
                            aria-label={favorite ? `Remove ${movieDetails.title} from favorites` : `Add ${movieDetails.title} to favorites`}
                            aria-pressed={favorite}
                        >
                            <span aria-hidden="true">♥</span>
                            {favorite ? "Remove from favorites" : "Add to favorites"}
                        </button>
                    </div>
                </div>
            </section>

            <div className="details-sections">
                <section className="details-section trailer-section">
                    <div className="details-section-heading">
                        <p>Watch</p>
                        <h2>Official Trailer</h2>
                    </div>
                    {trailer ? (
                        <div className="trailer-frame">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailer.key}`}
                                title={`${movieDetails.title} trailer`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : <p className="section-empty">No trailer is available.</p>}
                </section>

                <section className="details-section cast-section">
                    <div className="details-section-heading">
                        <p>Starring</p>
                        <h2>Principal Cast</h2>
                    </div>
                    {principalCast.length > 0 ? (
                        <div className="cast-grid">
                            {principalCast.map((person) => (
                                <article className="cast-member" key={person.credit_id}>
                                    <Link className="cast-member-link" to={`/people/${person.id}`}>
                                        {person.profile_path ? (
                                            <img src={`https://image.tmdb.org/t/p/w342${person.profile_path}`} alt={`${person.name} profile`} />
                                        ) : (
                                            <div className="cast-image-fallback" aria-label={`No profile image for ${person.name}`}>No image</div>
                                        )}
                                        <div className="cast-member-info">
                                            <h3>{person.name}</h3>
                                            <p>{person.character || "Role unavailable"}</p>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : <p className="section-empty">No cast information is available.</p>}
                </section>

                <section className="details-section recommendations-section">
                    <div className="details-section-heading">
                        <p>Keep exploring</p>
                        <h2>You May Also Like</h2>
                    </div>
                    {recommendations.length > 0 ? (
                        <div className="movies-grid recommendations-grid">
                            {recommendations.map((movie) => <MovieCard movie={movie} key={movie.id} />)}
                        </div>
                    ) : <p className="section-empty">No recommendations are available.</p>}
                </section>
            </div>
        </article>
    );
}

export default MovieDetails;