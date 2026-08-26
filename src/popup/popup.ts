import { getEntries } from "../mock/mock-client.js";

async function loadEntries(): Promise<void> {
    const entriesContainer = document.getElementById("entries");

    if (!entriesContainer) {
        throw new Error("Entries container not found");
    }

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab.url) {
        entriesContainer.textContent = "No URL available";
        return;
    }

    const entries = getEntries(tab.url);

    for (const entry of entries) {
        const button = document.createElement("button");

        button.textContent = entry.username;

        button.addEventListener("click", async () => {
            await chrome.runtime.sendMessage({
                type: "ENTRY_SELECTED",
                id: entry.id
            });

            window.close();
        });

        entriesContainer.appendChild(button);
    }
}

loadEntries();