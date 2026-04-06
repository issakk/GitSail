# GitSail - Git项目管理桌面应用

一个基于 Tauri (Rust + React) 构建的 Git 项目管理桌面应用。

## 功能特性

- 📁 **多项目管理** - 集中管理多个 Git 仓库
- 🌿 **Git 可视化** - 提交历史、分支管理、变更对比
- 📝 **内置编辑器** - 集成 Monaco Editor，支持语法高亮
- 🤖 **Claude Code 集成** - 一键启动 Claude Code，AI 辅助编程
- 🎨 **现代化 UI** - 简洁美观的界面设计

## 技术栈

- **后端**: Rust + Tauri
- **前端**: React + TypeScript + Tailwind CSS
- **Git 操作**: git2-rs (libgit2)
- **编辑器**: Monaco Editor

## 开发环境要求

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- Windows: 需要安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

## 快速开始

### 1. 安装 Rust（如果尚未安装）

```powershell
# Windows
winget install --id Rustlang.Rustup
```

安装完成后重启终端，运行：
```bash
rustup default stable
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装 Tauri CLI

```bash
cargo install tauri-cli
```

### 4. 开发运行

```bash
# 启动开发服务器
cargo tauri dev
```

### 5. 构建发布版本

```bash
# 构建可执行文件
cargo tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/` 目录。

## 项目结构

```
F:\GitSail/
├── src/                    # 前端代码 (React + TypeScript)
│   ├── components/         # 组件
│   ├── pages/             # 页面
│   ├── stores/            # 状态管理
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
├── src-tauri/             # Rust 后端代码
│   ├── src/               # Rust 源代码
│   │   ├── git/          # Git 操作模块
│   │   ├── project/      # 项目管理模块
│   │   ├── editor/       # 文件系统模块
│   │   └── claude/       # Claude Code 集成
│   ├── Cargo.toml        # Rust 依赖
│   └── tauri.conf.json   # Tauri 配置
└── package.json          # Node.js 依赖
```

## 使用 GitHub Actions 自动构建

如果你不想在本地配置开发环境，可以使用 GitHub Actions 自动构建：

### 1. Push 到 GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. 查看构建状态
- 进入 GitHub 仓库页面
- 点击 **Actions** 标签
- 查看 `Test Build` 工作流运行状态

### 3. 下载构建产物
构建完成后，在 Actions 页面点击对应的工作流运行记录，滚动到页面底部 **Artifacts** 区域下载：
- `gitsail-windows` - Windows 安装包 (.msi/.exe)
- `gitsail-linux` - Linux 安装包 (.deb/.AppImage)
- `gitsail-macos` - macOS 安装包 (.dmg)

### 4. 发布 Release（可选）
`Build GitSail` 工作流会在 push 到 main 分支时自动创建 Release，你可以在仓库的 Releases 页面找到打包好的应用。

## 开发计划

- [x] 项目初始化和基础结构
- [x] 前端界面框架
- [x] 项目管理基础功能
- [ ] 集成 Git 操作 (Rust 后端)
- [ ] 集成 Monaco Editor
- [ ] 集成 Claude Code
- [ ] 添加更多 Git 功能（rebase, stash 等）
- [ ] 插件系统
- [ ] 主题定制

## 许可证

MIT
