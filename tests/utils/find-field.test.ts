import { beforeEach, describe, expect, it } from "vitest";
import { findField } from "../../src/utils/find-field.js";
import type { FieldDescriptor } from "../../src/utils/messages.js";

const descriptor = (overrides: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
    type: "text",
    class: "",
    name: "",
    placeholder: "",
    id: "",
    ...overrides
});

describe("findField", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("finds an input by its id", () => {
        document.body.innerHTML = `<input id="username">`;
        const field = document.querySelector("input")!;

        expect(findField(descriptor({ id: "username" }))).toBe(field);
    });

    it("finds an input by its name", () => {
        document.body.innerHTML = `<input name="email">`;
        const field = document.querySelector("input")!;

        expect(findField(descriptor({ name: "email" }))).toBe(field);
    });

    it("prefers the id when both id and name are provided", () => {
        document.body.innerHTML = `
            <input id="first" name="email">
            <input id="second" name="email">
        `;

        expect(findField(descriptor({ id: "second", name: "email" }))?.id)
            .toBe("second");
    });

    it("returns undefined when no field matches", () => {
        expect(findField(descriptor({ id: "missing", name: "missing" })))
            .toBeUndefined();
    });

    it("does not return a non-input element found by id", () => {
        document.body.innerHTML = `<div id="username"></div>`;

        expect(findField(descriptor({ id: "username" }))).toBeUndefined();
    });
});
