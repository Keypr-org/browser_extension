import { findField } from "../utils/find-field.js";
import type { FillCredentialsMessage } from "../utils/messages.js";

export function fillCredentials(message: FillCredentialsMessage): void {
    console.log("Received credentials");

    for (const field of Object.values(message.fields)) {
        if (!field) {
            continue;
        }

        const element = findField(field.descriptor);

        if (element) {
            fillField(element, field.value);
        }
    }
}

function fillField(field: HTMLInputElement, value: string): void {
    field.value = value;

    field.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    field.dispatchEvent(
        new Event("change", { bubbles: true })
    );
}