// example/src/test-circular.js
import { callB, funcA } from './circular-a.js';
import { callA, funcB } from './circular-b.js';

console.log('测试循环依赖:');
console.log('调用 funcA:', funcA());
console.log('调用 funcB:', funcB());
console.log('A 调用 B:', callB());
console.log('B 调用 A:', callA());
