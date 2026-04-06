# GitSail - Git项目管理桌面应用

## 项目概述
一个基于 Tauri (Rust + Web前端) 的桌面应用，用于管理多个Git项目，提供基础Git操作、代码编辑、轻量级项目管理和Claude Code集成。

## 技术栈
- **后端**: Rust + Tauri
- **前端**: React + TypeScript + Tailwind CSS
- **Git操作**: git2-rs (libgit2的Rust绑定)
- **编辑器**: Monaco Editor (VS Code同款)

## 核心功能模块

### 1. 项目管理
- 添加/删除/导入项目
- 项目列表视图（卡片/列表）
- 项目分类/标签
- 最近打开的项目

### 2. Git功能
- 可视化提交历史（git log --graph）
- 分支管理（创建/切换/合并/删除）
- 基础操作（pull/push/fetch/commit/stash）
- 变更对比（diff）
- 冲突解决
- 远程仓库管理

### 3. 编辑器功能
- 集成 Monaco Editor
- 语法高亮
- 文件树浏览
- 快速文件搜索
- 多标签页

### 4. Claude Code 集成
- 一键在当前项目启动 Claude Code
- 集成终端面板
- 快捷命令发送

## 项目结构
```
F:\GitSail/
├── src/                    # 前端代码 (React + TS)
│   ├── components/         # 通用组件
│   ├── pages/             # 页面组件
│   ├── stores/            # 状态管理 (Zustand)
│   ├── hooks/             # 自定义Hooks
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript类型
├── src-tauri/             # Tauri/Rust 后端
│   ├── src/
│   │   ├── main.rs        # 入口
│   │   ├── git/           # Git操作模块
│   │   ├── project/       # 项目管理模块
│   │   ├── editor/        # 文件读写模块
│   │   ├── claude/        # Claude Code集成
│   │   └── commands.rs    # Tauri命令定义
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── CLAUDE.md
```

## 开发计划
1. 初始化Tauri项目
2. 搭建前端框架（路由、状态管理、UI组件库）
3. 实现项目管理（增删改查）
4. 集成Git操作
5. 集成Monaco Editor
6. 集成Claude Code
7. 优化和打包

## 数据存储
- 项目配置：使用 Tauri 的持久化存储 (tauri-plugin-store)
- 不依赖外部数据库，保持轻量

## Claude Code 启动方式
- 检测系统是否安装 Claude Code
- 在项目目录下启动新终端并运行 `claude`
- 或者通过子进程方式集成
