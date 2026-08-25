/// <reference types="chrome-types" />

import { describe, expect, it } from "vitest";
import { getUrlFromTab } from "../src/utils/get-url-from-tab.js";

describe("getUrlFromTab", () => {
    it("returns the URL when the tab has one", () => {
        const tab = {
            url: "https://example.com/login"
        } as chrome.tabs.Tab;

        expect(getUrlFromTab(tab)).toBe(
            "https://example.com/login"
        );
    });

    it("returns undefined when the tab has no URL", () => {
        const tab = {} as chrome.tabs.Tab;

        expect(getUrlFromTab(tab)).toBeUndefined();
    });
});