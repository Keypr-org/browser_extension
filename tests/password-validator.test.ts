import { describe, expect, it } from "vitest";
import { isStrongPassword } from "../src/utils/password-validator";

describe("isStrongPassword", () => {
    it("accepte un mot de passe suffisamment complexe", () => {
        expect(isStrongPassword("Password1234")).toBe(true);
    });

    it("refuse un mot de passe trop court", () => {
        expect(isStrongPassword("Pass123")).toBe(false);
    });

    it("refuse un mot de passe sans majuscule", () => {
        expect(isStrongPassword("password1234")).toBe(false);
    });
});