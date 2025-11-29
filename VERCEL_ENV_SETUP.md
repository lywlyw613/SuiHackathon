# Vercel 环境变量设置指南

## 在 Vercel Dashboard 设置环境变量

1. 前往你的 Vercel 项目：https://vercel.com/dashboard
2. 点击你的项目 `suihackathon`
3. 进入 **Settings** > **Environment Variables**
4. 添加以下环境变量：

### 环境变量

**Key**: `VITE_GOOGLE_CLIENT_ID`  
**Value**: `3395270498-ojjjo90nf63pe067c266tdu13qj4hq1d.apps.googleusercontent.com`  
**Environment**: Production, Preview, Development（全部勾选）

5. 点击 **Save**
6. 重新部署项目（Vercel 会自动检测到新的环境变量并重新部署）

## Google OAuth 重定向 URI 设置

在 Google Cloud Console 中，确保添加了以下重定向 URI：

1. `https://suihackathon-phi.vercel.app`
2. `https://suihackathon-phi.vercel.app/`
3. `http://localhost:5173`（开发环境）

## 注意事项

- ⚠️ **Client Secret 不需要**：前端应用只需要 Client ID
- ⚠️ **不要将 Client Secret 提交到代码库**：它应该只在后端使用
- ✅ 环境变量必须以 `VITE_` 开头才能在客户端访问
- ✅ 设置环境变量后需要重新部署才能生效

## 测试

设置完成后：
1. 等待 Vercel 重新部署
2. 访问 `https://suihackathon-phi.vercel.app`
3. 点击 "Sign in with Google" 按钮
4. 应该能正常跳转到 Google 登录页面

