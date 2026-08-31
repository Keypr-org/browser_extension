import { vi } from "vitest";

vi.stubGlobal("chrome", {
    runtime: {
        onMessage: {
            addListener: vi.fn()
        },
        getURL: vi.fn((path: string) => path),
        sendMessage: vi.fn()
    }
});