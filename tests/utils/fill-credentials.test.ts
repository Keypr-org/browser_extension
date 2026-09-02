import { beforeEach, describe, expect, it, vi } from "vitest";
import { fillCredentials } from "../../src/utils/fill-credentials.js";
import type { FieldDescriptor } from "../../src/utils/messages.js";

const descriptor = (overrides: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
    type: "text",
    class: "",
    name: "",
    placeholder: "",
    id: "",
    ...overrides
});

describe("fillCredentials", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="username">
            <input id="password" type="password">
        `;
    });

    it("fills the username and password fields", () => {
        fillCredentials({
            type: "FILL_CREDENTIALS",
            username: "alice",
            password: "secret",
            usernameField: descriptor({ id: "username" }),
            passwordField: descriptor({ id: "password", type: "password" })
        });

        expect(document.querySelector<HTMLInputElement>("#username")?.value)
            .toBe("alice");
        expect(document.querySelector<HTMLInputElement>("#password")?.value)
            .toBe("secret");
    });

    it("dispatches input and change events for both fields", () => {
        const username = document.querySelector<HTMLInputElement>("#username")!;
        const password = document.querySelector<HTMLInputElement>("#password")!;
        const usernameInput = vi.fn();
        const usernameChange = vi.fn();
        const passwordInput = vi.fn();
        const passwordChange = vi.fn();

        username.addEventListener("input", usernameInput);
        username.addEventListener("change", usernameChange);
        password.addEventListener("input", passwordInput);
        password.addEventListener("change", passwordChange);

        fillCredentials({
            type: "FILL_CREDENTIALS",
            username: "alice",
            password: "secret",
            usernameField: descriptor({ id: "username" }),
            passwordField: descriptor({ id: "password", type: "password" })
        });

        expect(usernameInput).toHaveBeenCalledOnce();
        expect(usernameChange).toHaveBeenCalledOnce();
        expect(passwordInput).toHaveBeenCalledOnce();
        expect(passwordChange).toHaveBeenCalledOnce();
    });

    it("ignores missing values and missing fields", () => {
        expect(() => fillCredentials({
            type: "FILL_CREDENTIALS",
            usernameField: descriptor({ id: "missing" }),
            passwordField: descriptor({ id: "password" })
        })).not.toThrow();

        expect(document.querySelector<HTMLInputElement>("#password")?.value)
            .toBe("");
    });
});
