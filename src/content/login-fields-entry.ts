import { createMessageLoginField } from "./login-fields.js";
import { addCredentialIcon } from "../utils/credentials-icon.js";

const message = createMessageLoginField();
addCredentialIcon(message);

if (message.fields.username || message.fields.password) {
    console.log("Username field:", message.fields.username);
    console.log("Password field:", message.fields.password);
    chrome.runtime.sendMessage(message);
}