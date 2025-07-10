// example/src/circular-a.js
import { funcB } from './circular-b.js';

export function funcA() {
    console.log('Function A called');
    return 'A';
}

export function callB() {
    return funcB();
}
