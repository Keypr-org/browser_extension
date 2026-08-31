import type { ReceivedEntry, NativeMessage, GetPasswordMessage, GetEntriesMessage } from "../utils/messages.js";
import { parseJson } from "../utils/parse-json.js";

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
        },
        {
            "id": 3,
            "username": "C"
        },
        {
            "id": 4,
            "username": "D"
        },
        {
            "id": 5,
            "username": "E"
        },
        {
            "id": 6,
            "username": "F"
        },
        {
            "id": 7,
            "username": "G"
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