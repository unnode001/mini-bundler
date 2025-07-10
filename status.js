#!/usr/bin/env node

/**
 * 项目状态检查脚本
 * 检查项目是否设置正确，所有文件是否存在
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Mini-Bundler 项目状态...\n');

// 必需的文件和目录
const requiredFiles = [
    'package.json',
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    '.gitignore',
    'bin/mini-bundler.js',
    'src/index.js',
    'src/parser.js',
    'bundler.config.js',
    'circular.config.js',
    'test.js',
    'docs/开发文档.md',
    'example/src/index.js',
    'example/src/message.js',
    'example/src/utils.js',
    'example/src/circular-a.js',
    'example/src/circular-b.js',
    'example/src/test-circular.js',
    'example/index.html'
];

const requiredDirectories = [
    'bin',
    'src',
    'docs',
    'example',
    'example/src',
    'example/dist'
];

let allGood = true;

// 检查目录
console.log('📁 检查目录结构:');
requiredDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`   ✅ ${dir}/`);
    } else {
        console.log(`   ❌ ${dir}/ (缺失)`);
        allGood = false;
    }
});

console.log('\n📄 检查必需文件:');
// 检查文件
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`   ✅ ${file} (${size} KB)`);
    } else {
        console.log(`   ❌ ${file} (缺失)`);
        allGood = false;
    }
});

// 检查 package.json 配置
console.log('\n⚙️  检查 package.json 配置:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const checks = [
        { name: 'name', value: pkg.name, expected: 'mini-bundler' },
        { name: 'version', value: pkg.version, required: true },
        { name: 'description', value: pkg.description, required: true },
        { name: 'main', value: pkg.main, expected: 'src/index.js' },
        { name: 'bin', value: pkg.bin, required: true },
        { name: 'scripts', value: pkg.scripts, required: true },
        { name: 'dependencies', value: pkg.dependencies, required: true },
        { name: 'license', value: pkg.license, expected: 'MIT' }
    ];

    checks.forEach(check => {
        if (check.expected && check.value === check.expected) {
            console.log(`   ✅ ${check.name}: ${check.value}`);
        } else if (check.required && check.value) {
            console.log(`   ✅ ${check.name}: 已配置`);
        } else if (check.required) {
            console.log(`   ❌ ${check.name}: 缺失或配置错误`);
            allGood = false;
        }
    });

    // 检查脚本
    const requiredScripts = ['test', 'build', 'example', 'help'];
    requiredScripts.forEach(script => {
        if (pkg.scripts && pkg.scripts[script]) {
            console.log(`   ✅ 脚本 ${script}: 已配置`);
        } else {
            console.log(`   ❌ 脚本 ${script}: 缺失`);
            allGood = false;
        }
    });

} catch (error) {
    console.log(`   ❌ package.json 解析失败: ${error.message}`);
    allGood = false;
}

// 检查依赖是否已安装
console.log('\n📦 检查依赖安装状态:');
if (fs.existsSync('node_modules')) {
    const nodeModulesSize = getDirSize('node_modules');
    console.log(`   ✅ node_modules 存在 (${(nodeModulesSize / 1024 / 1024).toFixed(2)} MB)`);

    const requiredDeps = ['@babel/core', '@babel/parser', '@babel/traverse', 'commander'];
    requiredDeps.forEach(dep => {
        if (fs.existsSync(`node_modules/${dep}`)) {
            console.log(`   ✅ ${dep}: 已安装`);
        } else {
            console.log(`   ❌ ${dep}: 未安装`);
            allGood = false;
        }
    });
} else {
    console.log('   ❌ node_modules 不存在，请运行 npm install');
    allGood = false;
}

// 检查生成的文件
console.log('\n🎯 检查示例输出:');
const outputFiles = [
    'example/dist/bundle.js',
    'example/dist/circular-bundle.js'
];

outputFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`   ✅ ${file} (${size} KB)`);
    } else {
        console.log(`   ⚠️  ${file} (未生成，运行 npm run build 来创建)`);
    }
});

// 总结
console.log('\n' + '='.repeat(50));
if (allGood) {
    console.log('🎉 项目状态良好！所有必需的文件和配置都已就位。');
    console.log('\n📋 下一步操作:');
    console.log('   • 运行 npm test 进行测试');
    console.log('   • 运行 npm run example 查看示例');
    console.log('   • 运行 npm run help 查看帮助');
} else {
    console.log('⚠️  项目配置不完整，请检查上述错误。');
    console.log('\n🔧 建议操作:');
    console.log('   • 运行 npm install 安装依赖');
    console.log('   • 检查缺失的文件和目录');
    console.log('   • 确保所有配置正确');
}

console.log('\n💡 有用的命令:');
console.log('   npm run build     - 构建默认示例');
console.log('   npm run example   - 构建并运行示例');
console.log('   npm test          - 运行测试套件');
console.log('   npm run help      - 显示帮助信息');

// 辅助函数：计算目录大小
function getDirSize(dirPath) {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                size += stats.size;
            }
        });
    } catch (error) {
        // 忽略权限错误等
    }
    return size;
}
