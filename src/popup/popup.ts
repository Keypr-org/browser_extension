import { displayEntries } from "../utils/credentials-icon.js";

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "ENTRIES" || message.from !== "POPUP") {
        return;
    }
    console.log("I AM POPUP");

    displayEntries(message.entries);
});

chrome.runtime.sendMessage({
    type: "SHOW_CREDENTIALS",
    from: "POPUP"
});