import { getUrlFromTab } from "../utils/get-url-from-tab.js";

chrome.action.onClicked.addListener((tab) => {
    const url = getUrlFromTab(tab);

    if (!url) {
        console.log("No URL available");
        return;
    }

    console.log("Current URL:", url);
});