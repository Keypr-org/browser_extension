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
        button.className = "credential";

        button.dataset.entryId = entry.id.toString();

        // Icon
        const icon = document.createElement("img");
        icon.className = "credential-icon";
        icon.src = "../img/icons/iconNoBackground32.png";
        icon.alt = "";

        // Text container
        const content = document.createElement("div");
        content.className = "credential-content";

        const username = document.createElement("div");
        username.className = "credential-username";
        username.textContent = entry.username;

        content.appendChild(username);

        // Assemble
        button.appendChild(icon);
        button.appendChild(content);

        button.addEventListener("click", () => {
            container.querySelectorAll(".credential.selected").forEach((selectedButton) => {
                selectedButton.classList.remove("selected");
            });
            button.classList.add("selected");

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