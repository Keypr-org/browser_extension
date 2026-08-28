import { Entry } from "../utils/messages.js";
import type { LoginFieldsDetectedMessage} from "./messages.js";
import { findField } from "./find-field.js";

let selectedIcon: HTMLButtonElement | undefined;

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "ENTRIES" || message.from !== "CREDENTIALS_ICON") {
        return;
    }
    console.log("I AM ICON");

    displayEntries(message.entries);
});

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

function addOneCredentialIcon(field: HTMLInputElement, name: string): void {
    const querySelectorName = "keypr-credential-icon" + name;

    if (document.querySelector("." + querySelectorName)) {
        return;
    }

    const icon = document.createElement("button");

    icon.type = "button";

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
    icon.style.display = "flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.boxSizing = "border-box";

    iconImage.style.display = "block";
    iconImage.style.width = "24px";
    iconImage.style.height = "24px";

    const rect = field.getBoundingClientRect();

    icon.style.left = `${window.scrollX + rect.right - 32}px`;
    icon.style.top = `${window.scrollY + rect.top + (rect.height - 24) / 2}px`;

    icon.addEventListener("click", () => {
        selectedIcon = icon;
        chrome.runtime.sendMessage({
            type: "SHOW_CREDENTIALS",
            from: "CREDENTIALS_ICON"
        });
    });

    icon.classList.add(querySelectorName);
    document.body.appendChild(icon);
}

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
        overlay.style.left = `${Math.min(anchor.left, window.innerWidth - 328)}px`;
        overlay.style.top = `${anchor.bottom + 8}px`;
    } else {
        overlay.style.right = "16px";
        overlay.style.top = "16px";
    }

    return overlay;
}