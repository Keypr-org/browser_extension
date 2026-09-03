/**
 * @file Popup Script
 * @brief Handles popup window communication and credential display
 * @details Listens for ENTRIES messages from service worker and displays available credentials
 * in the popup interface.
 */

import { displayEntries } from "../utils/credentials-icon.js";

const errorElement = document.querySelector<HTMLDivElement>("#error");

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "ENTRIES" || message.from !== "POPUP") {
        if (message.type === "ERROR" && message.from === "POPUP" && errorElement !== null) {
            errorElement.textContent = message.message;
            errorElement.hidden = false;
        }
        return;
    }

    displayEntries(message.entries);
});

chrome.runtime.sendMessage({
    type: "SHOW_CREDENTIALS",
    from: "POPUP"
});
