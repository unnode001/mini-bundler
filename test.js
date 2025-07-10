#!/usr/bin/env node

/**
 * Mini-Bundler 测试脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 开始 Mini-Bundler 测试...\n');

// 测试配置
const testCases = [
    {
        name: '默认配置测试',
        command: 'node bin/mini-bundler.js -c bundler.config.js',
        expectedOutput: 'example/dist/bundle.js'
    },
    {
        name: '命令行参数测试',
        command: 'node bin/mini-bundler.js -e ./example/src/index.js -o ./example/dist -f test-bundle.js',
        expectedOutput: 'example/dist/test-bundle.js'
    }
];

let passedTests = 0;
const totalTests = testCases.length;

testCases.forEach((testCase, index) => {
    console.log(`📋 测试 ${index + 1}: ${testCase.name}`);

    try {
        // 清理之前的输出文件
        if (fs.existsSync(testCase.expectedOutput)) {
            fs.unlinkSync(testCase.expectedOutput);
        }

        // 执行打包命令
        console.log(`   执行: ${testCase.command}`);
        const output = execSync(testCase.command, {
            encoding: 'utf8',
            cwd: process.cwd()
        });

        // 检查输出文件是否生成
        if (fs.existsSync(testCase.expectedOutput)) {
            console.log(`   ✅ 文件生成成功: ${testCase.expectedOutput}`);

            // 测试文件是否可执行
            try {
                const bundleOutput = execSync(`node ${testCase.expectedOutput}`, {
                    encoding: 'utf8',
                    cwd: process.cwd()
                });

                if (bundleOutput.includes('Hello from mini-bundler!')) {
                    console.log(`   ✅ Bundle 执行成功`);
                    passedTests++;
                } else {
                    console.log(`   ❌ Bundle 执行输出不符合预期`);
                }
            } catch (execError) {
                console.log(`   ❌ Bundle 执行失败: ${execError.message}`);
            }
        } else {
            console.log(`   ❌ 文件生成失败: ${testCase.expectedOutput}`);
        }

    } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message}`);
    }

    console.log('');
});

// 输出测试结果
console.log('🎯 测试总结:');
console.log(`   通过: ${passedTests}/${totalTests} 测试`);

if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！Mini-Bundler 工作正常。');
    process.exit(0);
} else {
    console.log('⚠️  部分测试失败，请检查输出。');
    process.exit(1);
}
