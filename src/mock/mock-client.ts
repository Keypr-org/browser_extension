import type { Entry, PasswordMessage } from "../utils/messages.js";

const entries: Entry[] = [
    {
        id: 1,
        url: "https://authenticationtest.com/simpleFormAuth/",
        username: "Bob"
    },
    {
        id: 2,
        url: "https://authenticationtest.com/simpleFormAuth/",
        username: "Alice"
    }
];

export function getEntries(url: string): Entry[] {
    return entries.filter((entry) => entry.url === url);
}

export function getPassword(id: number): PasswordMessage | undefined {
    const entry = entries.find(
        (entry) => entry.id === id
    );

    if (!entry) {
        return undefined;
    }

    return {
        type: "PASSWORD",
        id: entry.id,
        url: entry.url,
        username: entry.username,
        password: "example_password"
    };
}