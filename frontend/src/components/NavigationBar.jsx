import { NavLink } from "react-router-dom";
import { useMovieContext } from "../context/MovieContext";
import "../css/NavigationBar.css";

//The favorites badge reads from context so it updates immediately on every page.
function NavigationBar() {
    const { favorites } = useMovieContext();
    return (
        <nav className="navbar" aria-label="Primary navigation">
            <NavLink to="/" className="navbar-brand" aria-label="Movie App home">
                <span className="brand-mark" aria-hidden="true">M</span><span>Movie App</span>
            </NavLink>
            <div className="navbar-links">
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/discover">Discover</NavLink>
                <NavLink to="/favorites" className="favorites-nav-link">
                    Favorites <span className="favorites-count" aria-label={`${favorites.length} favorites`}>{favorites.length}</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default NavigationBar;
