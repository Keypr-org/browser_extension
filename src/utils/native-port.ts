/**
 * @file Native Port Communication Module
 * @brief Low-level native messaging port management and request handling
 * @details Manages a persistent connection to the native host application using Chrome's
 * native messaging API. Handles request-response correlation with timeouts and error handling.
 */

import type { NativeMessage } from "./messages.js";

/** Name of the native messaging host as specified in the manifest */
const NATIVE_HOST_NAME = "com.keypr.native";

/** Timeout in milliseconds for native host requests */
const REQUEST_TIMEOUT_MS = 5000;

/** Persistent connection to the native host */
let port: chrome.runtime.Port | undefined;
let requestQueue = Promise.resolve();

function getDisconnectError(): { message: string } | undefined {
    const runtime = chrome.runtime as typeof chrome.runtime & {
        lastError?: { message: string };
    };

    return runtime.lastError;
}

/**
 * Gets or creates a connection to the native host
 * @return The chrome.runtime.Port for communicating with the native host
 */
function getPort(): chrome.runtime.Port {
    if (port !== undefined) {
        return port;
    }

    const newPort = chrome.runtime.connectNative(NATIVE_HOST_NAME);

    newPort.onDisconnect.addListener(() => {
        const disconnectError = getDisconnectError();
        if (disconnectError !== undefined) {
            console.error("Native host disconnected:", disconnectError.message);
        }
        port = undefined;
    });

    port = newPort;
    return newPort;
}

/**
 * Sends a message to the native host and waits for a response with timeout
 * @details Note: Native Messaging uses a single stdio pipe, so requests and responses
 * are not correlated by ID. Callers must await one response before sending the next request.
 * @param message The NativeMessage to send
 * @return Promise resolving to the NativeMessage response from the native host
 * @throws Error if request times out or communication fails
 */
export function sendNativeRequest(message: NativeMessage): Promise<NativeMessage> {
    const request = requestQueue.then(() => sendQueuedNativeRequest(message));
    requestQueue = request.then(() => undefined, () => undefined);
    return request;
}

function sendQueuedNativeRequest(message: NativeMessage): Promise<NativeMessage> {
    return new Promise((resolve, reject) => {
        const activePort = getPort();

        const timer = setTimeout(() => {
            activePort.onDisconnect.removeListener(onDisconnect);
            activePort.onMessage.removeListener(onMessage);
            reject(new Error("Native messaging request timed out"));
        }, REQUEST_TIMEOUT_MS);

        function onDisconnect(): void {
            const disconnectError = getDisconnectError();
            clearTimeout(timer);
            activePort.onDisconnect.removeListener(onDisconnect);
            activePort.onMessage.removeListener(onMessage);
            reject(new Error(disconnectError?.message ?? "Native host disconnected"));
        }

        function onMessage(response: NativeMessage): void {
            clearTimeout(timer);
            activePort.onDisconnect.removeListener(onDisconnect);
            activePort.onMessage.removeListener(onMessage);
            resolve(response);
        }

        activePort.onDisconnect.addListener(onDisconnect);
        activePort.onMessage.addListener(onMessage);

        try {
            activePort.postMessage(message);
        } catch (error) {
            clearTimeout(timer);
            activePort.onDisconnect.removeListener(onDisconnect);
            activePort.onMessage.removeListener(onMessage);
            reject(error);
        }
    });
}
