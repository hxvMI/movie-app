import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { MovieProvider, useMovieContext } from "./MovieContext";

const testMovie = { id: 12, title: "Test Movie", vote_average: 8.2 };

// This small consumer exercises the public context API the same way app components do.
function FavoritesHarness() {
    const { favorites, addToFavorites, removeFromFavorites, clearFavorites } = useMovieContext();

    return (
        <div>
            <output aria-label="favorite count">{favorites.length}</output>
            <button onClick={() => addToFavorites(testMovie)}>Add</button>
            <button onClick={() => removeFromFavorites(testMovie.id)}>Remove</button>
            <button onClick={clearFavorites}>Clear</button>
        </div>
    );
}

describe("MovieProvider", () => {
    beforeEach(() => localStorage.clear());

    it("restores favorites saved in localStorage", () => {
        localStorage.setItem("favorites", JSON.stringify([testMovie]));
        render(<MovieProvider><FavoritesHarness /></MovieProvider>);

        expect(screen.getByLabelText("favorite count")).toHaveTextContent("1");
    });

    it("adds, removes, and persists a favorite", async () => {
        const user = userEvent.setup();
        render(<MovieProvider><FavoritesHarness /></MovieProvider>);

        await user.click(screen.getByRole("button", { name: "Add" }));
        expect(screen.getByLabelText("favorite count")).toHaveTextContent("1");
        expect(JSON.parse(localStorage.getItem("favorites"))).toEqual([testMovie]);

        await user.click(screen.getByRole("button", { name: "Remove" }));
        expect(screen.getByLabelText("favorite count")).toHaveTextContent("0");
    });

    it("does not add the same movie twice", async () => {
        const user = userEvent.setup();
        render(<MovieProvider><FavoritesHarness /></MovieProvider>);

        await user.click(screen.getByRole("button", { name: "Add" }));
        await user.click(screen.getByRole("button", { name: "Add" }));

        expect(screen.getByLabelText("favorite count")).toHaveTextContent("1");
    });
});
