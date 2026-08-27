chrome.runtime.sendMessage({
    type: "GET_ENTRIES",
    url: window.location.href
});