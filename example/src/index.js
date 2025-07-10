// example/src/index.js - 入口文件
import { config, getMessage, getTimestamp } from './message.js';
import { capitalize, formatMessage } from './utils.js';

// 主函数
function main() {
    const message = getMessage();
    const timestamp = getTimestamp();

    console.log(formatMessage(capitalize(message)));
    console.log(`应用程序启动时间: ${timestamp}`);
    console.log(`配置信息:`, config);

    // 测试现代 JavaScript 语法
    const features = ['ES6 Modules', 'Arrow Functions', 'Template Literals'];
    const result = features.map(feature => `✅ ${feature}`).join('\n');

    console.log('\n支持的功能:');
    console.log(result);
}

// 执行主函数
main();

// 导出以供其他模块使用
export { main };

