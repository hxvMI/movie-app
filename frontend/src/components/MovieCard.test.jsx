import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MovieProvider } from "../context/MovieContext";
import MovieCard from "./MovieCard";

const movie = {
    id: 550,
    title: "Fight Club",
    release_date: "1999-10-15",
    poster_path: "/poster.jpg",
};

function renderMovieCard() {
    return render(
        <MemoryRouter>
            <MovieProvider><MovieCard movie={movie} /></MovieProvider>
        </MemoryRouter>,
    );
}

describe("MovieCard", () => {
    it("links to the movie details page and displays its release year", () => {
        renderMovieCard();

        expect(screen.getByRole("link", { name: movie.title })).toHaveAttribute("href", "/movies/550");
        expect(screen.getByText("1999")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: `${movie.title} poster` })).toHaveAttribute(
            "src",
            `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        );
    });

    it("toggles its accessible favorite state", async () => {
        const user = userEvent.setup();
        renderMovieCard();

        const addButton = screen.getByRole("button", { name: `Add ${movie.title} to favorites` });
        expect(addButton).toHaveAttribute("aria-pressed", "false");

        await user.click(addButton);
        const removeButton = screen.getByRole("button", { name: `Remove ${movie.title} from favorites` });
        expect(removeButton).toHaveAttribute("aria-pressed", "true");
        expect(removeButton).toHaveClass("active");
    });
});
