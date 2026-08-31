import { createMessageLoginField } from "./login-fields.js";
import { addCredentialIcon } from "../utils/credentials-icon.js";
import { fillCredentials } from "./fill-credentials.js";

function detectLoginFields(): void {
    const message = createMessageLoginField();

    console.log("Detected fields:", message);

    addCredentialIcon(message);

    if (message.fields.username || message.fields.password) {
        chrome.runtime.sendMessage(message);
    }
}

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