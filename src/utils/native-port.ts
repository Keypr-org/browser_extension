import type { NativeMessage } from "./messages.js";

const NATIVE_HOST_NAME = "com.keypr.native";
const REQUEST_TIMEOUT_MS = 5000;

let port: chrome.runtime.Port | undefined;

function getPort(): chrome.runtime.Port {
    if (port !== undefined) {
        return port;
    }

    const newPort = chrome.runtime.connectNative(NATIVE_HOST_NAME);

    newPort.onDisconnect.addListener(() => {
        console.error("Native host disconnected");
        port = undefined;
    });

    port = newPort;
    return newPort;
}

// Native Messaging is a single stdio pipe: requests and responses aren't correlated
// by an id, so callers must await one response before sending the next request.
export function sendNativeRequest(message: NativeMessage): Promise<NativeMessage> {
    return new Promise((resolve, reject) => {
        const activePort = getPort();

        const timer = setTimeout(() => {
            activePort.onMessage.removeListener(onMessage);
            reject(new Error("Native messaging request timed out"));
        }, REQUEST_TIMEOUT_MS);

        function onMessage(response: NativeMessage): void {
            clearTimeout(timer);
            activePort.onMessage.removeListener(onMessage);
            resolve(response);
        }

        activePort.onMessage.addListener(onMessage);

        try {
            activePort.postMessage(message);
        } catch (error) {
            clearTimeout(timer);
            activePort.onMessage.removeListener(onMessage);
            reject(error);
        }
    });
}
