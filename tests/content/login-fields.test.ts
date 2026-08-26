import { beforeEach, describe, expect, it } from "vitest";
import { findLoginFields } from "../../src/content/login-fields.js"

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
});