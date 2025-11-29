# zkLogin 设置指南

## 什么是 zkLogin？

zkLogin 是 Sui 的一个功能，允许用户使用 Google、Facebook、Twitch 等 Web2 身份提供商登录，而不需要传统的钱包。

## 设置步骤

### 1. 获取 Google OAuth Client ID

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API：
   - 导航到 "APIs & Services" > "Library"
   - 搜索 "Google+ API" 并启用
4. 创建 OAuth 2.0 凭据：
   - 导航到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "OAuth client ID"
   - 选择 "Web application"
   - **重要：添加授权重定向 URI**：
     - `http://localhost:5173` (开发环境)
     - `http://localhost:5173/` (带斜线版本)
     - 你的生产环境 URL（如果已部署）
5. 复制 Client ID

### 2. 设置环境变量

在 `sui_hackathon` 目录下创建 `.env` 文件：

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. 重启开发服务器

设置环境变量后，需要重启开发服务器：

```bash
npm run dev
```

## 当前实现状态

⚠️ **注意**：当前实现是简化版本，只包含 Google OAuth 流程。

完整的 zkLogin 需要：
1. **Proving Service** - 用于生成零知识证明（ZK Proof）
2. **Salt Service** - 用于生成唯一的 salt 值，确保链上地址无法追溯到用户的 Web2 凭据

这些服务通常需要部署在后端服务器上。

## 对于 Hackathon

对于 hackathon 演示，当前实现：
- ✅ 可以处理 Google OAuth 登录流程
- ✅ 可以获取 JWT token
- ✅ 可以解析用户信息

但是：
- ⚠️ 无法生成完整的 zkLogin 地址（需要 proving service）
- ⚠️ 无法创建 zkLogin 签名（需要 proving service）

## 完整实现参考

如果需要完整的 zkLogin 实现，可以参考：
- [Sui zkLogin 文档](https://docs.sui.io/concepts/cryptography/zklogin)
- [Proving Service](https://github.com/MystenLabs/sui/tree/main/apps/zklogin-prover)
- [Salt Service](https://github.com/MystenLabs/sui/tree/main/apps/zklogin-salt-provider)

## 测试

1. 设置 `VITE_GOOGLE_CLIENT_ID` 环境变量
2. 重启开发服务器
3. 点击 "Sign in with Google" 按钮
4. 完成 Google OAuth 流程
5. 应该会重定向回应用并显示用户信息

