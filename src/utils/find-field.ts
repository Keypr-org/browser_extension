import type { FieldDescriptor } from "./messages.js";

export function findField(descriptor: FieldDescriptor): HTMLInputElement | undefined {
    if (descriptor.id) {
        const field = document.getElementById(descriptor.id);

        if (field instanceof HTMLInputElement) {
            return field;
        }
    }

    if (descriptor.name) {
        return Array.from(
            document.querySelectorAll<HTMLInputElement>("input[name]")
        ).find((field) => field.name === descriptor.name);
    }

    return undefined;
}