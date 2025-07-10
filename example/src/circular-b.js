// example/src/circular-b.js
import { funcA } from './circular-a.js';

export function funcB() {
    console.log('Function B called');
    return 'B';
}

export function callA() {
    return funcA();
}
