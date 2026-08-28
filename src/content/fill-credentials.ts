import { findField } from "../utils/find-field.js";
import type { FillCredentialsMessage } from "../utils/messages.js";

export function fillCredentials(message: FillCredentialsMessage): void {
    console.log("Received credentials");

    if (message.usernameField && message.username !== undefined) {
        const usernameField = findField(message.usernameField);

        if (usernameField) {
            fillField(usernameField, message.username);
        }
    }

    if (message.passwordField && message.password !== undefined) {
        const passwordField = findField(message.passwordField);

        if (passwordField) {
            fillField(passwordField, message.password);
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