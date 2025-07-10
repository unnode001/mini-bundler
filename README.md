# Mini-Bundler

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-brightgreen.svg" alt="Version">
  <img src="https://img.shields.io/badge/Node.js-20+-blue.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-orange.svg" alt="PRs Welcome">
</div>

<p align="center">
   简化版 JavaScript 模块打包工具, 练手程序
   构建速度: 适用于小到中型项目
   Bundle 大小: 包含运行时约 1-2KB 开销
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#工作原理">工作原理</a> •
  <a href="#示例">示例</a> •
  <a href="#文档">文档</a>
</p>

---

## 已实现功能简述

| 功能 | 描述 | 状态 |
|------|------|------|
|  **模块打包** | 将多个 ES6 模块打包成单个文件 |
|  **依赖解析** | 自动分析和解决模块间的依赖关系 |
|  **浏览器兼容** | 生成的代码可在浏览器中直接运行 |
|  **循环依赖处理** | 使用广度优先搜索避免循环依赖问题 |
|  **AST 处理** | 使用 Babel 进行代码解析和转换 |
|  **命令行工具** | 提供简单易用的 CLI 界面 |
|  **自动化测试** | 包含完整的测试套件 |

</table>

### 本地运行

#### 环境要求

- Node 20+
- npm 或 yarn

```bash
git clone <repository-url>
cd mini-bundler
npm install
```

#### 通过配置文件启动

```bash
# 使用默认配置
npm run build
# 手动指定配置文件
node bin/mini-bundler.js -c bundler.config.js
```

#### 通过命令行参数启动

```bash
node bin/mini-bundler.js -e ./example/src/index.js -o ./example/dist -f bundle.js
```

#### 循环依赖处理测试

```bash
node bin/mini-bundler.js -c circular.config.js
```

### 运行测试命令

```bash
# 运行自动化测试
npm test

# 或者
node test.js
```

### 结果验证命令

```bash
# Node.js 环境测试
node example/dist/bundle.js

# 浏览器环境测试
# 打开 example/index.html 文件
```

### 思路参考

- 🔗 [Webpack 源码](https://github.com/webpack/webpack) - 学习真正的打包工具

## CLI 选项

```bash
Usage: mini-bundler [options]

Options:
  -V, --version          显示版本号
  -c, --config <path>    配置文件路径 (默认: "bundler.config.js")
  -e, --entry <path>     入口文件路径
  -o, --output <path>    输出目录
  -f, --filename <name>  输出文件名 (默认: "bundle.js")
  -h, --help             显示帮助信息
```

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情
