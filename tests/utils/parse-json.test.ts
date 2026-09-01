import { describe, expect, it } from "vitest";
import { parseJson, toJson } from "../../src/utils/parse-json.js";

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
            "id": "1"
        }`)).toEqual({
            type: "GET_PASSWORD",
            id: "1"
        });
    });

    it("parses an ENTRIES message", () => {
        expect(parseJson(`{
            "type": "ENTRIES",
            "entries": [
                {
                    "id": "1",
                    "username": "alice"
                },
                {
                    "id": "2",
                    "username": "bob"
                }
            ]
        }`)).toEqual({
            type: "ENTRIES",
            entries: [
                {
                    id: "1",
                    username: "alice"
                },
                {
                    id: "2",
                    username: "bob"
                }
            ]
        });
    });

    it("parses a PASSWORD message", () => {
        expect(parseJson(`{
            "type": "PASSWORD",
            "password": "secret"
        }`)).toEqual({
            type: "PASSWORD",
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
                    "id": 42,
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

describe("toJson", () => {
    it("serializes a GET_ENTRIES message", () => {
        expect(toJson({
            type: "GET_ENTRIES",
            url: "https://example.com"
        })).toBe(
            '{"type":"GET_ENTRIES","url":"https://example.com"}'
        );
    });

    it("serializes a GET_PASSWORD message", () => {
        expect(toJson({
            type: "GET_PASSWORD",
            id: "1",
        })).toBe(
            '{"type":"GET_PASSWORD","id":"1"}'
        );
    });

    it("serializes an ENTRIES message", () => {
        expect(toJson({
            type: "ENTRIES",
            entries: [
                {
                    id: "1",
                    username: "alice"
                },
                {
                    id: "2",
                    username: "bob"
                }
            ]
        })).toBe(
            '{"type":"ENTRIES","entries":[{"id":"1","username":"alice"},{"id":"2","username":"bob"}]}'
        );
    });

    it("serializes a PASSWORD message", () => {
        expect(toJson({
            type: "PASSWORD",
            password: "secret"
        })).toBe(
            '{"type":"PASSWORD","password":"secret"}'
        );
    });

    it("serializes an ERROR message", () => {
        expect(toJson({
            type: "ERROR",
            code: "NOT_FOUND"
        })).toBe(
            '{"type":"ERROR","code":"NOT_FOUND"}'
        );
    });
});