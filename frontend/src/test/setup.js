import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Reset the rendered DOM and browser storage so each test starts independently.
afterEach(() => {
    cleanup();
    localStorage.clear();
});
