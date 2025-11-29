# 部署指南

## 部署流程

### 1. 推送到 GitHub

```bash
# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Sui Chat dApp"

# 添加 remote（替换为你的 GitHub repo URL）
git remote add origin https://github.com/your-username/your-repo.git

# 推送
git push -u origin main
```

### 2. 部署到 Vercel

1. 前往 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入你的 GitHub repository
4. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `sui_hackathon`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 添加环境变量：
   - `VITE_GOOGLE_CLIENT_ID` = 你的 Google Client ID
6. 点击 "Deploy"

### 3. 设置 Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 编辑你的 OAuth 2.0 Client ID
3. 在 "Authorized redirect URIs" 中添加：
   - `https://your-app.vercel.app` (你的 Vercel URL)
   - `https://your-app.vercel.app/` (带斜线版本)
4. 保存更改

### 4. 更新 Vercel 环境变量

如果部署后需要更新环境变量：
1. 在 Vercel Dashboard 中进入项目设置
2. 前往 "Environment Variables"
3. 添加或更新 `VITE_GOOGLE_CLIENT_ID`
4. 重新部署

## 注意事项

- Vercel 会自动检测 Vite 项目
- 确保 `vercel.json` 配置正确
- 环境变量需要以 `VITE_` 开头才能在客户端访问
- Google OAuth 的重定向 URI 必须完全匹配（包括协议、域名、端口）

## 测试部署

部署完成后：
1. 访问你的 Vercel URL
2. 测试钱包连接
3. 测试 Google OAuth 登录
4. 测试创建 chatroom 和发送消息

