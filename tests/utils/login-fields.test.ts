import { beforeEach, describe, expect, it, vi } from "vitest";
import { findLoginFields, createMessageLoginField } from "../../src/utils/login-fields.js";

describe("findLoginFields", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("detects a standard email/password form", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="email"
                    name="email"
                >

                <input
                    type="password"
                    name="password"
                >
            </form>
        `;

        const fields = findLoginFields();

        expect(fields.username).toBeDefined();
        expect(fields.password).toBeDefined();

        expect(fields.username?.name).toBe("email");
        expect(fields.password?.name).toBe("password");
    });

    it("prefers autocomplete=username", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="text"
                    name="random"
                >
    
                <input
                    type="text"
                    autocomplete="username"
                >
    
                <input
                    type="password"
                    autocomplete="current-password"
                >
            </form>
        `;
    
        const fields = findLoginFields();

        expect(fields.username).toBeDefined();
        expect(fields.password).toBeDefined();
    
        expect(fields.username?.getAttribute("autocomplete"))
            .toBe("username");
    
        expect(fields.password?.getAttribute("autocomplete"))
            .toBe("current-password");
    });

    it("detects a username field", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="text"
                    name="username"
                >
    
                <input
                    type="password"
                >
            </form>
        `;
    
        const fields = findLoginFields();

        expect(fields.username).toBeDefined();
        expect(fields.password).toBeDefined();
    
        expect(fields.username?.name).toBe("username");
    });

    it("detects a username field using its id", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="text"
                    id="login-username"
                >
    
                <input
                    type="password"
                >
            </form>
        `;
    
        const fields = findLoginFields();
    
        expect(fields.username).toBeDefined();
        expect(fields.password).toBeDefined();

        expect(fields.username?.id).toBe("login-username");
    });

    it("does not select an unrelated text field", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="text"
                    name="search"
                    placeholder="Search"
                >
            </form>
        `;
    
        const fields = findLoginFields();
    
        expect(fields.username).toBeUndefined();
        expect(fields.password).toBeUndefined();
    });

    it("does not select disabled fields", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="email"
                    name="email"
                    disabled
                >
    
                <input
                    type="password"
                    disabled
                >
            </form>
        `;
    
        const fields = findLoginFields();
    
        expect(fields.username).toBeUndefined();
        expect(fields.password).toBeUndefined();
    });

    it("does not select readonly fields", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="email"
                    name="email"
                    readonly
                >
    
                <input
                    type="password"
                    readonly
                >
            </form>
        `;
    
        const fields = findLoginFields();
    
        expect(fields.username).toBeUndefined();
        expect(fields.password).toBeUndefined();
    });

    it("chooses the strongest username candidate", () => {
        document.body.innerHTML = `
            <form>
                <input
                    type="text"
                    name="search"
                >
    
                <input
                    type="text"
                    name="username"
                >
    
                <input
                    type="email"
                    autocomplete="username"
                >
    
                <input
                    type="password"
                >
            </form>
        `;
    
        const fields = findLoginFields();
    
        expect(fields.username?.autocomplete)
            .toBe("username");
    });

    it("does not detect credentials inside an iframe", () => {
        const iframe = document.createElement("iframe");
    
        document.body.appendChild(iframe);
    
        const iframeDocument = iframe.contentDocument;
    
        expect(iframeDocument).not.toBeNull();
    
        iframeDocument!.body.innerHTML = `
            <form>
                <input type="email" name="email">
                <input type="password" name="password">
            </form>
        `;
    
        const fields = findLoginFields();
    
        expect(fields.username).toBeUndefined();
        expect(fields.password).toBeUndefined();
    });

    it("detects credentials inside an iframe", () => {
        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe);

        const iframeDocument = iframe.contentDocument;
        expect(iframeDocument).not.toBeNull();

        iframeDocument!.body.innerHTML = `
            <input type="email" name="email">
            <input type="password" name="password">
        `;

        vi.stubGlobal("document", iframeDocument);

        const fields = findLoginFields();

        expect(fields.username).toBeDefined();
        expect(fields.password).toBeDefined();

        vi.unstubAllGlobals();
    });
    
    it("creates a message containing field descriptors", () => {
        document.body.innerHTML = `
            <input
                type="email"
                class="username-input"
                name="email"
                placeholder="Email"
                id="email"
                autocomplete="username"
            >
            <input
                type="password"
                class="password-input"
                name="password"
                placeholder="Password"
                id="password"
                autocomplete="current-password"
            >
        `;
    
        expect(createMessageLoginField()).toEqual({
            type: "LOGIN_FIELDS_DETECTED",
            fields: {
                username: {
                    type: "email",
                    class: "username-input",
                    name: "email",
                    placeholder: "Email",
                    id: "email",
                    autocomplete: "username"
                },
                password: {
                    type: "password",
                    class: "password-input",
                    name: "password",
                    placeholder: "Password",
                    id: "password",
                    autocomplete: "current-password"
                }
            }
        });
    });
});