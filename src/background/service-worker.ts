import { getUrlFromTab } from "../utils/get-url-from-tab.js";

chrome.action.onClicked.addListener(async (tab) => {
    const url = getUrlFromTab(tab);

    if (url === undefined) {
        console.log("No URL available");
        return;
    }

    console.log("Current URL:", url);

    if (tab.id === undefined) {
        console.log("No tab ID available");
        return;
    }

    await chrome.scripting.executeScript({
        target: {
            tabId: tab.id,
            allFrames: true
        },
        files: ["content/login-fields.js"]
    });
    
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type !== "LOGIN_FIELDS_DETECTED") {
        return;
    }

    console.log("Login fields detected:");
    console.log(message.fields);

    console.log("Tab:", sender.tab?.id);
    console.log("Frame:", sender.frameId);
});