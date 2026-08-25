export function getUrlFromTab(tab: chrome.tabs.Tab): string | undefined {
    return tab.url;
}