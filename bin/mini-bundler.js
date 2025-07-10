#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const Compiler = require('../src/index');

const program = new Command();

program
    .name('mini-bundler')
    .description('A simplified JavaScript module bundler for educational purposes')
    .version('1.0.0');

program
    .option('-c, --config <path>', 'path to config file', 'bundler.config.js')
    .option('-e, --entry <path>', 'entry file path')
    .option('-o, --output <path>', 'output directory')
    .option('-f, --filename <name>', 'output filename', 'bundle.js')
    .action((options) => {
        try {
            let config = {};

            // 尝试加载配置文件
            const configPath = path.resolve(process.cwd(), options.config);
            if (fs.existsSync(configPath)) {
                console.log(`📋 Loading config from: ${options.config}`);
                config = require(configPath);
            } else if (options.config !== 'bundler.config.js') {
                // 如果用户指定了配置文件但文件不存在，抛出错误
                throw new Error(`Config file not found: ${configPath}`);
            }

            // 命令行参数覆盖配置文件
            if (options.entry) {
                config.entry = options.entry;
            }

            if (options.output || options.filename) {
                config.output = config.output || {};
                if (options.output) {
                    config.output.path = options.output;
                }
                if (options.filename !== 'bundle.js') { // 只有当明确指定filename时才覆盖
                    config.output.filename = options.filename;
                }
            }

            // 验证必需的配置
            if (!config.entry) {
                throw new Error('Entry file is required. Please specify it in config file or use --entry option.');
            }

            if (!config.output) {
                config.output = {
                    path: './dist',
                    filename: 'bundle.js'
                };
            }

            console.log('🔧 Configuration:');
            console.log(`   Entry: ${config.entry}`);
            console.log(`   Output: ${config.output.path}/${config.output.filename}`);
            console.log('');

            // 创建编译器实例并运行
            const compiler = new Compiler(config);
            compiler.run();

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

// 如果没有提供参数，显示帮助
if (process.argv.length <= 2) {
    program.help();
}

program.parse();
