/**
 * @file Login Fields Detection Module
 * @brief Detects and identifies login form fields on web pages
 * @details Implements heuristic-based scoring to identify username and password fields
 * by analyzing HTML attributes like name, id, placeholder, type, and autocomplete.
 */

import type { LoginFieldsDetectedMessage, FieldDescriptor, LoginFields } from "../utils/messages.js";

const MIN_USERNAME_SCORE = 30;

/**
 * Finds a password input field on the page
 * @return The first enabled, non-readonly password field found, or undefined if none exists
 */
function findPasswordField(): HTMLInputElement | undefined {
    const passwordFields = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input[type="password"]'
        )
    );

    return passwordFields.find(
        (field) => !field.disabled && !field.readOnly && isVisible(field)
    );
}

function isVisible(field: HTMLInputElement): boolean {
    if (field.type === "hidden" || field.hidden) {
        return false;
    }

    let element: HTMLElement | null = field;
    while (element !== null) {
        if (element.getAttribute("aria-hidden") === "true") {
            return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
            return false;
        }
        element = element.parentElement;
    }

    return true;
}

/**
 * Scores a field's likelihood of being a username/email input based on attributes
 * @param field The HTMLInputElement to analyze
 * @return An integer score based on matching attributes (higher = more likely to be username field)
 */
function scoreUsernameField(field: HTMLInputElement): number {
    let score = 0;

    const autocomplete = field.autocomplete.toLowerCase();
    const type = field.type.toLowerCase();
    const name = field.name.toLowerCase();
    const id = field.id.toLowerCase();
    const placeholder = field.placeholder.toLowerCase();

    if (autocomplete === "username") {
        score += 100;
    }

    if (type === "email") {
        score += 50;
    }

    if (name.includes("username")) {
        score += 40;
    }

    if (name.includes("email")) {
        score += 40;
    }

    if (name.includes("login")) {
        score += 30;
    }

    if (id.includes("username")) {
        score += 40;
    }

    if (id.includes("email")) {
        score += 40;
    }

    if (id.includes("login")) {
        score += 30;
    }

    if (placeholder.includes("email")) {
        score += 20;
    }

    if (placeholder.includes("username")) {
        score += 20;
    }

    if (placeholder.includes("login")) {
        score += 15;
    }

    return score;
}

/**
 * Finds the most likely username field by scoring all text-based input fields
 * @return The best-scoring username field found, or undefined if none suitable
 */
function findUsernameField(): HTMLInputElement | undefined {
    const fields = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input:not([type="password"])'
        )
    ).filter(
        (field) => !field.disabled && !field.readOnly && isVisible(field)
    );

    let bestField: HTMLInputElement | undefined;
    let bestScore = MIN_USERNAME_SCORE;

    for (const field of fields) {
        const score = scoreUsernameField(field);

        if (score > bestScore) {
            bestScore = score;
            bestField = field;
        }
    }

    return bestField;
}

/**
 * Detects login fields on the current page
 * @return LoginFields object containing references to username and password fields
 */
export function findLoginFields(): LoginFields {
    return {
        username: findUsernameField(),
        password: findPasswordField()
    };
}

function createFieldDescriptor(field: HTMLInputElement): FieldDescriptor {
    return {
        type: field.type,
        class: field.className,
        name: field.name,
        placeholder: field.placeholder,
        id: field.id,
        autocomplete: field.autocomplete
    };
}

export function createMessageLoginField(): LoginFieldsDetectedMessage {
    const fields = findLoginFields();

    return {
        type: "LOGIN_FIELDS_DETECTED",
        fields: {
            username: fields.username ? createFieldDescriptor(fields.username) : undefined,
            password: fields.password ? createFieldDescriptor(fields.password) : undefined
        }
    };
}