import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFound from "./NotFound";

describe("NotFound", () => {
    it("offers clear routes back into the application", () => {
        render(<MemoryRouter><NotFound /></MemoryRouter>);

        expect(screen.getByRole("heading", { name: "This page missed the final cut." })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Discover Movies" })).toHaveAttribute(
            "href",
            "/discover?sort=popularity.desc&page=1",
        );
    });
});
