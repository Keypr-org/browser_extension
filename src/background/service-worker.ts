import { getEntries } from "../mock/mock-client.js";
import type { Entry, LoginFieldsDetectedMessage, GetEntriesMessage, TabInfo } from "../utils/messages.js";

chrome.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === "GET_ENTRIES") {
        await handleGetEntries(message);
    } else if (message.type === "LOGIN_FIELDS_DETECTED") {
        const tabInfo = await getTabInfo(sender);
    
        if (tabInfo === undefined) {
            return;
        }
        handleLoginFieldsDetected(message, tabInfo.url);
    }
});

async function handleGetEntries(message: GetEntriesMessage): Promise<void> {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (tab.id === undefined) {
        console.log("No tab ID available");
        return;
    }

    console.log("Current URL:", message.url);

    // Detect fields
    await chrome.scripting.executeScript({
        target: {
            tabId: tab.id,
            allFrames: true
        },
        files: ["content/login-fields.js"]
    });
}

function handleLoginFieldsDetected(message: LoginFieldsDetectedMessage, url: string): void {
    console.log("Login fields detected:", message.fields);

    if (message.fields.username === undefined && message.fields.password === undefined) {
        console.log("No login fields found");

        chrome.runtime.sendMessage({
            type: "ENTRIES",
            entries: []
        });

        return;
    }

    console.log("Login fields found!");

    const entries: Entry[] = getEntries(url);

    chrome.runtime.sendMessage({
        type: "ENTRIES",
        entries
    });
}

async function getTabInfo(sender: chrome.runtime.MessageSender): Promise<TabInfo | undefined> {
    // Get tab
    const tabId = sender.tab?.id;
    if (tabId === undefined) {
        console.log("No tab ID available");
        return;
    }
    
    const tab = await chrome.tabs.get(tabId);

    // Get URL
    const url = tab.url;

    if (!url) {
        console.log("No URL available");
        return;
    }

    // Get frameId
    const frameId = sender.frameId;

    if (frameId === undefined) {
        console.log("No frame ID available");
        return;
    }

    return {
        tabId: tabId,
        url: url,
        frameId: frameId
    };
}