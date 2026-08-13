import { Link } from "react-router-dom";
import "../css/NotFound.css";

/*
Program Flow — Not Found
1. App's wildcard route renders this page when no earlier route matches the URL.
2. The page explains that the requested location is unavailable.
3. Navigation links let the user recover by returning Home or opening Discover.
*/

function NotFound() {
    return (
        <section className="not-found" aria-labelledby="not-found-title">
            <div className="not-found-glow" aria-hidden="true" />
            <div className="not-found-content">
                <p className="not-found-code">404</p>
                <p className="not-found-kicker">Scene not found</p>
                <h1 id="not-found-title">This page missed the final cut.</h1>
                <p className="not-found-message">
                    The page may have moved, the address may be incorrect, or this story has not been released yet.
                </p>
                <div className="not-found-actions">
                    <Link className="not-found-primary" to="/">Back to Home</Link>
                    <Link className="not-found-secondary" to="/discover?sort=popularity.desc&page=1">
                        Discover Movies
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default NotFound;
