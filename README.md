# 🎮 消除游戏 (Click Elimination Game)

一款有趣的消除类游戏，使用 Vite + React + TypeScript 构建。

## 📸 游戏截图

![游戏截图](https://github.com/user-attachments/assets/1108cf81-1bab-467e-8f0e-7a6b0f79779b)

## 🎯 游戏玩法

### 游戏目标
消除所有区域的方块即可获胜！

### 游戏规则

1. **区域 A（待消除区）**：位于顶部，包含需要被消除的方块。只能消除最下面一行的方块。

2. **暂存区 B**：位于中间，最多可容纳 7 个方块。方块上的数字（1-3）表示该方块还可以消除多少个相同颜色的区域 A 方块。

3. **区域 C（消除用）**：位于底部，点击最上面一行的方块将其移动到暂存区 B。

### 消除机制

- 点击区域 C 最上面一行的方块，将其移动到暂存区 B
- 暂存区 B 的方块会自动消除区域 A 最下面一行的相同颜色方块
- 每个暂存区方块可以消除 3 个相同颜色的区域 A 方块，然后自动移除
- 区域 A 的方块被消除后，上方方块会自动下落补位
- 区域 C 的方块被取走后，下方方块会自动上移补位

### 道具系统

- 🧹 **清除道具**：游戏开始时有 2 个清除道具
- 使用道具可以移除暂存区前 3 个方块，同时移除对应数量的区域 A 方块

### 胜负条件

- ✅ **胜利**：所有区域的方块都被消除
- ❌ **失败**：暂存区 B 被填满，且无法进行消除，且没有剩余道具

## ✨ 特性

- 🎨 精美的游戏界面
- 🔄 流畅的动画效果（Framer Motion）
- 📱 响应式设计，支持移动端
- 🎯 简单易上手的游戏机制

## 🛠️ 开发指南

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🔧 技术栈

- [Vite](https://vitejs.dev/) - 构建工具
- [React](https://react.dev/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Framer Motion](https://www.framer.com/motion/) - 动画库

## 🚀 部署

项目会在推送到 `main` 分支时自动部署到 GitHub Pages。
