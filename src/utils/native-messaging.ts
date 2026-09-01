import type { ReceivedEntry, NativeMessage, GetPasswordMessage, GetEntriesMessage } from "./messages.js";
import { parseJson } from "./parse-json.js";

const mockEntriesMessage = `{
    "type": "ENTRIES",
    "entries": [
        {
            "id": 1,
            "username": "Bob"
        },
        {
            "id": 2,
            "username": "Alice"
        }
    ]
}`;

const mockPasswordMessage = `{
    "type": "PASSWORD",
    "password": "example_password"
}`;

export function getEntries(url: string): ReceivedEntry[] | undefined{
    const mockRequest: GetEntriesMessage = {type: "GET_ENTRIES",url};
    console.log(mockRequest);
    // Normally:
    // const json = toJson(mockRequest);
    chrome.runtime.sendNativeMessage(
        'com.keypr.native',
        {mockRequest},
        function (response) {
            console.log('Received ' + response);
        }
    );
    // send to native client
    // const response = receive from native client

    const response: NativeMessage = parseJson(mockEntriesMessage);

    if (response.type !== "ENTRIES") {
        console.error("Received wrong message type when asking for entries");
        return;
    }

    return response.entries;
}

export function getPassword(id: number): string | undefined {
    const mockRequest: GetPasswordMessage = {type: "GET_PASSWORD",id};
    console.log(mockRequest);

    // Normally:
    // const json = toJson(mockRequest);
    // send to native client
    // const response = receive from native client

    const response: NativeMessage = parseJson(mockPasswordMessage);

    if (response.type !== "PASSWORD") {
        console.error("Received wrong message type when asking for password");
        return;
    }

    return response.password;
}