/**
 * @file Native Messaging Interface
 * @brief High-level functions for communicating with the native host
 * @details Provides convenient wrapper functions for retrieving credentials from the native
 * password manager application using the native messaging protocol.
 */

import type { ReceivedEntry, GetPasswordMessage, GetEntriesMessage } from "./messages.js";
import { sendNativeRequest } from "./native-port.js";

/**
 * Retrieves credential entries matching the given URL from the native host
 * @param url The URL to retrieve credentials for
 * @return Promise resolving to array of ReceivedEntry objects, or undefined if request fails
 */
export async function getEntries(url: string): Promise<ReceivedEntry[] | undefined> {
    const request: GetEntriesMessage = { type: "GET_ENTRIES", url };

    const response = await sendNativeRequest(request);

    if (response.type === "ERROR") {
        console.error("Native host returned an error when asking for entries:", response.code);
        throw new Error(response.code);
    }

    if (response.type !== "ENTRIES") {
        console.error("Received wrong message type when asking for entries:", response.type);
        return undefined;
    }

    return response.entries;
}

/**
 * Retrieves the password for a specific credential entry from the native host
 * @param id The credential entry ID
 * @return Promise resolving to the password string, or undefined if request fails
 */
export async function getPassword(id: string): Promise<string | undefined> {
    const request: GetPasswordMessage = { type: "GET_PASSWORD", id };

    const response = await sendNativeRequest(request);

    if (response.type === "ERROR") {
        console.error("Native host returned an error when asking for password:", response.code);
        throw new Error(response.code);
    }

    if (response.type !== "PASSWORD") {
        console.error("Received wrong message type when asking for password:", response.type);
        return undefined;
    }

    return response.password;
}
