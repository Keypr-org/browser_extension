import type { Entry, PasswordMessage } from "../utils/messages.js";

const entries: Entry[] = [
    {
        id: 1,
        url: "https://authenticationtest.com/multiStepAuth/",
        username: "multi@authenticationtest.com"
    },
    {
        id: 2,
        url: "https://authenticationtest.com/multiStepAuth/",
        username: "Alice"
    }
];

export function getEntries(url: string): Entry[] {
    const currentUrl = new URL(url);

    return entries.filter((entry) => {
        const entryUrl = new URL(entry.url);

        return (
            entryUrl.origin === currentUrl.origin &&
            currentUrl.pathname.startsWith(entryUrl.pathname)
        );
    });
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
        password: "pa$$w0rd"
    };
}