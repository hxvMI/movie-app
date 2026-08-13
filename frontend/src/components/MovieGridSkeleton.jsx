import "../css/FeedbackStates.css";

//Render placeholder cards while a movie collection is being requested.
function MovieGridSkeleton({ count = 8 }) {
    return (
        <div className="movies-grid" aria-label="Loading movies" aria-busy="true">
            {Array.from({ length: count }, (_, index) => (
                <div className="movie-skeleton" key={index} aria-hidden="true">
                    <div className="movie-skeleton-poster" />
                    <div className="movie-skeleton-line movie-skeleton-title" />
                    <div className="movie-skeleton-line movie-skeleton-year" />
                </div>
            ))}
        </div>
    );
}

export default MovieGridSkeleton;
