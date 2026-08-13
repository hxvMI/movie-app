import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MovieGridSkeleton from "../components/MovieGridSkeleton";
import MovieCard from "../components/MovieCard";
import "../css/Discover.css";
import {
    discoverMovies,
    getMovieGenres,
    getNowPlayingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies,
} from "../services/api";

/*
Program Flow — Discover
1. URL parameters are parsed into category, search, filter, sort, and pagination state.
2. The matching TMDB endpoint runs whenever those URL parameters change.
3. Form controls keep draft filter values locally until the user applies them.
4. Applying a category, search, filter, or page change updates the URL and triggers a reload.
5. Results, total count, loading/error states, and pagination controls are rendered from the response.
*/

const DEFAULT_FILTERS = {
    genreIds: [],
    releaseYear: "",
    minimumRating: "0",
    sortBy: "popularity.desc",
};

const CATEGORY_LOADERS = {
    popular: getPopularMovies,
    "top-rated": getTopRatedMovies,
    "now-playing": getNowPlayingMovies,
    upcoming: getUpcomingMovies,
};

function parsePage(value) {
    //URL values are strings, so convert and validate the page before sending it to TMDB.
    const page = Number.parseInt(value ?? "1", 10);
    return Number.isInteger(page) && page > 0 ? page : 1;
}

function readUrlState(searchParams) {
    //The URL is the applied view's source of truth, making filtered pages refreshable and shareable.
    const query = searchParams.get("query")?.trim() ?? "";
    const requestedCategory = searchParams.get("category");
    const category = CATEGORY_LOADERS[requestedCategory] ? requestedCategory : "";
    const genreIds = (searchParams.get("genres") ?? "")
        .split("|")
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);
    const filters = {
        genreIds,
        releaseYear: searchParams.get("year") ?? "",
        minimumRating: searchParams.get("rating") ?? "0",
        sortBy: searchParams.get("sort") ?? DEFAULT_FILTERS.sortBy,
    };
    const hasFilters = genreIds.length > 0 || filters.releaseYear || filters.minimumRating !== "0"
        || searchParams.has("sort");

    return {
        query,
        category: query || hasFilters ? "" : (category || "popular"),
        filters,
        page: parsePage(searchParams.get("page")),
    };
}

