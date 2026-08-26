import { createMessageLoginField } from "./login-fields.js";

const message = createMessageLoginField();

if (message.fields.username || message.fields.password) {
    console.log("Username field:", message.fields.username);
    console.log("Password field:", message.fields.password);
    chrome.runtime.sendMessage(message);
}