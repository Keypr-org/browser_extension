import type { FieldDescriptor } from "./messages.js";

export function findField(descriptor: FieldDescriptor): HTMLInputElement | undefined {
    if (descriptor.id) {
        const field = document.getElementById(descriptor.id);

        if (field instanceof HTMLInputElement) {
            return field;
        }
    }

    if (descriptor.name) {
        const field = document.querySelector<HTMLInputElement>(
            `input[name="${CSS.escape(descriptor.name)}"]`
        );

        if (field) {
            return field;
        }
    }

    return undefined;
}