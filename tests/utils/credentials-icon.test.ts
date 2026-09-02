import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMessageMock = vi.fn();
const getURLMock = vi.fn((path: string) => path);
const addListenerMock = vi.fn();

vi.stubGlobal("chrome", {
    runtime: {
        onMessage: { addListener: addListenerMock },
        getURL: getURLMock,
        sendMessage: sendMessageMock
    }
});

import { addCredentialIcon, displayEntries } from "../../src/utils/credentials-icon.js";

describe("credentials icon behavior", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        sendMessageMock.mockClear();
        getURLMock.mockClear();
        addListenerMock.mockClear();
    });

    it("adds a credential icon to a detected username field", () => {
        document.body.innerHTML = `
            <input id="username" type="text" autocomplete="username" />
        `;

        addCredentialIcon({
            type: "LOGIN_FIELDS_DETECTED",
            fields: {
                username: {
                    type: "text",
                    class: "",
                    name: "username",
                    placeholder: "",
                    id: "username",
                    autocomplete: "username"
                }
            }
        });

        const icon = document.querySelector("button.keypr-credential-icon-username");
        expect(icon).not.toBeNull();
        expect(icon?.querySelector("img")?.getAttribute("src")).toBe("img/icons/icon24.png");
    });

    it("does not add a second icon to the same field", () => {
        document.body.innerHTML = `
            <input id="username" type="text" autocomplete="username" />
        `;

        addCredentialIcon({
            type: "LOGIN_FIELDS_DETECTED",
            fields: {
                username: {
                    type: "text",
                    class: "",
                    name: "username",
                    placeholder: "",
                    id: "username",
                    autocomplete: "username"
                }
            }
        });

        addCredentialIcon({
            type: "LOGIN_FIELDS_DETECTED",
            fields: {
                username: {
                    type: "text",
                    class: "",
                    name: "username",
                    placeholder: "",
                    id: "username",
                    autocomplete: "username"
                }
            }
        });

        expect(document.querySelectorAll("button.keypr-credential-icon-username")).toHaveLength(1);
    });

    it("creates the overlay and displays available credentials", async () => {
        await displayEntries([
            { id: "1", url: "https://example.com/login", username: "alice" },
            { id: "2", url: "https://example.com/login", username: "bob" }
        ]);

        const overlay = document.getElementById("keypr-credentials-overlay");
        expect(overlay).not.toBeNull();
        expect(overlay?.textContent).toContain("alice");
        expect(overlay?.textContent).toContain("bob");
    });
});
