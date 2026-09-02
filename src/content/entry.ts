/**
 * @file Content Script Entry Point
 * @brief Main entry point for content script execution
 * @details Sets up login field detection with a MutationObserver and establishes communication
 * with the service worker for login field detection and credential filling.
 */

import { createMessageLoginField } from "./login-fields.js";
import { addCredentialIcon } from "../utils/credentials-icon.js";
import { fillCredentials } from "./fill-credentials.js";

let extensionContextInvalidated = false;

function isExtensionContextInvalidated(error: unknown): boolean {
    return error instanceof Error && error.message.includes("Extension context invalidated");
}

function handleExtensionError(error: unknown): void {
    if (isExtensionContextInvalidated(error)) {
        extensionContextInvalidated = true;
        observer.disconnect();
        return;
    }

    console.error("Content script error:", error);
}

function isExtensionNode(node: Node): boolean {
    return node instanceof Element && node.closest(
        ".keypr-credential-icon-username, .keypr-credential-icon-password, " +
        "#keypr-credentials-overlay"
    ) !== null;
}

/**
 * Detects login fields on the page and sends detection message to service worker
 * @return void
 */
function detectLoginFields(): void {
    if (extensionContextInvalidated) {
        return;
    }

    const message = createMessageLoginField();

    console.log("Detected fields:", message);

    try {
        addCredentialIcon(message);

        if (message.fields.username || message.fields.password) {
            void chrome.runtime.sendMessage(message).catch(handleExtensionError);
        }
    } catch (error) {
        handleExtensionError(error);
    }
}

/**
 * MutationObserver watching for changes to the DOM and field attributes
 */
const observer = new MutationObserver((mutations) => {
    const pageMutation = mutations.some((mutation) => {
        if (mutation.type === "attributes") {
            return !isExtensionNode(mutation.target);
        }

        return [...mutation.addedNodes, ...mutation.removedNodes].some(
            (node) => !isExtensionNode(node)
        );
    });

    if (pageMutation) {
        detectLoginFields();
    }
});

observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
        "autocomplete",
        "aria-hidden",
        "class",
        "disabled",
        "hidden",
        "id",
        "name",
        "placeholder",
        "readonly",
        "style",
        "type"
    ]
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "DETECT_LOGIN_FIELDS") {
        detectLoginFields();
    } else if (message.type === "FILL_CREDENTIALS") {
        fillCredentials(message);
    }
});

detectLoginFields();