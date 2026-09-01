import type { ReceivedEntry, NativeMessage } from "./messages.js";

export function parseJson(json: string): NativeMessage {
    let data: unknown;

    try {
        data = JSON.parse(json);
    } catch {
        throw new Error("Invalid JSON");
    }

    if (!isNativeMessage(data)) {
        throw new Error("Invalid native message");
    }

    return data;
}

export function toJson(message: NativeMessage): string {
    return JSON.stringify(message);
}

function isNativeMessage(value: unknown): value is NativeMessage {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const message = value as Record<string, unknown>;

    if (typeof message.type !== "string") {
        return false;
    }

    switch (message.type) {
        case "GET_ENTRIES":
            return (typeof message.url === "string");

        case "GET_PASSWORD":
            return (
                typeof message.id === "string"
            );

        case "ENTRIES":
            return (
                Array.isArray(message.entries) &&
                message.entries.every(isEntry)
            );

        case "PASSWORD":
            return (
                typeof message.password === "string"
            );

        case "ERROR":
            return (typeof message.code === "string");

        default:
            return false;
    }
}

function isEntry(value: unknown): value is ReceivedEntry {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const entry = value as Record<string, unknown>;

    return (
        typeof entry.id === "string" &&
        typeof entry.username === "string"
    );
}