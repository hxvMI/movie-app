import "../css/Favorites.css"
import { useMovieContext } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";
import EmptyState from "../components/EmptyState";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/*
Program Flow — Favorites
1. Favorite movies are read from MovieContext, which restores them from localStorage.
2. The selected sort option creates a sorted copy without changing the saved insertion order.
3. Each MovieCard can remove its movie through the shared favorite control.
4. Clear All requests confirmation before removing the complete collection.
5. An empty collection displays a recovery link back to Discover.
*/

function Favorites() {
    const { favorites, clearFavorites } = useMovieContext();
    const [sortBy, setSortBy] = useState("added");

    //Sort a copy so the original context array keeps its saved insertion order.
    const sortedFavorites = useMemo(() => {
        const movies = [...favorites];
        if (sortBy === "title") return movies.sort((a, b) => a.title.localeCompare(b.title));
        if (sortBy === "date") return movies.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
        if (sortBy === "rating") return movies.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
        return movies;
    }, [favorites, sortBy]);

    function confirmClear() {
        //Clearing the complete collection is destructive, so require explicit confirmation.
        if (window.confirm("Remove every movie from your favorites? This cannot be undone.")) clearFavorites();
    }

    if (favorites.length > 0){
        return (
            <section className="favorites-page">
                <header className="favorites-header">
                    <div><p>Your personal collection</p><h1>Favorite Movies</h1><span>{favorites.length} saved {favorites.length === 1 ? "movie" : "movies"}</span></div>
                    <div className="favorites-controls">
                        <label><span>Sort favorites</span>
                            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                                <option value="added">Recently added</option>
                                <option value="title">Title A–Z</option>
                                <option value="date">Newest release</option>
                                <option value="rating">Highest rated</option>
                            </select>
                        </label>
                        <button type="button" className="clear-favorites" onClick={confirmClear}>Clear all</button>
                    </div>
                </header>
            <div className="movies-grid favorites-grid">
                {/* Whenever doing .map() dynamically you need to add a KEY property so react can distinguish different components we are rendering */}
                {sortedFavorites.map((currMovie) => (<MovieCard movie={currMovie} key={currMovie.id} />))}
              </div>
              </section>
        );
    }

    return(
        <div className="favorites-empty-page">
            <EmptyState title="No Favorite Movies Yet" message="Start adding movies to your favorites and they will appear here." />
            <Link to="/discover?category=popular&page=1">Discover movies</Link>
        </div>
    );
}

export default Favorites
