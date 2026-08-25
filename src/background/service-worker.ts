import { getUrlFromTab } from "../utils/get-url-from-tab.js";

chrome.action.onClicked.addListener(async (tab) => {
    const url = getUrlFromTab(tab);

    if (!url) {
        console.log("No URL available");
        return;
    }

    console.log("Current URL:", url);

    if (!tab.id) {
        console.log("No tab ID available");
        return;
    }

    await chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
        files: ["content/login-fields.js"]
    });
});