function Discover() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("popular");
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const currentPage = parsePage(searchParams.get("page"));


    useEffect(() => {
        let isCurrent = true;

        async function loadGenres() {
            try {
                const movieGenres = await getMovieGenres();
                if (isCurrent) setGenres(movieGenres);
            } catch (err) {
                console.error("Unable to load genres:", err);
            }
        }

        loadGenres();
        return () => { isCurrent = false; };
    }, []);

    useEffect(() => {
        let isCurrent = true;
        const urlState = readUrlState(searchParams);

        //Every URL change reloads the matching category, search, or Discover request.
        async function loadUrlView() {
            setSearchQuery(urlState.query);
            setActiveCategory(urlState.category);
            setFilters(urlState.filters);
            setLoading(true);
            setError(null);

            try {
                let result;
                if (urlState.query) {
                    result = await searchMovies(urlState.query, urlState.page);
                } else if (urlState.category) {
                    result = await CATEGORY_LOADERS[urlState.category](urlState.page);
                } else {
                    result = await discoverMovies({ ...urlState.filters, page: urlState.page });
                }

                if (isCurrent) {
                    setMovies(result.movies);
                    setTotalPages(result.totalPages);
                    setTotalResults(result.totalResults ?? result.movies.length);
                }
            } catch (err) {
                console.error(err);
                if (isCurrent) setError("We couldn't load these movies right now. Please try again later.");
            } finally {
                if (isCurrent) setLoading(false);
            }
        }

        loadUrlView();
        return () => { isCurrent = false; };
    }, [searchParams]);

    function navigateToCategory(event) {
        setLoading(true);
        setSearchParams({ category: event.currentTarget.value, page: "1" });
    }

    function handleGenreChange(event) {
        const genreId = Number(event.target.value);
        const checked = event.target.checked;
        setFilters((previous) => ({
            ...previous,
            genreIds: checked
                ? [...previous.genreIds, genreId]
                : previous.genreIds.filter((id) => id !== genreId),
        }));
    }

    function handleFilterChange(event) {
        const { name, value } = event.target;
        setFilters((previous) => ({ ...previous, [name]: value }));
    }

    function handleFilterSubmit(event) {
        event.preventDefault();
        if (loading) return;

        //Applying new filters resets pagination because the new result set begins on page one.
        const nextParams = new URLSearchParams({ page: "1", sort: filters.sortBy });
        if (filters.genreIds.length) nextParams.set("genres", filters.genreIds.join("|"));
        if (filters.releaseYear) nextParams.set("year", filters.releaseYear);
        if (Number(filters.minimumRating) > 0) nextParams.set("rating", filters.minimumRating);
        setLoading(true);
        setSearchParams(nextParams);
    }

    function handleSearch(event) {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query || loading) return;

        setLoading(true);
        setSearchParams({ query, page: "1" });
    }

    function resetFilters() {
        setLoading(true);
        setSearchParams({ category: "popular", page: "1" });
    }

    function clearSearch() {
        setLoading(true);
        setSearchParams({ category: "popular", page: "1" });
    }

    const categories = [
        ["popular", "Popular"], ["top-rated", "Top Rated"],
        ["now-playing", "Now Playing"], ["upcoming", "Upcoming"],
    ];

    
    function goToPage(nextPage) {
        if (
            nextPage < 1 ||
            nextPage > totalPages ||
            nextPage === currentPage ||
            loading
        ) {
            return;
        }

        //Copy the existing parameters so changing pages preserves search and filter state.
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(nextPage));

        setLoading(true);
        setSearchParams(nextParams);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <div className="home discover-page">
            <header className="discover-header">
                <p>Explore the catalog</p>
                <h1>Discover Movies</h1>
                <span>Browse curated categories or build your own search with detailed filters.</span>
            </header>
            <div className="category-tabs" role="group" aria-label="Movie categories">
                {categories.map(([value, label]) => (
                    <button type="button" key={value} value={value} onClick={navigateToCategory}
                        className={activeCategory === value ? "active" : ""}
                        aria-pressed={activeCategory === value} disabled={loading}>{label}</button>
                ))}
            </div>

            <form className="filter-form" onSubmit={handleFilterSubmit}>
                <div className="filter-heading">
                    <div><span>Refine results</span><h2>Discover movies</h2></div>
                    <button type="button" className="filter-reset" onClick={resetFilters} disabled={loading}>Reset</button>
                </div>
                <fieldset className="genre-filters">
                    <legend>Genres</legend>
                    <div className="genre-options">
                        {genres.map((genre) => (
                            <label key={genre.id}>
                                <input type="checkbox" value={genre.id}
                                    checked={filters.genreIds.includes(genre.id)} onChange={handleGenreChange} />
                                <span>{genre.name}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <div className="filter-fields">
                    <label><span>Release year</span>
                        <input type="number" name="releaseYear" min="1900"
                            max={new Date().getFullYear() + 5} value={filters.releaseYear}
                            onChange={handleFilterChange} placeholder="Any year" />
                    </label>
                    <label><span>Minimum rating</span>
                        <select name="minimumRating" value={filters.minimumRating} onChange={handleFilterChange}>
                            <option value="0">Any rating</option><option value="5">5+</option>
                            <option value="6">6+</option><option value="7">7+</option>
                            <option value="8">8+</option><option value="9">9+</option>
                        </select>
                    </label>
                    <label><span>Sort by</span>
                        <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="popularity.desc">Most popular</option>
                            <option value="popularity.asc">Least popular</option>
                            <option value="vote_average.desc">Highest rated</option>
                            <option value="vote_average.asc">Lowest rated</option>
                            <option value="primary_release_date.desc">Newest first</option>
                            <option value="primary_release_date.asc">Oldest first</option>
                            <option value="revenue.desc">Highest revenue</option>
                        </select>
                    </label>
                    <button type="submit" className="filter-submit" disabled={loading}>Apply filters</button>
                </div>
            </form>

            <form onSubmit={handleSearch} className="search-form">
                <input type="text" placeholder="Search for movies..." className="search-input"
                    value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search for movies" />
                <button type="submit" className="search-button" disabled={loading}>Search</button>
            </form>

            {error && <div className="error-message" role="alert">{error}</div>}
            {!loading && searchQuery.trim() && (
                <div className="search-results-heading">
                    <div>
                        <p>Search results for</p>
                        <h2>“{searchQuery.trim()}”</h2>
                        <span>{totalResults.toLocaleString()} {totalResults === 1 ? "result" : "results"}</span>
                    </div>
                    <button type="button" onClick={clearSearch}>Clear search</button>
                </div>
            )}
            {loading ? <MovieGridSkeleton /> : movies.length === 0 ? (
                <EmptyState title="No movies found"
                    message={searchQuery.trim() ? `No results matched "${searchQuery.trim()}".` : "Try changing or resetting your filters."} />
            ) : (
                <div className="movies-grid">
                    {movies.map((movie) => <MovieCard movie={movie} key={movie.id} />)}
                </div>
            )}

            <nav className="pagination" aria-label="Movie result pages">
            <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={loading || currentPage === 1}
            >
                Previous
            </button>

            <span>
                Page {currentPage} of {totalPages}
            </span>

            <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={loading || totalPages === 0 || currentPage >= totalPages}
            >
                Next
            </button>
            </nav>
        </div>
    );
}


export default Discover;
