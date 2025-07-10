// example/src/utils.js
export function formatMessage(message) {
    return `[${new Date().toLocaleTimeString()}] ${message}`;
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
