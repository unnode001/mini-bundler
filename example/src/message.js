// example/src/message.js
export function getMessage() {
    return 'Hello from mini-bundler!';
}

export function getTimestamp() {
    return new Date().toISOString();
}

export const config = {
    name: 'mini-bundler',
    version: '1.0.0'
};
