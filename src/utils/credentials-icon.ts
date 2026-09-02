/**
 * @file Credentials Icon and Display Module
 * @brief Manages credential icon overlay and credentials display popup
 * @details Creates clickable icons on login fields, handles credential selection,
 * and displays an overlay popup with available credentials formatted for easy viewing.
 */

import { Entry } from "../utils/messages.js";
import type { LoginFieldsDetectedMessage} from "./messages.js";
import { findField } from "./find-field.js";

/** Stores reference to the currently selected credential icon button */
let selectedIcon: HTMLButtonElement | undefined;

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "ENTRIES" || message.from !== "CREDENTIALS_ICON") {
        return;
    }
    console.log("I AM ICON");

    displayEntries(message.entries);
});

/**
 * Adds credential icons to detected username and password fields
 * @param login The LoginFieldsDetectedMessage containing field descriptors
 * @return void
 */
export function addCredentialIcon(login: LoginFieldsDetectedMessage): void {
    if (login.fields.username) {
        const usernameField = findField(login.fields.username);
        if (usernameField) {
            addOneCredentialIcon(usernameField, "username");
        }
    }
    
    if (login.fields.password) {
        const passwordField = findField(login.fields.password);
        if (passwordField) {
            addOneCredentialIcon(passwordField, "password");
        }
    }
}

/**
 * Adds a single credential icon button to an input field
 * @param field The HTMLInputElement to attach the icon to
 * @param name The field type name ("username" or "password") for CSS styling
 * @return void
 */
function addOneCredentialIcon(field: HTMLInputElement, name: string): void {
    if (field.dataset.keyprCredentialIcon === "true") {
        return;
    }

    field.dataset.keyprCredentialIcon = "true";

    const icon = document.createElement("button");

    icon.type = "button";
    icon.classList.add(`keypr-credential-icon-${name}`);

    const iconImage = document.createElement("img");

    iconImage.src = chrome.runtime.getURL("img/icons/icon24.png");
    iconImage.alt = "Show credentials";
    iconImage.width = 24;
    iconImage.height = 24;

    icon.appendChild(iconImage);

    icon.style.position = "absolute";
    icon.style.zIndex = "999999";
    icon.style.cursor = "pointer";
    icon.style.border = "none";
    icon.style.background = "transparent";
    icon.style.padding = "0";
    icon.style.width = "24px";
    icon.style.height = "24px";

    iconImage.style.display = "block";
    iconImage.style.width = "24px";
    iconImage.style.height = "24px";

    document.body.appendChild(icon);

    positionCredentialIcon(icon, field);

    icon.addEventListener("click", () => {
        selectedIcon = icon;

        chrome.runtime.sendMessage({
            type: "SHOW_CREDENTIALS",
            from: "CREDENTIALS_ICON"
        });
    });

    window.addEventListener("scroll", () => {
        positionCredentialIcon(icon, field);
    });

    window.addEventListener("resize", () => {
        positionCredentialIcon(icon, field);
    });
}

/**
 * Positions a credential icon relative to its associated input field
 * @param icon The credential icon button element to position
 * @param field The associated HTMLInputElement
 * @return void
 */
function positionCredentialIcon(icon: HTMLButtonElement, field: HTMLInputElement): void {
    const rect = field.getBoundingClientRect();

    icon.style.left = `${window.scrollX + rect.right - 32}px`;
    icon.style.top = `${window.scrollY + rect.top + (rect.height - 24) / 2}px`;
}

/**
 * Displays available credentials in an overlay popup
 * @param entries Array of Entry objects containing credential information
 * @return Promise that resolves after entries are displayed
 */
export async function displayEntries(entries: Entry[]): Promise<void> {
    const container = document.getElementById("entries");

    const entriesContainer = container ?? createOverlay();
    entriesContainer.innerHTML = "";

    if (entries.length === 0) {
        entriesContainer.textContent = "No credentials found";
        return;
    }

    const url = window.location.href;

    for (const entry of entries) {
        const button = document.createElement("button");
        button.className = "credential";

        button.dataset.entryId = entry.id.toString();

        // Icon
        const icon = document.createElement("img");
        icon.className = "credential-icon";
        icon.src = chrome.runtime.getURL("img/icons/iconNoBackground32.png");
        icon.alt = "";

        // Text container
        const content = document.createElement("div");
        content.className = "credential-content";

        const username = document.createElement("div");
        username.className = "credential-username";
        username.textContent = entry.username;

        content.appendChild(username);

        // Assemble
        button.appendChild(icon);
        button.appendChild(content);

        button.addEventListener("click", () => {
            entriesContainer.querySelectorAll(".credential.selected").forEach((selectedButton) => {
                selectedButton.classList.remove("selected");
            });
            button.classList.add("selected");

            chrome.runtime.sendMessage({
                type: "GET_PASSWORD",
                id: entry.id,
                url,
                username: entry.username
            });
        });

        entriesContainer.appendChild(button);
    }
}

/**
 * Creates or retrieves the credentials overlay element
 * @return The HTMLDivElement containing the credentials overlay
 */
function createOverlay(): HTMLDivElement {
    const existingOverlay = document.getElementById(
        "keypr-credentials-overlay"
    );

    if (existingOverlay instanceof HTMLDivElement) {
        return existingOverlay;
    }

    const overlay = document.createElement("div");

    overlay.id = "keypr-credentials-overlay";
    
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = chrome.runtime.getURL("style/credentials-overlay.css");
    document.head.appendChild(stylesheet);

    const closeOverlay = (): void => {
        overlay.remove();
        document.removeEventListener(
            "pointerdown",
            handleOutsideClick,
            true
        );
        window.removeEventListener("blur", closeOverlay);
    };

    const handleOutsideClick = (event: PointerEvent): void => {
        if (event.composedPath().includes(overlay)) {
            return;
        }

        closeOverlay();
    };

    document.addEventListener(
        "pointerdown",
        handleOutsideClick,
        true
    );
    window.addEventListener("blur", closeOverlay);

    document.body.appendChild(overlay);

    const anchor = selectedIcon?.getBoundingClientRect();

    if (anchor) {
        const gap = 8;
        const overlayWidth = 320;
        const overlayHeight = 400;

        let left = anchor.left;
        let top = anchor.bottom + gap;

        // Keep the overlay inside the viewport horizontally
        left = Math.min(
            left,
            window.innerWidth - overlayWidth - gap
        );

        left = Math.max(left, gap);

        // If there isn't enough room below, put it above the icon
        if (
            top + overlayHeight > window.innerHeight &&
            anchor.top - overlayHeight - gap >= 0
        ) {
            top = anchor.top - overlayHeight - gap;
        }

        // Keep it inside the viewport vertically
        top = Math.max(
            gap,
            Math.min(
                top,
                window.innerHeight - overlayHeight - gap
            )
        );

        overlay.style.left = `${left}px`;
        overlay.style.top = `${top}px`;
    } else {
        overlay.style.right = "16px";
        overlay.style.top = "16px";
    }

    return overlay;
}