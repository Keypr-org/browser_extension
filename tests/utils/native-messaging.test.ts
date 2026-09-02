import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/utils/native-port.js", () => ({
    sendNativeRequest: vi.fn()
}));

import { getEntries, getPassword } from "../../src/utils/native-messaging.js";
import { sendNativeRequest } from "../../src/utils/native-port.js";

describe("native messaging helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getEntries sends the expected request and resolves entries", async () => {
        vi.mocked(sendNativeRequest).mockResolvedValue({
            type: "ENTRIES",
            entries: [
                { id: "42", username: "alice" },
                { id: "43", username: "bob" }
            ]
        });

        await expect(getEntries("https://example.com/login")).resolves.toEqual([
            { id: "42", username: "alice" },
            { id: "43", username: "bob" }
        ]);

        expect(sendNativeRequest).toHaveBeenCalledWith({
            type: "GET_ENTRIES",
            url: "https://example.com/login"
        });
    });

    it("getEntries returns undefined on the wrong response type", async () => {
        vi.mocked(sendNativeRequest).mockResolvedValue({
            type: "PASSWORD",
            password: "secret"
        });

        await expect(getEntries("https://example.com/login")).resolves.toBeUndefined();
    });

    it("getPassword sends the expected request and resolves the password", async () => {
        vi.mocked(sendNativeRequest).mockResolvedValue({
            type: "PASSWORD",
            password: "s3cr3t"
        });

        await expect(getPassword("42")).resolves.toBe("s3cr3t");

        expect(sendNativeRequest).toHaveBeenCalledWith({
            type: "GET_PASSWORD",
            id: "42"
        });
    });

    it("getPassword returns undefined on the wrong response type", async () => {
        vi.mocked(sendNativeRequest).mockResolvedValue({
            type: "ENTRIES",
            entries: []
        });

        await expect(getPassword("42")).resolves.toBeUndefined();
    });
});
