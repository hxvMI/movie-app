import { Route, Routes } from "react-router-dom";
import "./css/App.css";
import NavigationBar from "./components/NavigationBar";
import Discover from "./pages/Discover";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import NotFound from "./pages/NotFound";
import PersonDetails from "./pages/PersonDetails";

function App() {
    return (
        <>
            <NavigationBar />
            <main className="main-content">
                {/*Routes connect each URL pattern to the page component it should display.*/}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/movies/:movieId" element={<MovieDetails />} />
                    <Route path="/people/:personId" element={<PersonDetails />} />
                    {/*The wildcard route catches every URL that did not match above.*/}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </>
    );
}

export default App;
