/**
 * @file Service Worker for Browser Extension
 * @brief Main background service worker handling browser events and message routing
 * @details Manages tab lifecycle events, coordinates between content scripts and native host,
 * handles login field detection, credential retrieval, and credential filling across tabs and frames.
 */

import { getEntries, getPassword } from "../utils/native-messaging.js";
import type { GetEntriesMessage,
    TabInfo, GetPasswordMessage, FillCredentialsMessage, FrameLoginFields, ReceivedEntry} from "../utils/messages.js";

/** Map storing detected login field locations indexed by tab and frame IDs */
const loginLocations = new Map<string, FrameLoginFields>();

/** Cached entries retrieved from native host */
let globEntries: ReceivedEntry[] | undefined;

/**
 * Creates a unique key for a tab and frame combination
 * @param tabId The browser tab ID
 * @param frameId The frame ID within the tab
 * @return A string key combining tab and frame IDs
 */
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

/**
 * Handles GET_ENTRIES message by requesting login field detection from content script
 * @param message The GET_ENTRIES message containing the current URL
 * @return Promise that resolves when the detection request is sent
 */
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

/**
 * Handles credentials display request by retrieving entries for the detected login location
 * @param from The source identifier (POPUP or CREDENTIALS_ICON)
 * @param sender The message sender information including tab and frame ID
 * @return Promise that resolves after entries are sent
 */
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

    globEntries = await getEntries(url);

    if (globEntries === undefined) {
        console.error("No entries found exiting 'getEntries'");
        return;
    } 

    await sendEntries({
        type: "ENTRIES",
        from,
        entries: globEntries
    }, sender);
}

/**
 * Sends entries message to the appropriate content script or popup
 * @param message The ENTRIES message containing credential entries
 * @param sender The original message sender information
 * @return Promise that resolves after the message is sent
 */
async function sendEntries(message: { type: "ENTRIES"; from: string; entries: ReceivedEntry[] },
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

/**
 * Handles password retrieval request and sends credentials to fill form fields
 * @param message The GET_PASSWORD message with entry ID
 * @param sender The message sender information
 * @return Promise that resolves after credentials are sent for filling
 */
async function handleGetPassword(message: GetPasswordMessage, sender: chrome.runtime.MessageSender): Promise<void> {
    const loginLocation = await getLoginLocation(sender);

    if (loginLocation === undefined) {
        console.log("No login field location available");
        return;
    }

    const pw = await getPassword(message.id);

    if (pw === undefined) {
        console.log("No password found");
        return;
    }

    if (globEntries === undefined) {
        console.error("globEntries is undefined inside of handleGetPassword");
        return;
    } 

    const entry = globEntries.find((entry) => entry.id === message.id);

    if (entry === undefined) {
        console.error("No entry for the requested entry");
        return;
    }

    const messageCred: FillCredentialsMessage = {
        type: "FILL_CREDENTIALS",
        username: entry?.username,
        password: pw,
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

/**
 * Sends a message to a specific tab, optionally targeting a specific frame
 * @param tabId The target tab ID
 * @param message The message object to send
 * @param options Optional configuration including frameId for targeted frame delivery
 * @return Promise that resolves when message is sent (catches delivery failures)
 */
async function sendTabMessage(tabId: number, message: object,
    options?: { frameId?: number }): Promise<void> {
    try {
        await chrome.tabs.sendMessage(tabId, message, options);
    } catch {
        console.log("No content script available in this tab or frame");
    }
}

/**
 * Checks if a page URL is supported (HTTP/HTTPS)
 * @param url The page URL to check
 * @return True if URL starts with http:// or https://, false otherwise
 */
function isSupportedPage(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Retrieves the login location (tab and fields) associated with a message sender
 * @param sender The message sender containing tab and frame information
 * @return Promise resolving to FrameLoginFields if found, undefined otherwise
 */
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

/**
 * Extracts and validates tab information from a message sender
 * @param sender The message sender object from Chrome runtime
 * @return Promise resolving to TabInfo with tab ID, URL, and frame ID, or undefined if incomplete
 */
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