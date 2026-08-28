import { findField } from "../utils/find-field.js";

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "FILL_CREDENTIALS") {
        return;
    }

    console.log("Received credentials");

    if (message.usernameField) {
        const usernameField = findField(message.usernameField);

        if (usernameField) {
            fillField(usernameField, message.username);
        }
    }

    if (message.passwordField) {
        const passwordField = findField(message.passwordField);

        if (passwordField) {
            fillField(passwordField, message.password);
        }
    }
});

function fillField(field: HTMLInputElement, value: string): void {
    field.value = value;

    field.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    field.dispatchEvent(
        new Event("change", { bubbles: true })
    );
}