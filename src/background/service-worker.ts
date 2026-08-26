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

    // Get the fields location

    await chrome.scripting.executeScript({
        target: {
            tabId: tab.id,
            allFrames: true
        },
        files: ["content/login-fields.js"]
    });
    
    // If there aren't any field location then popup should show a message indicating 'no credentials'

    // Ask via native messaging the entries for said URL to the client-server

    // parseJson the message

    // Send the entries to the popup to display all the entries inside the popup as buttons

    // If user clicks on a button entry, send json informations of the entry pressed with type 'GET_PASSWORD'

    // Receive json 'PASSWORD' and parse it

    
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