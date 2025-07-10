const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

module.exports = {
    /**
     * 读取文件内容并生成 AST
     * @param {string} filename - 文件的绝对路径
     * @returns {Object} AST 对象
     */
    getAST(filename) {
        try {
            const content = fs.readFileSync(filename, 'utf-8');
            return babelParser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript'] // 支持 JSX 和 TypeScript 语法
            });
        } catch (error) {
            throw new Error(`Failed to parse ${filename}: ${error.message}`);
        }
    },

    /**
     * 从 AST 中提取依赖关系，并将相对路径转换为绝对路径
     * @param {Object} ast - AST 对象
     * @param {string} filename - 当前文件的绝对路径
     * @returns {Array} 依赖文件的绝对路径数组
     */
    getDependencies(ast, filename) {
        const dependencies = [];
        const dirname = path.dirname(filename);

        traverse(ast, {
            ImportDeclaration({ node }) {
                const importPath = node.source.value;

                // 只处理相对路径导入
                if (importPath.startsWith('./') || importPath.startsWith('../')) {
                    let absolutePath = path.resolve(dirname, importPath);

                    // 如果没有扩展名，尝试添加 .js
                    if (!path.extname(absolutePath)) {
                        absolutePath += '.js';
                    }

                    dependencies.push(absolutePath);
                } else {
                    console.warn(`Warning: Skipping non-relative import "${importPath}" in ${filename}`);
                }
            },

            // 同时支持 CommonJS require() 语句
            CallExpression({ node }) {
                if (
                    node.callee.name === 'require' &&
                    node.arguments.length === 1 &&
                    node.arguments[0].type === 'StringLiteral'
                ) {
                    const requirePath = node.arguments[0].value;

                    if (requirePath.startsWith('./') || requirePath.startsWith('../')) {
                        let absolutePath = path.resolve(dirname, requirePath);

                        if (!path.extname(absolutePath)) {
                            absolutePath += '.js';
                        }

                        dependencies.push(absolutePath);
                    }
                }
            }
        });

        return dependencies;
    },

    /**
     * 将 AST 转换为 CommonJS 格式的 ES5 代码
     * @param {Object} ast - AST 对象
     * @param {string} filename - 当前文件的绝对路径
     * @param {Array} dependencies - 依赖的绝对路径数组
     * @returns {string} 转换后的代码
     */
    transform(ast, filename, dependencies) {
        try {
            // 首先转换为 CommonJS
            let { code } = babel.transformFromAstSync(ast, null, {
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            browsers: ['> 1%', 'last 2 versions']
                        },
                        modules: 'commonjs' // 转换为 CommonJS 模块格式
                    }]
                ]
            });

            // 建立从相对路径到绝对路径的映射
            const dirname = path.dirname(filename);
            const pathMapping = new Map();

            // 遍历原始 AST 获取导入信息
            traverse(ast, {
                ImportDeclaration({ node }) {
                    const importPath = node.source.value;
                    if (importPath.startsWith('./') || importPath.startsWith('../')) {
                        let absolutePath = path.resolve(dirname, importPath);
                        if (!path.extname(absolutePath)) {
                            absolutePath += '.js';
                        }
                        pathMapping.set(importPath, absolutePath);
                    }
                }
            });

            // 替换代码中的 require 路径
            for (const [relativePath, absolutePath] of pathMapping) {
                // Windows 路径转义
                const escapedAbsolutePath = absolutePath.replace(/\\/g, '\\\\');
                // 转义特殊字符用于正则表达式
                const escapedRelativePath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // 替换所有形式的 require 调用
                const patterns = [
                    new RegExp(`require\\("${escapedRelativePath}"\\)`, 'g'),
                    new RegExp(`require\\('${escapedRelativePath}'\\)`, 'g')
                ];

                patterns.forEach(pattern => {
                    code = code.replace(pattern, `require('${escapedAbsolutePath}')`);
                });
            }

            return code;
        } catch (error) {
            throw new Error(`Failed to transform code: ${error.message}`);
        }
    }
};
