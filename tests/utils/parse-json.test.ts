import { describe, expect, it } from "vitest";
import { parseJson } from "../../src/utils/parse-json.js";

describe("parseJson", () => {
    it("parses a GET_ENTRIES message", () => {
        expect(parseJson(`{
            "type": "GET_ENTRIES",
            "url": "https://example.com"
        }`)).toEqual({
            type: "GET_ENTRIES",
            url: "https://example.com"
        });
    });

    it("parses a GET_PASSWORD message", () => {
        expect(parseJson(`{
            "type": "GET_PASSWORD",
            "id": 1,
            "url": "https://example.com",
            "username": "alice"
        }`)).toEqual({
            type: "GET_PASSWORD",
            id: 1,
            url: "https://example.com",
            username: "alice"
        });
    });

    it("parses an ENTRIES message", () => {
        expect(parseJson(`{
            "type": "ENTRIES",
            "entries": [
                {
                    "id": 1,
                    "url": "https://example.com",
                    "username": "alice"
                },
                {
                    "id": 2,
                    "url": "https://example.com",
                    "username": "bob"
                }
            ]
        }`)).toEqual({
            type: "ENTRIES",
            entries: [
                {
                    id: 1,
                    url: "https://example.com",
                    username: "alice"
                },
                {
                    "id": 2,
                    "url": "https://example.com",
                    "username": "bob"
                }
            ]
        });
    });

    it("parses a PASSWORD message", () => {
        expect(parseJson(`{
            "type": "PASSWORD",
            "id": 1,
            "url": "https://example.com",
            "username": "alice",
            "password": "secret"
        }`)).toEqual({
            type: "PASSWORD",
            id: 1,
            url: "https://example.com",
            username: "alice",
            password: "secret"
        });
    });

    it("parses an ERROR message", () => {
        expect(parseJson(`{
            "type": "ERROR",
            "code": "NOT_FOUND"
        }`)).toEqual({
            type: "ERROR",
            code: "NOT_FOUND"
        });
    });

    it("rejects invalid JSON", () => {
        expect(() => parseJson("{invalid")).toThrow("Invalid JSON");
    });

    it("rejects a message without a type", () => {
        expect(() => parseJson(`{
            "url": "https://example.com"
        }`)).toThrow("Invalid native message");
    });

    it("rejects an unknown message type", () => {
        expect(() => parseJson(`{
            "type": "UNKNOWN"
        }`)).toThrow("Invalid native message");
    });

    it("rejects a message with an invalid field type", () => {
        expect(() => parseJson(`{
            "type": "GET_ENTRIES",
            "url": 123
        }`)).toThrow("Invalid native message");
    });

    it("rejects entries with invalid data", () => {
        expect(() => parseJson(`{
            "type": "ENTRIES",
            "entries": [
                {
                    "id": "wrong",
                    "url": "https://example.com",
                    "username": "alice"
                }
            ]
        }`)).toThrow("Invalid native message");
    });

    it("rejects non-array entries", () => {
        expect(() => parseJson(`{
            "type": "ENTRIES",
            "entries": {}
        }`)).toThrow("Invalid native message");
    });
});