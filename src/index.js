const fs = require('fs');
const path = require('path');
const parser = require('./parser');

class Compiler {
    constructor(config) {
        this.config = config;
        // 立即将入口路径转换为绝对路径，作为唯一的起始ID
        this.entry = path.resolve(process.cwd(), config.entry);
        this.output = config.output;
        this.modules = []; // 存储所有模块对象
    }

    /**
     * 开始打包流程
     */
    run() {
        console.log('🚀 Starting mini-bundler...');
        console.log(`📁 Entry: ${this.entry}`);

        try {
            // 使用队列实现依赖图的广度优先遍历
            const queue = [this.entry];
            const processed = new Set([this.entry]); // 跟踪已处理的模块，防止循环依赖

            console.log('🔍 Building dependency graph...');

            // 1. 构建依赖图
            while (queue.length > 0) {
                const filename = queue.shift(); // 取出队首模块
                console.log(`   Processing: ${path.relative(process.cwd(), filename)}`);

                const module = this.buildModule(filename);
                this.modules.push(module);

                // 遍历当前模块的依赖
                for (const dependency of module.dependencies) {
                    // 如果依赖未被处理过，则加入队列和Set
                    if (!processed.has(dependency)) {
                        processed.add(dependency);
                        queue.push(dependency);
                        console.log(`   Found dependency: ${path.relative(process.cwd(), dependency)}`);
                    }
                }
            }

            console.log(`✅ Dependency graph built with ${this.modules.length} modules`);

            // 2. 生成最终文件
            this.emitFiles();

        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * 构建单个模块
     * @param {string} filename - 模块文件的绝对路径
     * @returns {Object} 模块对象
     */
    buildModule(filename) {
        try {
            // 检查文件是否存在
            if (!fs.existsSync(filename)) {
                throw new Error(`Module not found: ${filename}`);
            }

            const { getAST, getDependencies, transform } = parser;

            // 1. 生成 AST
            const ast = getAST(filename);

            // 2. 收集依赖（返回绝对路径）
            const dependencies = getDependencies(ast, filename);

            // 3. 转换代码（传递依赖信息）
            const code = transform(ast, filename, dependencies);

            return {
                filename,
                dependencies,
                code
            };
        } catch (error) {
            throw new Error(`Failed to build module ${filename}: ${error.message}`);
        }
    }

    /**
     * 生成并输出打包文件
     */
    emitFiles() {
        console.log('📦 Generating bundle...');

        const outputPath = path.resolve(process.cwd(), this.output.path, this.output.filename);        // 构建模块映射字符串
        let modulesForBundle = '';
        this.modules.forEach(module => {
            // 转义文件路径中的反斜杠（Windows 路径兼容）
            const escapedPath = module.filename.replace(/\\/g, '\\\\');
            // 使用 JSON.stringify 来正确转义代码字符串
            const escapedCode = JSON.stringify(module.code).slice(1, -1); // 移除外层引号

            modulesForBundle += `  '${escapedPath}': function(require, module, exports) {\neval(${JSON.stringify(module.code)});\n  },\n`;
        });

        // 生成运行时代码
        const runtimeCode = this.generateRuntime();

        const bundle = `${runtimeCode}({
${modulesForBundle}});`;

        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(outputPath, bundle, 'utf-8');

        console.log(`✅ Bundle created successfully at: ${path.relative(process.cwd(), outputPath)}`);
        console.log(`📊 Bundle size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    }

    /**
     * 生成模块加载运行时代码
     * @returns {string} 运行时代码
     */
    generateRuntime() {
        // 转义入口路径
        const escapedEntry = this.entry.replace(/\\/g, '\\\\');

        return `
(function(modules) {
    // 模块缓存
    const installedModules = {};
    
    // 模块加载函数
    function __webpack_require__(moduleId) {
        // 检查模块是否已在缓存中
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        
        // 获取模块函数
        const moduleFunction = modules[moduleId];
        if (!moduleFunction) {
            throw new Error("Cannot find module '" + moduleId + "'");
        }
        
        // 创建模块对象并缓存
        const module = installedModules[moduleId] = {
            exports: {}
        };
        
        // 执行模块函数
        try {
            moduleFunction.call(module.exports, __webpack_require__, module, module.exports);
        } catch (error) {
            // 清理缓存
            delete installedModules[moduleId];
            throw error;
        }
        
        // 返回模块的导出
        return module.exports;
    }
    
    // 启动应用程序
    return __webpack_require__('${escapedEntry}');
})`;
    }
}

module.exports = Compiler;
