# @hacxy/bump

npm 版本发布工具

## 安装

```sh
npm install @hacxy/bump -g
```

## 使用

在你的项目根目录下运行:

```sh
bump
```

## 命令行选项

你可以使用以下命令行选项来控制发布流程：

### 基本选项

- `-b, --build`: 在发布前构建包
- `-c, --changelog`: 生成变更日志
- `-g, --github`: 推送到GitHub
- `-t, --tag`: git标签

### 使用示例

```sh
# 只更新版本号，不构建、不生成变更日志、不推送到GitHub
bump

# 构建包并发布
bump --build

# 生成变更日志并发布
bump --changelog

# 构建包、生成变更日志并推送到GitHub
bump --build --changelog --github

# 使用短选项
bump -b -c -g
```

## 发布流程

1. **选择版本类型**: 选择要发布的版本类型（patch、minor、major等）
2. **选择标签**: 选择发布标签（latest、beta、alpha等）
3. **确认发布**: 确认发布信息
4. **更新版本**: 更新package.json中的版本号
5. **构建包** (可选): 如果使用`--build`选项，会运行构建命令
6. **生成变更日志** (可选): 如果使用`--changelog`选项，会生成CHANGELOG.md
7. **提交更改**: 提交版本更新和变更日志到Git
8. **发布包**: 发布包到npm
9. **推送到GitHub** (可选): 如果使用`--github`选项，会推送标签和提交到GitHub
