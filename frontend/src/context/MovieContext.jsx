import { createContext, useContext, useEffect, useState } from "react";

const MovieContext = createContext();

//This custom Hook gives components a shorter way to read the shared movie context.
// eslint-disable-next-line react-refresh/only-export-components
export const useMovieContext = () => useContext(MovieContext);

//The Provider shares favorite state with every page wrapped inside it.
export const MovieProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        //LocalStorage only stores strings, so saved movie objects must be parsed from JSON.
        const storedFavorites = localStorage.getItem("favorites");
        if (!storedFavorites) return [];

        //Invalid saved data is removed instead of allowing it to crash the application.
        try {
            const parsedFavorites = JSON.parse(storedFavorites);
            return Array.isArray(parsedFavorites) ? parsedFavorites : [];
        } catch {
            localStorage.removeItem("favorites");
            return [];
        }
    });

    //Save a fresh JSON copy every time the favorites array changes.
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (movie) => {
        //The previous-state callback prevents rapid updates from overwriting each other.
        setFavorites((previous) => previous.some((favorite) => favorite.id === movie.id)
            ? previous
            : [...previous, movie]);
    };

    const removeFromFavorites = (movieId) => {
        setFavorites((previous) => previous.filter((movie) => movie.id !== movieId));
    };

    const clearFavorites = () => setFavorites([]);
    const isFavorite = (movieId) => favorites.some((movie) => movie.id === movieId);

    //Only properties included here can be accessed through useMovieContext().
    const contextValue = { favorites, addToFavorites, removeFromFavorites, clearFavorites, isFavorite };

    return <MovieContext.Provider value={contextValue}>{children}</MovieContext.Provider>;
};
