import type { ReceivedEntry, GetPasswordMessage, GetEntriesMessage } from "./messages.js";
import { sendNativeRequest } from "./native-port.js";

export async function getEntries(url: string): Promise<ReceivedEntry[] | undefined> {
    const request: GetEntriesMessage = { type: "GET_ENTRIES", url };

    const response = await sendNativeRequest(request);

    if (response.type !== "ENTRIES") {
        console.error("Received wrong message type when asking for entries:", response.type);
        return undefined;
    }

    return response.entries;
}

export async function getPassword(id: string): Promise<string | undefined> {
    const request: GetPasswordMessage = { type: "GET_PASSWORD", id };

    const response = await sendNativeRequest(request);

    if (response.type !== "PASSWORD") {
        console.error("Received wrong message type when asking for password:", response.type);
        return undefined;
    }

    return response.password;
}
