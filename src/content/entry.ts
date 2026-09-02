/**
 * @file Content Script Entry Point
 * @brief Main entry point for content script execution
 * @details Sets up login field detection with a MutationObserver and establishes communication
 * with the service worker for login field detection and credential filling.
 */

import { createMessageLoginField } from "./login-fields.js";
import { addCredentialIcon } from "../utils/credentials-icon.js";
import { fillCredentials } from "./fill-credentials.js";

/**
 * Detects login fields on the page and sends detection message to service worker
 * @return void
 */
function detectLoginFields(): void {
    const message = createMessageLoginField();

    console.log("Detected fields:", message);

    addCredentialIcon(message);

    if (message.fields.username || message.fields.password) {
        chrome.runtime.sendMessage(message);
    }
}

/**
 * MutationObserver watching for changes to the DOM to detect login field mutations
 */
const observer = new MutationObserver(() => {
    detectLoginFields();
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "DETECT_LOGIN_FIELDS") {
        detectLoginFields();
    } else if (message.type === "FILL_CREDENTIALS") {
        fillCredentials(message);
    }
});

detectLoginFields();