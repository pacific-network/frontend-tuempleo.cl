//assests/js/modules/utils/events.js
export function triggerRefresh() {
    document.dispatchEvent(new Event("refresh-data"));
}

export function onRefresh(callback) {
    document.addEventListener("refresh-data", callback);
}