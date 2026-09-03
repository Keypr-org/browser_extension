/**
 * @file Credential Filling Module
 * @brief Handles automatic filling of username and password into detected login fields
 * @details Exports functions to locate form fields and populate them with credentials,
 * triggering appropriate input events to notify the page of value changes.
 */

import { findField } from "../utils/find-field.js";
import type { FillCredentialsMessage } from "../utils/messages.js";

/**
 * Fills username and password fields with provided credentials
 * @param message The FillCredentialsMessage containing credentials and field descriptors
 * @return void
 */
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

/**
 * Fills a single input field with a value and triggers input/change events
 * @param field The HTMLInputElement to fill
 * @param value The value to set in the field
 * @return void
 */
function fillField(field: HTMLInputElement, value: string): void {
    field.value = value;

    field.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    field.dispatchEvent(
        new Event("change", { bubbles: true })
    );
}