import { Entry } from "../utils/messages.js";

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "ENTRIES") {
        return;
    }

    displayEntries(message.entries);
});

async function displayEntries(entries: Entry[]): Promise<void> {
    const container = document.getElementById("entries");

    if (!container) {
        throw new Error("Entries container not found");
    }

    container.innerHTML = "";

    if (entries.length === 0) {
        container.textContent = "No credentials found";
        return;
    }

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab.url) {
        console.log("No URL available");
        return;
    }

    for (const entry of entries) {
        const button = document.createElement("button");

        button.textContent = entry.username;
        button.dataset.entryId = entry.id.toString();

        button.addEventListener("click", () => {
            chrome.runtime.sendMessage({
                type: "GET_PASSWORD",
                id: entry.id,
                url: tab.url,
                username: entry.username
            });
        });

        container.appendChild(button);
    }
}

async function requestEntries(): Promise<void> {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab.url) {
        console.log("No URL available");
        return;
    }

    chrome.runtime.sendMessage({
        type: "GET_ENTRIES",
        url: tab.url
    });
}

requestEntries();