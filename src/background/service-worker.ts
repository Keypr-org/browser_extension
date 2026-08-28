import { getEntries, getPassword } from "../mock/mock-client.js";
import type { Entry, GetEntriesMessage,
    TabInfo, GetPasswordMessage, FillCredentialsMessage, FrameLoginFields} from "../utils/messages.js";

const loginLocations = new Map<string, FrameLoginFields>();

function locationKey(tabId: number, frameId: number): string {
    return `${tabId}:${frameId}`;
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await chrome.tabs.get(tabId).catch(() => undefined);

    // Get URL
    const url = tab?.url;

    if (!url || !isSupportedPage(url)) {
        console.log("No URL available");
        return;
    }
    
    await handleGetEntries({
        type: "GET_ENTRIES",
        url
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== "loading") {
        return;
    }

    for (const key of loginLocations.keys()) {
        if (key.startsWith(`${tabId}:`)) {
            loginLocations.delete(key);
        }
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    for (const key of loginLocations.keys()) {
        if (key.startsWith(`${tabId}:`)) {
            loginLocations.delete(key);
        }
    }
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === "GET_ENTRIES") {
        await handleGetEntries(message);
    } else if (message.type === "LOGIN_FIELDS_DETECTED") {
        const tabInfo = await getTabInfo(sender);
        if (tabInfo === undefined) {
            return;
        }

        loginLocations.set(locationKey(tabInfo.tabId, tabInfo.frameId), {
            tab: tabInfo,
            fields: message.fields
        });
    } else if (message.type === "SHOW_CREDENTIALS") {
        await handleLoginFieldsDetected(message.from, sender);
    } else if (message.type === "GET_PASSWORD") {
        await handleGetPassword(message, sender);
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

    await sendTabMessage(tab.id, {
        type: "DETECT_LOGIN_FIELDS"
    });
}

async function handleLoginFieldsDetected(from: string, sender: chrome.runtime.MessageSender): Promise<void> {
    const loginLocation = await getLoginLocation(sender);

    if (loginLocation === undefined) {
        console.log("No login field location available");
        return;
    }

    console.log("Login fields detected:", loginLocation.fields);

    const usernameField = loginLocation.fields.username;
    const passwordField = loginLocation.fields.password;
    const url = loginLocation.tab.url;

    if (usernameField === undefined && passwordField === undefined) {
        console.log("No login fields found");

        await sendEntries({
            type: "ENTRIES",
            from,
            entries: []
        }, sender);

        return;
    }

    console.log("Login fields found!");

    const entries: Entry[] = getEntries(url);

    await sendEntries({
        type: "ENTRIES",
        from,
        entries
    }, sender);
}

async function sendEntries(message: { type: "ENTRIES"; from: string; entries: Entry[] },
    sender: chrome.runtime.MessageSender): Promise<void> {
    const tabId = sender.tab?.id;

    if (tabId !== undefined && sender.frameId !== undefined) {
        await sendTabMessage(tabId, message, {frameId: sender.frameId});
        return;
    }

    await chrome.runtime.sendMessage(message).catch(() => {
        console.log("No popup is open to receive entries");
    });
}

async function handleGetPassword(message: GetPasswordMessage,
    sender: chrome.runtime.MessageSender): Promise<void> {
    const loginLocation = await getLoginLocation(sender);

    if (loginLocation === undefined) {
        console.log("No login field location available");
        return;
    }

    const pw = getPassword(message.id);

    if (pw === undefined) {
        console.log("No password found");
        return;
    }

    const messageCred: FillCredentialsMessage = {
        type: "FILL_CREDENTIALS",
        username: pw.username,
        password: pw.password,
        usernameField: loginLocation.fields.username,
        passwordField: loginLocation.fields.password
    };

    if (loginLocation.tab === undefined) {
        console.log("No tab info");
        return;
    }

    await sendTabMessage(
        loginLocation.tab.tabId,
        messageCred,
        {
            frameId: loginLocation.tab.frameId
        }
    );
}

async function sendTabMessage(tabId: number, message: object,
    options?: { frameId?: number }): Promise<void> {
    try {
        await chrome.tabs.sendMessage(tabId, message, options);
    } catch {
        console.log("No content script available in this tab or frame");
    }
}

function isSupportedPage(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

async function getLoginLocation(sender: chrome.runtime.MessageSender): Promise<FrameLoginFields | undefined> {
    const senderTabId = sender.tab?.id;

    if (senderTabId !== undefined && sender.frameId !== undefined) {
        return loginLocations.get(
            locationKey(senderTabId, sender.frameId)
        );
    }

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (tab.id === undefined) {
        return undefined;
    }

    return [...loginLocations.values()].find((location) =>
            location.tab.tabId === tab.id &&
            (location.fields.username !== undefined ||
                location.fields.password !== undefined)
    );
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