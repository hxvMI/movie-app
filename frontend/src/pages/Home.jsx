import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieGridSkeleton from "../components/MovieGridSkeleton";
import MovieCard from "../components/MovieCard";
import "../css/Home.css";
import { getPopularMovies, getTrendingMovies, getUpcomingMovies } from "../services/api";

/*
Program Flow — Home
1. The page loads Trending, Popular, and Upcoming collections from TMDB in parallel.
2. Each response is stored in section state and rendered as a horizontal MovieCard row.
3. The hero form sends the entered title to Discover through a shareable query-string URL.
4. Collection links also open Discover with the matching category already selected.
*/

function MovieRow({ title, eyebrow, movies, link }) {
    //MovieRow keeps all landing collections visually and structurally consistent.
    return (
        <section className="landing-row-section">
            <div className="landing-row-heading">
                <div><p>{eyebrow}</p><h2>{title}</h2></div>
                <Link to={link}>View all <span aria-hidden="true">→</span></Link>
            </div>
            <div className="landing-movie-row">
                {movies.map((movie) => <MovieCard movie={movie} key={movie.id} />)}
            </div>
        </section>
    );
}

function Home() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [sections, setSections] = useState({ trending: [], popular: [], upcoming: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isCurrent = true;
        //Load all three landing-page collections together so the sections appear at the same time.
        async function loadHomeCollections() {
            try {
                const [trending, popular, upcoming] = await Promise.all([
                    getTrendingMovies(), getPopularMovies(), getUpcomingMovies(),
                ]);
                if (isCurrent) setSections({
                    trending: trending.slice(0, 12),
                    popular: popular.movies.slice(0, 12),
                    upcoming: upcoming.movies.slice(0, 12),
                });
            } catch (err) {
                console.error(err);
                if (isCurrent) setError("We couldn't load movie collections right now.");
            } finally {
                if (isCurrent) setLoading(false);
            }
        }
        loadHomeCollections();
        return () => { isCurrent = false; };
    }, []);

    function handleSubmit(event) {
        event.preventDefault();
        const search = query.trim();
        //Search belongs to Discover; encoding keeps spaces and punctuation safe in the URL.
        if (search) navigate(`/discover?query=${encodeURIComponent(search)}&page=1`);
    }

    return (
        <div className="landing-page">
            <section className="landing-hero">
                <div className="landing-hero-glow" aria-hidden="true" />
                <div className="landing-hero-content">
                    <p className="landing-eyebrow">Your next favorite movie is waiting</p>
                    <h1>Find a story worth watching.</h1>
                    <p className="landing-intro">Search thousands of films, explore what is trending, and keep the ones you love close.</p>
                    <form className="landing-search" onSubmit={handleSubmit} role="search">
                        <label className="sr-only" htmlFor="landing-search-input">Search movies</label>
                        <input id="landing-search-input" value={query} onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by movie title..." />
                        <button type="submit">Search movies</button>
                    </form>
                    <div className="landing-hero-actions">
                        <Link to="/discover?category=popular&page=1">Browse Discover</Link>
                        <Link to="/favorites">View Favorites</Link>
                    </div>
                </div>
            </section>

            <div className="landing-sections">
                {error && <div className="error-message" role="alert">{error}</div>}
                {loading ? <MovieGridSkeleton count={6} /> : (
                    <>
                        <MovieRow title="Trending this week" eyebrow="In the conversation" movies={sections.trending} link="/discover?category=popular&page=1" />
                        <MovieRow title="Popular right now" eyebrow="Audience favorites" movies={sections.popular} link="/discover?category=popular&page=1" />
                        <MovieRow title="Coming soon" eyebrow="Save the date" movies={sections.upcoming} link="/discover?category=upcoming&page=1" />
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
